import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import {
  formatPhoneNumber,
  generateAccessToken,
  generateRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ANONYMOUS_TOKEN_COOKIE,
  COOKIE_OPTIONS,
} from '@/shared/lib/auth'
import { linkAnonymousToUser } from '@/shared/lib/anonymous'

// Схема валидации
const verifyOTPSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация данных
    const validationResult = verifyOTPSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Неверный формат данных', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { phone, code } = validationResult.data
    const formattedPhone = formatPhoneNumber(phone)

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Находим актуальный OTP код
    const otpCode = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    if (!otpCode) {
      // Увеличиваем счетчик попыток для последнего кода
      await prisma.otpCode.updateMany({
        where: {
          userId: user.id,
          expiresAt: {
            gte: new Date(),
          },
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({ error: 'Неверный или истекший код' }, { status: 400 })
    }

    // Проверяем количество попыток
    if (otpCode.attempts >= 5) {
      return NextResponse.json(
        { error: 'Превышено количество попыток. Запросите новый код.' },
        { status: 429 }
      )
    }

    // Код верный - деактивируем его
    await prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { expiresAt: new Date() },
    })

    // Обновляем данные пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
      },
    })

    // Получаем анонимный токен из cookie
    const cookieStore = await cookies()
    const anonymousToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value

    // Связываем анонимного пользователя с реальным
    if (anonymousToken) {
      const anonymousUser = await prisma.anonymousUser.findUnique({
        where: { token: anonymousToken },
      })

      if (anonymousUser && !anonymousUser.userId) {
        console.log('🔗 Linking anonymous user to real user:')
        console.log(`  Anonymous ID: ${anonymousUser.id}`)
        console.log(`  User ID: ${user.id}`)

        const linked = await linkAnonymousToUser(anonymousUser.id, user.id)

        if (linked) {
          console.log('✅ Successfully linked anonymous user')
        } else {
          console.log('❌ Failed to link anonymous user')
        }
      }
    }

    // Генерируем токены
    const accessToken = generateAccessToken(user.id, user.role)
    const refreshToken = generateRefreshToken(user.id, user.role)

    // Устанавливаем токены в cookies
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    })

    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    })

    // Удаляем анонимный токен
    cookieStore.delete(ANONYMOUS_TOKEN_COOKIE)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

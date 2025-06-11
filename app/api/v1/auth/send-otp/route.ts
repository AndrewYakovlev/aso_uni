import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/shared/lib/prisma'
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  generateOTPCode,
  OTP_CODE_LIFETIME,
} from '@/shared/lib/auth'
import { sendOTPCode } from '@/shared/lib/sms'

// Схема валидации
const sendOTPSchema = z.object({
  phone: z.string().min(10, 'Неверный формат телефона'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация данных
    const validationResult = sendOTPSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Неверный формат данных', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { phone } = validationResult.data
    const formattedPhone = formatPhoneNumber(phone)

    // Проверка формата телефона
    if (!isValidPhoneNumber(formattedPhone)) {
      return NextResponse.json({ error: 'Неверный формат телефона' }, { status: 400 })
    }

    // Создаем или находим пользователя
    const user = await prisma.user.upsert({
      where: { phone: formattedPhone },
      update: {
        lastActivityAt: new Date(),
      },
      create: {
        phone: formattedPhone,
        role: 'CUSTOMER',
      },
    })

    // Проверяем, не слишком ли часто отправляются коды
    const recentOTP = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // Последняя минута
        },
      },
    })

    if (recentOTP) {
      return NextResponse.json(
        { error: 'Подождите минуту перед повторной отправкой кода' },
        { status: 429 }
      )
    }

    // Деактивируем старые коды
    await prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        expiresAt: {
          gte: new Date(),
        },
      },
      data: {
        expiresAt: new Date(),
      },
    })

    // Генерируем новый код
    const code = generateOTPCode()
    const expiresAt = new Date(Date.now() + OTP_CODE_LIFETIME)

    // Сохраняем код в БД
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    })

    // Отправляем SMS
    const smsResult = await sendOTPCode(formattedPhone, code)

    if (!smsResult.success) {
      return NextResponse.json({ error: 'Ошибка отправки SMS. Попробуйте позже.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен',
      maskedPhone: formattedPhone.replace(
        /(\+\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/,
        '$1 $2 *** ** $5'
      ),
    })
  } catch (error) {
    console.error('Error in send-otp:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { createAccessToken, createRefreshToken } from '@/shared/lib/auth/jwt'
import { setAuthCookies, getTokenFromCookie, COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { mergeAnonymousDataToUser } from '@/shared/lib/auth/merge-user-data'
import { verifyOTPSchema } from '@/shared/lib/validation/auth'
import { successResponse, errorResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { ERROR_CODES, ApiError } from '@/shared/types'
import { AUTH } from '@/shared/constants'

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Валидация входных данных
  const body = await request.json()
  const validationResult = verifyOTPSchema.safeParse(body)

  if (!validationResult.success) {
    throw new ApiError(
      ERROR_CODES.VALIDATION_ERROR,
      'Неверные данные',
      400,
      validationResult.error.flatten()
    )
  }

  const { phone, code, firstName, lastName, email } = validationResult.data

  // Ищем код в БД
  const otpCode = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      expiresAt: { gt: new Date() },
      attempts: { lt: AUTH.MAX_OTP_ATTEMPTS },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpCode) {
    // Увеличиваем счетчик попыток для всех кодов этого номера
    await prisma.otpCode.updateMany({
      where: {
        phone,
        expiresAt: { gt: new Date() },
      },
      data: {
        attempts: { increment: 1 },
      },
    })

    return errorResponse(ERROR_CODES.INVALID_CREDENTIALS, 'Неверный код подтверждения', 401)
  }

  // Код верный, удаляем все OTP коды для этого номера
  await prisma.otpCode.deleteMany({
    where: { phone },
  })

  // Получаем анонимный токен если есть
  const anonymousToken = await getTokenFromCookie(COOKIE_NAMES.ANONYMOUS_TOKEN)
  let anonymousId: string | null = null

  if (anonymousToken) {
    // Находим анонимного пользователя
    const anonymousUser = await prisma.anonymousUser.findUnique({
      where: { sessionId: anonymousToken },
    })

    if (anonymousUser) {
      anonymousId = anonymousUser.id
    }
  }

  // Ищем или создаем пользователя
  let user = await prisma.user.findUnique({
    where: { phone },
  })

  if (!user) {
    // Создаем нового пользователя
    user = await prisma.user.create({
      data: {
        phone,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        role: 'CUSTOMER',
      },
    })

    console.log(`👤 Создан новый пользователь: ${phone}`)
  } else {
    // Обновляем данные существующего пользователя если переданы
    if (firstName || lastName || email) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
        },
      })
    }

    console.log(`👤 Авторизован существующий пользователь: ${phone}`)
  }

  // Если был анонимный пользователь, сливаем данные
  if (anonymousId) {
    try {
      await mergeAnonymousDataToUser(user.id, anonymousId)
      console.log(`🔄 Данные анонимного пользователя перенесены`)
    } catch (error) {
      // Не прерываем авторизацию если слияние не удалось
      console.error('Ошибка при слиянии данных:', error)
    }
  }

  // Создаем JWT токены
  const payload = {
    sub: user.id,
    role: user.role,
    type: 'user' as const,
  }

  const accessToken = await createAccessToken(payload)
  const refreshToken = await createRefreshToken(payload)

  // Устанавливаем cookies
  await setAuthCookies(accessToken, refreshToken)

  // Возвращаем данные пользователя
  return successResponse({
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  })
})

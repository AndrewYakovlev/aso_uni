import { NextRequest } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { cache } from '@/shared/lib/redis'
import { smsClient, SMSClient } from '@/shared/lib/sms/sms-client'
import { sendOTPSchema } from '@/shared/lib/validation/auth'
import { successResponse, errorResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { ERROR_CODES, ApiError } from '@/shared/types'
import { AUTH, CACHE_KEYS, CACHE_TTL } from '@/shared/constants'

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Валидация входных данных
  const body = await request.json()
  const validationResult = sendOTPSchema.safeParse(body)

  if (!validationResult.success) {
    throw new ApiError(
      ERROR_CODES.VALIDATION_ERROR,
      'Неверные данные',
      400,
      validationResult.error.flatten()
    )
  }

  const { phone } = validationResult.data

  // Проверяем rate limiting через Redis
  const rateLimitKey = `otp_rate_limit:${phone}`
  const attempts = await cache.get<number>(rateLimitKey)

  if (attempts && attempts >= 3) {
    return errorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      'Слишком много попыток. Попробуйте позже.',
      429
    )
  }

  // Проверяем, не отправляли ли мы код недавно
  const recentOTPKey = `otp_recent:${phone}`
  const recentOTP = await cache.get<boolean>(recentOTPKey)

  if (recentOTP) {
    return errorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      'Код уже был отправлен. Подождите минуту перед повторной отправкой.',
      429
    )
  }

  // Удаляем старые неиспользованные коды для этого номера
  await prisma.otpCode.deleteMany({
    where: {
      phone,
      OR: [{ expiresAt: { lt: new Date() } }, { attempts: { gte: AUTH.MAX_OTP_ATTEMPTS } }],
    },
  })

  // Генерируем новый код
  const code = SMSClient.generateOTP()
  const expiresAt = new Date(Date.now() + AUTH.OTP_EXPIRES_IN)

  // Сохраняем код в БД
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt,
      attempts: 0,
    },
  })

  // Отправляем SMS
  const sent = await smsClient.sendOTP(phone, code)

  if (!sent) {
    // Если не удалось отправить, удаляем код из БД
    await prisma.otpCode.deleteMany({
      where: { phone, code },
    })

    throw new ApiError(
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      'Не удалось отправить SMS. Попробуйте позже.',
      500
    )
  }

  // Устанавливаем rate limiting
  await cache.set(rateLimitKey, (attempts || 0) + 1, 60 * 15) // 15 минут
  await cache.set(recentOTPKey, true, 60) // 1 минута между отправками

  // Логируем событие
  console.log(`📱 OTP отправлен на ${phone}`)

  return successResponse({
    success: true,
    message: 'Код подтверждения отправлен',
    // В production не отправляем время истечения
    expiresIn: process.env.NODE_ENV === 'development' ? AUTH.OTP_EXPIRES_IN / 1000 : undefined,
  })
})

import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { nanoid } from 'nanoid'
import { prisma } from '@/shared/lib/prisma'
import { setTokenCookie, COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { successResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { AUTH } from '@/shared/constants'

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Получаем IP адрес и User-Agent
  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Генерируем уникальный session ID с помощью nanoid
  // Формат: anon_<timestamp>_<random> для лучшей читаемости в логах
  const timestamp = Date.now().toString(36)
  const randomPart = nanoid(16)
  const sessionId = `anon_${timestamp}_${randomPart}`

  // Создаем анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.create({
    data: {
      sessionId,
      ipAddress: ipAddress.split(',')[0].trim(), // Берем первый IP если их несколько
      userAgent: userAgent.substring(0, 500), // Ограничиваем длину
    },
  })

  // Устанавливаем cookies на 365 дней
  await setTokenCookie(COOKIE_NAMES.ANONYMOUS_TOKEN, sessionId, AUTH.ANONYMOUS_TOKEN_EXPIRES_IN)
  await setTokenCookie(COOKIE_NAMES.SESSION_ID, sessionId, AUTH.ANONYMOUS_TOKEN_EXPIRES_IN)

  return successResponse({
    anonymousUser: {
      id: anonymousUser.id,
      sessionId: anonymousUser.sessionId,
    },
  })
})

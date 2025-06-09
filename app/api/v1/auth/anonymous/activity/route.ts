import { prisma } from '@/shared/lib/prisma'
import { getTokenFromCookie, setTokenCookie, COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { successResponse, errorResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { ERROR_CODES } from '@/shared/types'
import { AUTH } from '@/shared/constants'

export const POST = withErrorHandler(async () => {
  // Получаем токен из cookie
  const sessionId = await getTokenFromCookie(COOKIE_NAMES.ANONYMOUS_TOKEN)

  if (!sessionId) {
    return errorResponse(ERROR_CODES.UNAUTHORIZED, 'Анонимный токен не найден', 401)
  }

  // Проверяем существование анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { sessionId },
  })

  if (!anonymousUser) {
    return errorResponse(ERROR_CODES.NOT_FOUND, 'Анонимный пользователь не найден', 404)
  }

  // Обновляем lastActivity
  await prisma.anonymousUser.update({
    where: { id: anonymousUser.id },
    data: { lastActivity: new Date() },
  })

  // Обновляем срок жизни cookie на следующие 365 дней
  await setTokenCookie(COOKIE_NAMES.ANONYMOUS_TOKEN, sessionId, AUTH.ANONYMOUS_TOKEN_EXPIRES_IN)
  await setTokenCookie(COOKIE_NAMES.SESSION_ID, sessionId, AUTH.ANONYMOUS_TOKEN_EXPIRES_IN)

  return successResponse({
    success: true,
    anonymousId: anonymousUser.id,
  })
})

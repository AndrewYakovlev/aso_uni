import { prisma } from '@/shared/lib/prisma'
import { verifyRefreshToken, createAccessToken, createRefreshToken } from '@/shared/lib/auth/jwt'
import { getTokenFromCookie, setAuthCookies, COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { successResponse, errorResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { ERROR_CODES } from '@/shared/types'

export const POST = withErrorHandler(async () => {
  // Получаем refresh token из cookies
  const refreshToken = await getTokenFromCookie(COOKIE_NAMES.REFRESH_TOKEN)

  if (!refreshToken) {
    return errorResponse(ERROR_CODES.UNAUTHORIZED, 'Refresh token не найден', 401)
  }

  // Проверяем refresh token
  const payload = await verifyRefreshToken(refreshToken)

  if (!payload || payload.type !== 'user') {
    return errorResponse(ERROR_CODES.TOKEN_INVALID, 'Неверный refresh token', 401)
  }

  // Проверяем существование пользователя
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      phone: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      deletedAt: true,
    },
  })

  if (!user || user.deletedAt) {
    return errorResponse(ERROR_CODES.NOT_FOUND, 'Пользователь не найден', 404)
  }

  // Создаем новые токены
  const newPayload = {
    sub: user.id,
    role: user.role,
    type: 'user' as const,
  }

  const newAccessToken = await createAccessToken(newPayload)
  const newRefreshToken = await createRefreshToken(newPayload)

  // Устанавливаем новые cookies
  await setAuthCookies(newAccessToken, newRefreshToken)

  console.log(`🔄 Токены обновлены для пользователя ${user.phone}`)

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
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  })
})

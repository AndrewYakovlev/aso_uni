import { getCurrentUser } from '@/shared/lib/auth/get-current-user'
import { successResponse, errorResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { ERROR_CODES } from '@/shared/types'

export const GET = withErrorHandler(async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return errorResponse(ERROR_CODES.UNAUTHORIZED, 'Пользователь не найден', 401)
  }

  // Возвращаем данные в зависимости от типа пользователя
  if (currentUser.type === 'user') {
    return successResponse({
      type: 'user',
      user: {
        id: currentUser.user!.id,
        phone: currentUser.user!.phone,
        email: currentUser.user!.email,
        firstName: currentUser.user!.firstName,
        lastName: currentUser.user!.lastName,
        role: currentUser.user!.role,
      },
    })
  } else {
    return successResponse({
      type: 'anonymous',
      anonymousUser: {
        id: currentUser.anonymousUser!.id,
        sessionId: currentUser.anonymousUser!.sessionId,
      },
    })
  }
})

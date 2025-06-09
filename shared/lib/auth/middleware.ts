import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from './get-current-user'
import { errorResponse } from '@/shared/lib/api-errors'
import { ERROR_CODES } from '@/shared/types'
import { UserRole } from '@prisma/client'

/**
 * Middleware для проверки авторизации в API routes
 */
export async function requireAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.type !== 'user') {
      return errorResponse(ERROR_CODES.UNAUTHORIZED, 'Требуется авторизация', 401)
    }

    // Добавляем пользователя в request для использования в handler
    ;(request as any).user = currentUser.user

    return handler(request, context)
  }
}

/**
 * Middleware для проверки роли пользователя
 */
export function requireRole(roles: UserRole[]) {
  return (handler: (request: NextRequest, context?: any) => Promise<NextResponse>) => {
    return requireAuth(async (request: NextRequest, context?: any) => {
      const user = (request as any).user

      if (!roles.includes(user.role)) {
        return errorResponse(ERROR_CODES.FORBIDDEN, 'Недостаточно прав', 403)
      }

      return handler(request, context)
    })
  }
}

/**
 * Middleware для менеджеров и админов
 */
export const requireManager = requireRole(['MANAGER', 'ADMIN'])

/**
 * Middleware только для админов
 */
export const requireAdmin = requireRole(['ADMIN'])

/**
 * Получение пользователя из request (для использования в handlers)
 */
export function getRequestUser(request: NextRequest) {
  return (request as any).user
}

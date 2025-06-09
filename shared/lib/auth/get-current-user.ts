import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import { verifyToken } from '@/shared/lib/auth/jwt'
import { COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { User, AnonymousUser } from '@prisma/client'

export interface CurrentUser {
  type: 'user' | 'anonymous'
  user?: Pick<
    User,
    | 'id'
    | 'phone'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'personalDiscount'
    | 'customerGroupId'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
  >
  anonymousUser?: AnonymousUser
  id: string
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN' | 'ANONYMOUS'
}

// Получение текущего пользователя (авторизованного или анонимного)
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()

  // Сначала проверяем access token
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value

  if (accessToken) {
    const payload = await verifyToken(accessToken)

    if (payload && payload.type === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          personalDiscount: true,
          customerGroupId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      })

      if (user && !user.deletedAt) {
        return {
          type: 'user',
          user,
          id: user.id,
          role: user.role,
        }
      }
    }
  }

  // Если нет access token или он невалидный, проверяем анонимный токен
  const anonymousToken = cookieStore.get(COOKIE_NAMES.ANONYMOUS_TOKEN)?.value

  if (anonymousToken) {
    // Анонимный токен - это просто sessionId
    const anonymousUser = await prisma.anonymousUser.findUnique({
      where: { sessionId: anonymousToken },
    })

    if (anonymousUser) {
      // Обновляем lastActivity (можно делать не на каждый запрос для оптимизации)
      await prisma.anonymousUser.update({
        where: { id: anonymousUser.id },
        data: { lastActivity: new Date() },
      })

      return {
        type: 'anonymous',
        anonymousUser,
        id: anonymousUser.id,
        role: 'ANONYMOUS',
      }
    }
  }

  return null
}

// Получение ID текущего пользователя (для использования в запросах)
export async function getCurrentUserId(): Promise<{
  userId?: string
  anonymousId?: string
} | null> {
  const currentUser = await getCurrentUser()

  if (!currentUser) return null

  if (currentUser.type === 'user') {
    return { userId: currentUser.id }
  } else {
    return { anonymousId: currentUser.id }
  }
}

// Проверка, является ли текущий пользователь админом
export async function isAdmin(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.role === 'ADMIN'
}

// Проверка, является ли текущий пользователь менеджером или админом
export async function isManager(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN'
}

// Проверка, авторизован ли пользователь
export async function isAuthenticatedUser(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.type === 'user'
}

// Получение корзины текущего пользователя
export async function getCurrentUserCart() {
  const userIds = await getCurrentUserId()

  if (!userIds) return null

  return await prisma.cart.findFirst({
    where: {
      OR: [{ userId: userIds.userId }, { anonymousId: userIds.anonymousId }],
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })
}

// Обновление lastActivity для анонимного пользователя
export async function updateAnonymousActivity(anonymousId: string): Promise<void> {
  await prisma.anonymousUser.update({
    where: { id: anonymousId },
    data: { lastActivity: new Date() },
  })
}

import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import {
  generateAnonymousToken,
  generateSessionId,
  ANONYMOUS_TOKEN_COOKIE,
  ANONYMOUS_TOKEN_MAX_AGE,
  COOKIE_OPTIONS,
} from '@/shared/lib/auth'
import { generateSecureAnonymousToken, generateSecureSessionId } from '@/shared/lib/server-utils'

export interface AnonymousUser {
  id: string
  token: string
  sessionId: string
  userId?: string | null
}

/**
 * Получить или создать анонимного пользователя
 */
export async function getOrCreateAnonymousUser(
  ipAddress?: string,
  userAgent?: string
): Promise<AnonymousUser | null> {
  try {
    const cookieStore = await cookies()
    const existingToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value

    console.log('🔍 getOrCreateAnonymousUser called:', {
      hasExistingToken: !!existingToken,
      ipAddress,
      userAgentLength: userAgent?.length,
    })

    // Если есть токен, пытаемся найти пользователя
    if (existingToken) {
      console.log(
        '🔍 Looking for existing anonymous user with token:',
        existingToken.substring(0, 8) + '...'
      )

      const anonymousUser = await prisma.anonymousUser.findUnique({
        where: { token: existingToken },
        select: {
          id: true,
          token: true,
          sessionId: true,
          userId: true,
        },
      })

      if (anonymousUser) {
        // Обновляем последнюю активность
        await prisma.anonymousUser.update({
          where: { id: anonymousUser.id },
          data: { lastActivity: new Date() },
        })

        // Продлеваем cookie
        cookieStore.set(ANONYMOUS_TOKEN_COOKIE, existingToken, {
          ...COOKIE_OPTIONS,
          maxAge: ANONYMOUS_TOKEN_MAX_AGE,
        })

        console.log('📱 Found existing anonymous user:', {
          id: anonymousUser.id,
          sessionId: anonymousUser.sessionId,
          userId: anonymousUser.userId,
        })

        return anonymousUser
      } else {
        console.log('❌ Token exists in cookie but user not found in DB')
      }
    }

    // Создаем нового анонимного пользователя
    const token = generateSecureAnonymousToken()
    const sessionId = generateSecureSessionId()

    console.log('🆕 Creating new anonymous user with token:', token.substring(0, 8) + '...')

    const newAnonymousUser = await prisma.anonymousUser.create({
      data: {
        token,
        sessionId,
        ipAddress,
        userAgent,
      },
      select: {
        id: true,
        token: true,
        sessionId: true,
        userId: true,
      },
    })

    // Устанавливаем cookie
    cookieStore.set(ANONYMOUS_TOKEN_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: ANONYMOUS_TOKEN_MAX_AGE,
    })

    console.log('🆕 Created new anonymous user:', {
      id: newAnonymousUser.id,
      sessionId: newAnonymousUser.sessionId,
      token: token.substring(0, 8) + '...',
    })

    return newAnonymousUser
  } catch (error) {
    console.error('❌ Error in getOrCreateAnonymousUser:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
    return null
  }
}

/**
 * Связать анонимного пользователя с реальным пользователем
 */
export async function linkAnonymousToUser(anonymousId: string, userId: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      // Связываем анонимного пользователя
      await tx.anonymousUser.update({
        where: { id: anonymousId },
        data: { userId },
      })

      // Переносим корзину
      await tx.cart.updateMany({
        where: {
          anonymousId,
          userId: null,
        },
        data: {
          userId,
          anonymousId: null,
        },
      })

      // Переносим избранное
      const anonymousFavorites = await tx.favorite.findMany({
        where: { anonymousId },
      })

      for (const fav of anonymousFavorites) {
        // Проверяем, нет ли уже такого избранного у пользователя
        const existingFav = await tx.favorite.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: fav.productId,
            },
          },
        })

        if (!existingFav) {
          await tx.favorite.create({
            data: {
              userId,
              productId: fav.productId,
            },
          })
        }
      }

      // Переносим историю просмотров
      await tx.viewHistory.updateMany({
        where: {
          anonymousId,
          userId: null,
        },
        data: {
          userId,
          anonymousId: null,
        },
      })

      // Переносим историю поиска
      await tx.searchHistory.updateMany({
        where: {
          anonymousId,
          userId: null,
        },
        data: {
          userId,
          anonymousId: null,
        },
      })

      // Переносим чаты
      await tx.chat.updateMany({
        where: {
          anonymousId,
          userId: null,
        },
        data: {
          userId,
          anonymousId: null,
        },
      })
    })

    return true
  } catch (error) {
    console.error('Error linking anonymous to user:', error)
    return false
  }
}

/**
 * Очистить cookie анонимного пользователя
 */
export async function clearAnonymousCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ANONYMOUS_TOKEN_COOKIE)
}

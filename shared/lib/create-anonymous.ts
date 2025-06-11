import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import { ANONYMOUS_TOKEN_COOKIE, ANONYMOUS_TOKEN_MAX_AGE, COOKIE_OPTIONS } from '@/shared/lib/auth'
import { generateSecureAnonymousToken, generateSecureSessionId } from '@/shared/lib/server-utils'

export interface AnonymousUser {
  id: string
  token: string
  sessionId: string
  userId?: string | null
}

/**
 * Создать нового анонимного пользователя
 * Используется только в API routes
 */
export async function createAnonymousUser(
  ipAddress?: string,
  userAgent?: string
): Promise<AnonymousUser | null> {
  try {
    const cookieStore = await cookies()

    // Генерируем новые токены
    const token = generateSecureAnonymousToken()
    const sessionId = generateSecureSessionId()

    console.log('🆕 Creating new anonymous user with token:', token.substring(0, 8) + '...')

    // Создаем пользователя в БД
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

    console.log('✅ Created new anonymous user:', {
      id: newAnonymousUser.id,
      sessionId: newAnonymousUser.sessionId,
      token: token.substring(0, 8) + '...',
    })

    return newAnonymousUser
  } catch (error) {
    console.error('❌ Error in createAnonymousUser:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
    return null
  }
}

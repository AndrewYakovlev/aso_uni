import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import { verifyToken, ACCESS_TOKEN_COOKIE, ANONYMOUS_TOKEN_COOKIE } from '@/shared/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    const anonymousToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value

    let userId: string | null = null

    // Проверяем авторизацию
    if (accessToken) {
      const payload = verifyToken(accessToken)
      if (payload && payload.type === 'access') {
        userId = payload.userId
      }
    }

    // Получаем информацию об анонимной сессии
    let anonymousUser = null
    if (anonymousToken) {
      anonymousUser = await prisma.anonymousUser.findUnique({
        where: { token: anonymousToken },
        select: {
          id: true,
          sessionId: true,
          token: true,
          userId: true,
          createdAt: true,
          lastActivity: true,
          user: {
            select: {
              id: true,
              phone: true,
            },
          },
        },
      })
    }

    // Если есть userId, получаем все его анонимные сессии
    let userAnonymousSessions = []
    if (userId) {
      userAnonymousSessions = await prisma.anonymousUser.findMany({
        where: { userId },
        select: {
          id: true,
          sessionId: true,
          createdAt: true,
          lastActivity: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({
      cookies: {
        hasAccessToken: !!accessToken,
        hasAnonymousToken: !!anonymousToken,
        anonymousTokenPreview: anonymousToken ? anonymousToken.substring(0, 8) + '...' : null,
      },
      currentUser: userId ? { id: userId } : null,
      currentAnonymousSession: anonymousUser,
      userAnonymousSessions: {
        count: userAnonymousSessions.length,
        sessions: userAnonymousSessions,
      },
      debug: {
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error in test-sessions:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

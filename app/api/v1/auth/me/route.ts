import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import { verifyToken, ACCESS_TOKEN_COOKIE, ANONYMOUS_TOKEN_COOKIE } from '@/shared/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    const anonymousToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value

    // Проверяем access token
    if (accessToken) {
      const payload = verifyToken(accessToken)

      if (payload && payload.type === 'access') {
        // Получаем данные пользователя
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            phone: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phoneVerified: true,
            emailVerified: true,
            personalDiscount: true,
            customerGroup: {
              select: {
                id: true,
                name: true,
                discountPercent: true,
              },
            },
            // Считаем связанные данные
            _count: {
              select: {
                orders: true,
                favorites: true,
                anonymousSessions: true,
              },
            },
          },
        })

        if (user) {
          // Обновляем последнюю активность
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActivityAt: new Date() },
          })

          // Дополнительно получаем количество анонимных сессий
          const anonymousSessionsCount = await prisma.anonymousUser.count({
            where: { userId: user.id },
          })

          return NextResponse.json({
            authenticated: true,
            user: {
              ...user,
              ordersCount: user._count.orders,
              favoritesCount: user._count.favorites,
              anonymousSessionsCount: anonymousSessionsCount,
            },
          })
        }
      }
    }

    // Проверяем анонимный токен
    if (anonymousToken) {
      console.log(
        '🔍 Looking for anonymous user with token:',
        anonymousToken.substring(0, 8) + '...'
      )

      const anonymousUser = await prisma.anonymousUser.findUnique({
        where: { token: anonymousToken },
        select: {
          id: true,
          sessionId: true,
          createdAt: true,
          _count: {
            select: {
              carts: true,
              favorites: true,
              viewHistory: true,
            },
          },
        },
      })

      if (anonymousUser) {
        console.log('✅ Found anonymous user:', {
          id: anonymousUser.id,
          sessionId: anonymousUser.sessionId,
        })

        return NextResponse.json({
          authenticated: false,
          anonymous: true,
          session: {
            id: anonymousUser.id,
            sessionId: anonymousUser.sessionId,
            createdAt: anonymousUser.createdAt,
            cartsCount: anonymousUser._count.carts,
            favoritesCount: anonymousUser._count.favorites,
            viewsCount: anonymousUser._count.viewHistory,
          },
        })
      } else {
        console.log('❌ Anonymous user not found in database')

        // Проверим, сколько всего анонимных пользователей в БД
        const totalAnonymousUsers = await prisma.anonymousUser.count()
        console.log('📊 Total anonymous users in DB:', totalAnonymousUsers)
      }
    } else {
      console.log('❌ No anonymous token in cookies')
    }

    // Нет ни авторизации, ни анонимной сессии
    return NextResponse.json({
      authenticated: false,
      anonymous: false,
    })
  } catch (error) {
    console.error('Error in auth/me:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

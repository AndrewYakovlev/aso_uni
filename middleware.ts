import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/shared/lib/auth/jwt'
import { getTokenFromRequest, setTokenInResponse, COOKIE_NAMES } from '@/shared/lib/auth/cookies'
import { AUTH } from '@/shared/constants'

// Маршруты, которые не требуют проверки анонимного токена
const excludedPaths = [
  '/_next',
  '/favicon.ico',
  '/api/v1/auth/anonymous', // Сам endpoint создания анонимного пользователя
]

// Маршруты только для авторизованных пользователей
const protectedRoutes = [
  '/profile',
  '/checkout',
  '/api/v1/orders/create', // Создание заказа
  '/api/v1/favorites',
]

// Маршруты только для менеджеров и админов
const adminRoutes = ['/panel', '/api/v1/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем excluded paths
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Получаем токены из cookies
  const accessToken = getTokenFromRequest(request, COOKIE_NAMES.ACCESS_TOKEN)
  const anonymousToken = getTokenFromRequest(request, COOKIE_NAMES.ANONYMOUS_TOKEN)

  // Проверяем авторизацию для защищенных маршрутов
  const isProtectedRoute = protectedRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAdminRoute = adminRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Сначала проверяем access token если он есть
  let userPayload = null
  if (accessToken) {
    userPayload = await verifyToken(accessToken)
  }

  // Проверка для административных маршрутов
  if (isAdminRoute) {
    if (!userPayload || (userPayload.role !== 'ADMIN' && userPayload.role !== 'MANAGER')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Проверка для защищенных маршрутов
  if (isProtectedRoute) {
    if (!userPayload || userPayload.type !== 'user') {
      // Сохраняем URL для редиректа после авторизации
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Если пользователь авторизован, не проверяем анонимный токен
  if (userPayload) {
    return NextResponse.next()
  }

  // Работа с анонимными пользователями
  if (!anonymousToken) {
    // Если нет анонимного токена, создаем нового анонимного пользователя
    try {
      const response = await fetch(new URL('/api/v1/auth/anonymous', request.url), {
        method: 'POST',
        headers: {
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
          'x-real-ip': request.headers.get('x-real-ip') || '',
          'user-agent': request.headers.get('user-agent') || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const sessionId = data.data.anonymousUser.sessionId

        // Создаем новый response и устанавливаем cookies
        const nextResponse = NextResponse.next()
        setTokenInResponse(
          nextResponse,
          COOKIE_NAMES.ANONYMOUS_TOKEN,
          sessionId,
          AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
        )
        setTokenInResponse(
          nextResponse,
          COOKIE_NAMES.SESSION_ID,
          sessionId,
          AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
        )

        return nextResponse
      }
    } catch (error) {
      console.error('Ошибка при создании анонимного пользователя:', error)
    }
  } else {
    // Есть анонимный токен, проверяем его в БД и обновляем срок жизни
    try {
      // Для оптимизации не проверяем токен в БД на каждый запрос
      // Обновляем cookie только для страниц, не для статики и API
      if (!pathname.startsWith('/api/') && !pathname.includes('.')) {
        const response = await fetch(new URL('/api/v1/auth/anonymous/activity', request.url), {
          method: 'POST',
          headers: {
            Cookie: request.headers.get('cookie') || '',
          },
        })

        if (response.ok) {
          // Обновляем срок жизни cookie на следующие 365 дней
          const nextResponse = NextResponse.next()
          setTokenInResponse(
            nextResponse,
            COOKIE_NAMES.ANONYMOUS_TOKEN,
            anonymousToken,
            AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
          )
          setTokenInResponse(
            nextResponse,
            COOKIE_NAMES.SESSION_ID,
            anonymousToken,
            AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
          )
          return nextResponse
        } else if (response.status === 404) {
          // Анонимный пользователь не найден в БД, создаем нового
          const createResponse = await fetch(new URL('/api/v1/auth/anonymous', request.url), {
            method: 'POST',
            headers: {
              'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
              'x-real-ip': request.headers.get('x-real-ip') || '',
              'user-agent': request.headers.get('user-agent') || '',
            },
          })

          if (createResponse.ok) {
            const data = await createResponse.json()
            const sessionId = data.data.anonymousUser.sessionId

            const nextResponse = NextResponse.next()
            setTokenInResponse(
              nextResponse,
              COOKIE_NAMES.ANONYMOUS_TOKEN,
              sessionId,
              AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
            )
            setTokenInResponse(
              nextResponse,
              COOKIE_NAMES.SESSION_ID,
              sessionId,
              AUTH.ANONYMOUS_TOKEN_EXPIRES_IN
            )

            return nextResponse
          }
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке анонимного пользователя:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - файлы с расширениями (изображения, шрифты и т.д.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}

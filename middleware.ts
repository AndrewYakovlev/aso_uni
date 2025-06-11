import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ANONYMOUS_TOKEN_COOKIE,
  ANONYMOUS_TOKEN_MAX_AGE,
  ACCESS_TOKEN_COOKIE,
  verifyToken,
} from '@/shared/lib/auth'

// Пути, которые требуют авторизации
const protectedPaths = ['/profile', '/panel', '/api/v1/admin', '/api/v1/user']

// Пути, где не нужен анонимный токен
const excludedPaths = ['/_next', '/favicon.ico', '/api/health']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем статику и служебные пути
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Для API запросов устанавливаем CORS заголовки
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Для OPTIONS запросов возвращаем 200
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
  }

  // Проверка защищенных маршрутов
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath) {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      // Для API возвращаем 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Для страниц редиректим на главную
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('auth', 'required')
      return NextResponse.redirect(url)
    }

    // Проверяем валидность токена
    const payload = verifyToken(accessToken)
    if (!payload) {
      // Токен невалиден
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        : NextResponse.redirect(new URL('/', request.url))

      // Удаляем невалидные токены
      response.cookies.delete(ACCESS_TOKEN_COOKIE)
      return response
    }

    // Проверка доступа к админке
    if (pathname.startsWith('/panel') && payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/', request.url))
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

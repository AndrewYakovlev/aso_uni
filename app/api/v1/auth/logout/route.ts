import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  generateAnonymousToken,
  ANONYMOUS_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  ANONYMOUS_TOKEN_MAX_AGE,
} from '@/shared/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Удаляем токены авторизации
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)

    // Создаем новый анонимный токен
    const newAnonymousToken = generateAnonymousToken()

    cookieStore.set(ANONYMOUS_TOKEN_COOKIE, newAnonymousToken, {
      ...COOKIE_OPTIONS,
      maxAge: ANONYMOUS_TOKEN_MAX_AGE,
    })

    return NextResponse.json({
      success: true,
      message: 'Вы успешно вышли из системы',
    })
  } catch (error) {
    console.error('Error in logout:', error)
    return NextResponse.json({ error: 'Ошибка при выходе из системы' }, { status: 500 })
  }
}

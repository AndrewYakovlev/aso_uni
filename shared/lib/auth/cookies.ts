import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { AUTH } from '@/shared/constants'

// Названия cookies
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'aso-access-token',
  REFRESH_TOKEN: 'aso-refresh-token',
  ANONYMOUS_TOKEN: 'aso-anonymous-token',
  SESSION_ID: 'aso-session-id',
} as const

// Установка токена в cookies (для использования в API routes)
export async function setTokenCookie(name: string, token: string, maxAge?: number): Promise<void> {
  const cookieStore = cookies()

  cookieStore.set(name, token, {
    ...AUTH.COOKIE_OPTIONS,
    maxAge: maxAge || AUTH.ANONYMOUS_TOKEN_EXPIRES_IN, // 365 дней по умолчанию
  })
}

// Получение токена из cookies (для использования в API routes)
export async function getTokenFromCookie(name: string): Promise<string | null> {
  const cookieStore = cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value || null
}

// Удаление токена из cookies (для использования в API routes)
export async function removeTokenCookie(name: string): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(name)
}

// Установка токена в response (для использования в middleware)
export function setTokenInResponse(
  response: NextResponse,
  name: string,
  token: string,
  maxAge?: number
): void {
  response.cookies.set(name, token, {
    ...AUTH.COOKIE_OPTIONS,
    maxAge: maxAge || AUTH.ANONYMOUS_TOKEN_EXPIRES_IN, // 365 дней по умолчанию
  })
}

// Получение токена из request (для использования в middleware)
export function getTokenFromRequest(request: NextRequest, name: string): string | null {
  return request.cookies.get(name)?.value || null
}

// Удаление токена из response (для использования в middleware)
export function removeTokenFromResponse(response: NextResponse, name: string): void {
  response.cookies.delete(name)
}

// Установка всех токенов для авторизованного пользователя
export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  await setTokenCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, 60 * 15) // 15 минут
  await setTokenCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 60 * 60 * 24 * 7) // 7 дней

  // Удаляем анонимный токен при авторизации
  await removeTokenCookie(COOKIE_NAMES.ANONYMOUS_TOKEN)
  await removeTokenCookie(COOKIE_NAMES.SESSION_ID)
}

// Очистка всех auth cookies
export async function clearAuthCookies(): Promise<void> {
  await removeTokenCookie(COOKIE_NAMES.ACCESS_TOKEN)
  await removeTokenCookie(COOKIE_NAMES.REFRESH_TOKEN)
  await removeTokenCookie(COOKIE_NAMES.ANONYMOUS_TOKEN)
  await removeTokenCookie(COOKIE_NAMES.SESSION_ID)
}

// Получение всех токенов из cookies
export async function getAuthTokens(): Promise<{
  accessToken: string | null
  refreshToken: string | null
  anonymousToken: string | null
  sessionId: string | null
}> {
  return {
    accessToken: await getTokenFromCookie(COOKIE_NAMES.ACCESS_TOKEN),
    refreshToken: await getTokenFromCookie(COOKIE_NAMES.REFRESH_TOKEN),
    anonymousToken: await getTokenFromCookie(COOKIE_NAMES.ANONYMOUS_TOKEN),
    sessionId: await getTokenFromCookie(COOKIE_NAMES.SESSION_ID),
  }
}

// Проверка наличия авторизации
export async function isAuthenticated(): Promise<boolean> {
  const { accessToken, refreshToken } = await getAuthTokens()
  return !!(accessToken || refreshToken)
}

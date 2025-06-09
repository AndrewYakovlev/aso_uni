import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { AuthJWTPayload } from '@/shared/types'
import { AUTH } from '@/shared/constants'

// Получаем секретные ключи из переменных окружения
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET не установлен в переменных окружения')
  }
  return new TextEncoder().encode(secret)
}

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET не установлен в переменных окружения')
  }
  return new TextEncoder().encode(secret)
}

// Создание access токена
export async function createAccessToken(payload: AuthJWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH.ACCESS_TOKEN_EXPIRES_IN)
    .sign(getJwtSecret())
}

// Создание refresh токена
export async function createRefreshToken(payload: AuthJWTPayload): Promise<string> {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(AUTH.REFRESH_TOKEN_EXPIRES_IN)
    .sign(getRefreshSecret())
}

// Верификация access токена
export async function verifyAccessToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    // Проверяем, что payload содержит наши кастомные поля
    if (payload.sub && 'role' in payload && 'type' in payload) {
      return payload as unknown as AuthJWTPayload
    }
    return null
  } catch (error) {
    return null
  }
}

// Верификация refresh токена
export async function verifyRefreshToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    // Проверяем, что payload содержит наши кастомные поля
    if (payload.sub && 'role' in payload && 'type' in payload) {
      return payload as unknown as AuthJWTPayload
    }
    return null
  } catch (error) {
    return null
  }
}

// Верификация любого токена (для middleware)
export async function verifyToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    // Проверяем, что payload содержит наши кастомные поля
    if (payload.sub && 'role' in payload && 'type' in payload) {
      return payload as unknown as AuthJWTPayload
    }
    return null
  } catch (error) {
    // Если не удалось верифицировать как access токен, пробуем как refresh
    try {
      const { payload } = await jwtVerify(token, getRefreshSecret())
      if (payload.sub && 'role' in payload && 'type' in payload) {
        return payload as unknown as AuthJWTPayload
      }
      return null
    } catch {
      return null
    }
  }
}

// Извлечение токена из заголовка Authorization
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== AUTH.TOKEN_PREFIX) {
    return null
  }

  return parts[1]
}

// Проверка, истек ли токен
export function isTokenExpired(payload: AuthJWTPayload): boolean {
  if (!payload.exp) return false
  return Date.now() >= payload.exp * 1000
}

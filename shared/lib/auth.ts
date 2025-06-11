import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { config } from '@/env'

// Типы для JWT payload
export interface JWTPayload {
  userId: string
  role: string
  type: 'access' | 'refresh'
}

export interface AnonymousTokenPayload {
  anonymousId: string
  sessionId: string
}

// Генерация токенов
export function generateAccessToken(userId: string, role: string): string {
  const payload: JWTPayload = {
    userId,
    role,
    type: 'access',
  }

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions)
}

export function generateRefreshToken(userId: string, role: string): string {
  const payload: JWTPayload = {
    userId,
    role,
    type: 'refresh',
  }

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions)
}

// Верификация токенов
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload
  } catch {
    return null
  }
}

// Генерация анонимного токена
export function generateAnonymousToken(): string {
  // Используем timestamp + random для генерации уникального токена
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}-${randomPart2}`
}

// Генерация session ID
export function generateSessionId(): string {
  // Короткий ID для сессии
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `${timestamp}${randomPart}`
}

// Генерация OTP кода
export function generateOTPCode(): string {
  // Генерируем 6-значный код
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Хеширование паролей (для будущего использования)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.security.bcryptRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Форматирование телефона
export function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')

  // Добавляем +7 если нужно
  if (cleaned.length === 10) {
    return `+7${cleaned}`
  } else if (cleaned.length === 11 && cleaned[0] === '7') {
    return `+${cleaned}`
  } else if (cleaned.length === 11 && cleaned[0] === '8') {
    return `+7${cleaned.slice(1)}`
  }

  return `+${cleaned}`
}

// Валидация телефона
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Проверяем российский номер
  return /^\+7\d{10}$/.test(formatted)
}

// Маскирование телефона для отображения
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone)
  // +7 900 *** ** 67
  return `${formatted.slice(0, 6)} *** ** ${formatted.slice(-2)}`
}

// Cookie options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.app.env === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const ACCESS_TOKEN_COOKIE = 'aso-access-token'
export const REFRESH_TOKEN_COOKIE = 'aso-refresh-token'
export const ANONYMOUS_TOKEN_COOKIE = 'aso-anonymous-token'

// Время жизни анонимного токена (1 год)
export const ANONYMOUS_TOKEN_MAX_AGE = 365 * 24 * 60 * 60 * 1000

// Время жизни OTP кода (5 минут)
export const OTP_CODE_LIFETIME = 5 * 60 * 1000

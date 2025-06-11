/**
 * Серверные утилиты для генерации токенов
 * Используются только в API routes, не в middleware
 */

import crypto from 'crypto'

/**
 * Генерация криптографически безопасного анонимного токена
 * Используется только на сервере в API routes
 */
export function generateSecureAnonymousToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Генерация криптографически безопасного session ID
 * Используется только на сервере в API routes
 */
export function generateSecureSessionId(): string {
  return crypto.randomBytes(16).toString('hex')
}

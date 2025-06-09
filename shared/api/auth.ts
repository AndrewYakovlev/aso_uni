import { API_ROUTES } from '@/shared/constants'
import { User } from '@prisma/client'

interface SendOTPResponse {
  success: boolean
  message: string
  expiresIn?: number
}

interface VerifyOTPResponse {
  user: Pick<User, 'id' | 'phone' | 'email' | 'firstName' | 'lastName' | 'role'>
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

interface RefreshTokenResponse {
  user: Pick<User, 'id' | 'phone' | 'email' | 'firstName' | 'lastName' | 'role'>
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

class AuthAPI {
  /**
   * Отправка OTP кода на телефон
   */
  async sendOTP(phone: string): Promise<SendOTPResponse> {
    const response = await fetch(API_ROUTES.AUTH.SEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Ошибка отправки кода')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Проверка OTP кода и авторизация
   */
  async verifyOTP(
    phone: string,
    code: string,
    additionalData?: {
      firstName?: string
      lastName?: string
      email?: string
    }
  ): Promise<VerifyOTPResponse> {
    const response = await fetch(API_ROUTES.AUTH.VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
        ...additionalData,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Ошибка авторизации')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Обновление токенов
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await fetch(API_ROUTES.AUTH.REFRESH, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Ошибка обновления токена')
    }

    const data = await response.json()
    return data.data
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    const response = await fetch(API_ROUTES.AUTH.LOGOUT, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Ошибка выхода')
    }
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser() {
    const response = await fetch(API_ROUTES.AUTH.ME)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Ошибка получения пользователя')
    }

    const data = await response.json()
    return data.data
  }
}

export const authAPI = new AuthAPI()

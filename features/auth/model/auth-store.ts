import { create } from 'zustand'
import { authAPI } from '@/shared/api/auth'
import { User } from '@prisma/client'

interface AuthState {
  // Состояние
  isLoading: boolean
  isAuthenticated: boolean
  user: Pick<User, 'id' | 'phone' | 'email' | 'firstName' | 'lastName' | 'role'> | null

  // OTP состояние
  otpSent: boolean
  otpPhone: string | null
  otpExpiresIn: number | null
  otpError: string | null

  // Действия
  sendOTP: (phone: string) => Promise<void>
  verifyOTP: (
    code: string,
    additionalData?: {
      firstName?: string
      lastName?: string
      email?: string
    }
  ) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthState['user']) => void
  clearOTPState: () => void

  // Ошибки
  error: string | null
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Начальное состояние
  isLoading: false,
  isAuthenticated: false,
  user: null,

  // OTP состояние
  otpSent: false,
  otpPhone: null,
  otpExpiresIn: null,
  otpError: null,

  error: null,

  // Отправка OTP
  sendOTP: async (phone: string) => {
    set({ isLoading: true, error: null, otpError: null })

    try {
      const response = await authAPI.sendOTP(phone)

      set({
        isLoading: false,
        otpSent: true,
        otpPhone: phone,
        otpExpiresIn: response.expiresIn || 300, // 5 минут по умолчанию
      })
    } catch (error) {
      set({
        isLoading: false,
        otpError: error instanceof Error ? error.message : 'Ошибка отправки кода',
      })
    }
  },

  // Проверка OTP
  verifyOTP: async (code: string, additionalData) => {
    const { otpPhone } = get()

    if (!otpPhone) {
      set({ error: 'Сначала запросите код подтверждения' })
      return
    }

    set({ isLoading: true, error: null, otpError: null })

    try {
      const response = await authAPI.verifyOTP(otpPhone, code, additionalData)

      set({
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
        otpSent: false,
        otpPhone: null,
        otpExpiresIn: null,
      })

      // Перезагружаем страницу для обновления состояния
      // В продакшене лучше использовать router.refresh() или обновить React Query кеш
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      set({
        isLoading: false,
        otpError: error instanceof Error ? error.message : 'Неверный код',
      })
    }
  },

  // Выход
  logout: async () => {
    set({ isLoading: true, error: null })

    try {
      await authAPI.logout()

      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
      })

      // Перезагружаем страницу для сброса состояния
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка выхода',
      })
    }
  },

  // Установка пользователя (для синхронизации с React Query)
  setUser: user => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },

  // Очистка OTP состояния
  clearOTPState: () => {
    set({
      otpSent: false,
      otpPhone: null,
      otpExpiresIn: null,
      otpError: null,
    })
  },

  // Очистка ошибок
  clearError: () => {
    set({ error: null, otpError: null })
  },
}))

// Селекторы для оптимизации ререндеров
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useCurrentUser = () => useAuthStore(state => state.user)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useOTPState = () =>
  useAuthStore(state => ({
    sent: state.otpSent,
    phone: state.otpPhone,
    expiresIn: state.otpExpiresIn,
    error: state.otpError,
  }))

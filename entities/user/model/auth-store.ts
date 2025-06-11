import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: string
  phone: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  phoneVerified: boolean
  emailVerified: boolean
  personalDiscount?: number | null
  customerGroup?: {
    id: string
    name: string
    discountPercent: number
  } | null
  ordersCount?: number
  favoritesCount?: number
  anonymousSessionsCount?: number
}

export interface AnonymousSession {
  id: string
  sessionId: string
  createdAt: string
  cartsCount: number
  favoritesCount: number
  viewsCount: number
}

interface AuthState {
  // Состояние
  user: User | null
  anonymousSession: AnonymousSession | null
  isAuthenticated: boolean
  isLoading: boolean

  // Действия
  setUser: (user: User | null) => void
  setAnonymousSession: (session: AnonymousSession | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void

  // API методы
  checkAuth: () => Promise<void>
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string; maskedPhone?: string }>
  verifyOTP: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>
  performLogout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Начальное состояние
        user: null,
        anonymousSession: null,
        isAuthenticated: false,
        isLoading: true,

        // Действия
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            anonymousSession: user ? null : get().anonymousSession,
          }),

        setAnonymousSession: (session) =>
          set({
            anonymousSession: session,
          }),

        setLoading: (loading) => set({ isLoading: loading }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            anonymousSession: null,
          }),

        // API методы
        checkAuth: async () => {
          set({ isLoading: true })

          try {
            const response = await fetch('/api/v1/auth/me')
            const data = await response.json()

            if (data.authenticated && data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                anonymousSession: null,
              })
            } else if (data.anonymous && data.session) {
              set({
                user: null,
                isAuthenticated: false,
                anonymousSession: data.session,
              })
            } else {
              set({
                user: null,
                isAuthenticated: false,
                anonymousSession: null,
              })
            }
          } catch (error) {
            console.error('Auth check error:', error)
            set({
              user: null,
              isAuthenticated: false,
            })
          } finally {
            set({ isLoading: false })
          }
        },

        sendOTP: async (phone: string) => {
          try {
            const response = await fetch('/api/v1/auth/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone }),
            })

            const data = await response.json()

            if (response.ok) {
              return {
                success: true,
                maskedPhone: data.maskedPhone,
              }
            } else {
              return {
                success: false,
                error: data.error || 'Ошибка отправки кода',
              }
            }
          } catch (error) {
            return {
              success: false,
              error: 'Ошибка сети',
            }
          }
        },

        verifyOTP: async (phone: string, code: string) => {
          try {
            const response = await fetch('/api/v1/auth/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, code }),
            })

            const data = await response.json()

            if (response.ok && data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                anonymousSession: null,
              })
              return { success: true }
            } else {
              return {
                success: false,
                error: data.error || 'Ошибка проверки кода',
              }
            }
          } catch (error) {
            return {
              success: false,
              error: 'Ошибка сети',
            }
          }
        },

        performLogout: async () => {
          try {
            await fetch('/api/v1/auth/logout', {
              method: 'POST',
            })

            set({
              user: null,
              isAuthenticated: false,
              anonymousSession: null,
            })

            // Перезагружаем страницу для получения нового анонимного токена
            window.location.reload()
          } catch (error) {
            console.error('Logout error:', error)
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
)

import { useQuery } from '@tanstack/react-query'
import { User } from '@prisma/client'
import { API_ROUTES } from '@/shared/constants'

interface CurrentUserResponse {
  type: 'user' | 'anonymous'
  user?: User
  anonymousUser?: {
    id: string
    sessionId: string
  }
}

// Хук для получения текущего пользователя
export function useCurrentUser() {
  return useQuery<CurrentUserResponse>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.AUTH.ME)

      if (!response.ok) {
        throw new Error('Failed to fetch current user')
      }

      const data = await response.json()
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
  })
}

// Хук для проверки авторизации
export function useIsAuthenticated() {
  const { data } = useCurrentUser()
  return data?.type === 'user'
}

// Хук для проверки роли пользователя
export function useUserRole() {
  const { data } = useCurrentUser()

  if (data?.type === 'user') {
    return data.user?.role || null
  }

  return 'ANONYMOUS' as const
}

// Хук для проверки, является ли пользователь админом
export function useIsAdmin() {
  const role = useUserRole()
  return role === 'ADMIN'
}

// Хук для проверки, является ли пользователь менеджером
export function useIsManager() {
  const role = useUserRole()
  return role === 'MANAGER' || role === 'ADMIN'
}

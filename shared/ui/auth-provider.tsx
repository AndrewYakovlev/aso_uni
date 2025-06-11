'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/entities/user/model/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    // Проверяем авторизацию при загрузке приложения
    const initAuth = async () => {
      // Сначала проверяем текущий статус авторизации
      const response = await fetch('/api/v1/auth/me')
      const data = await response.json()

      console.log('🔍 Initial auth check:', data)

      // Если нет ни авторизации, ни анонимной сессии - создаем анонимную сессию
      if (!data.authenticated && !data.anonymous) {
        console.log('🆕 No session found, creating anonymous session...')

        try {
          const createResponse = await fetch('/api/v1/auth/anonymous', {
            method: 'POST',
          })
          const createData = await createResponse.json()

          if (createData.success) {
            console.log('✅ Anonymous session created:', createData.session)
          } else {
            console.error('❌ Failed to create anonymous session:', createData.error)
          }
        } catch (error) {
          console.error('❌ Error creating anonymous session:', error)
        }
      }

      // Обновляем состояние в store
      await checkAuth()
    }

    initAuth()
  }, [checkAuth])

  return <>{children}</>
}

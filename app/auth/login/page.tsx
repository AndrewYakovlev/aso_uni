'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoginModal } from '@/features/auth'
import { Card } from '@/shared/ui/card'
import Link from 'next/link'
import { ClientOnly } from '@/shared/ui/client-only'

function LoginPageContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [isOpen, setIsOpen] = useState(true)

  // Сохраняем redirect URL для использования после авторизации
  useEffect(() => {
    if (redirect && redirect !== '/') {
      sessionStorage.setItem('auth_redirect', redirect)
    }
  }, [redirect])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    // Если модалка закрыта, возвращаемся на главную
    if (!open) {
      window.location.href = '/'
    }
  }

  // После успешной авторизации будет автоматический редирект через reload
  useEffect(() => {
    const handleAuthSuccess = () => {
      const savedRedirect = sessionStorage.getItem('auth_redirect')
      if (savedRedirect) {
        sessionStorage.removeItem('auth_redirect')
        window.location.href = savedRedirect
      }
    }

    // Проверяем при загрузке страницы
    handleAuthSuccess()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Вход в панель управления</h1>
            <p className="text-muted-foreground">
              Для доступа к панели управления необходимо авторизоваться
            </p>
          </div>

          {redirect && redirect !== '/' && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              После входа вы будете перенаправлены на запрошенную страницу
            </div>
          )}

          <div className="space-y-4">
            <LoginModal open={isOpen} onOpenChange={handleOpenChange} />

            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="hover:underline">
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Загрузка...</h1>
            </div>
          </Card>
        </div>
      }
    >
      <LoginPageContent />
    </ClientOnly>
  )
}

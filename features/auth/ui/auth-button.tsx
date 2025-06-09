'use client'

import { useState } from 'react'
import { User, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { LoginModal } from './login-modal'
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'
import { useAuthStore } from '../model/auth-store'
import { formatPhone } from '@/shared/lib/utils'
import { APP_ROUTES } from '@/shared/constants'

export function AuthButton() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { data: currentUser, isLoading } = useCurrentUser()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Вы вышли из системы')
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  // Показываем скелетон при загрузке
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4" />
      </Button>
    )
  }

  // Если пользователь не авторизован
  if (!currentUser || currentUser.type !== 'user') {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => setLoginModalOpen(true)}>
          <User className="mr-2 h-4 w-4" />
          Войти
        </Button>

        <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
      </>
    )
  }

  // Если пользователь авторизован
  const user = currentUser.user
  const displayName = user?.firstName || 'Личный кабинет'
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="mr-2 h-4 w-4" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {formatPhone(user?.phone || '')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.PROFILE}>
            <User className="mr-2 h-4 w-4" />
            Личный кабинет
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.ORDERS}>Мои заказы</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={APP_ROUTES.FAVORITES}>Избранное</Link>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={APP_ROUTES.PANEL}>Панель управления</Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

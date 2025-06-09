'use client'

import { Menu, Bell, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { PanelNavigation } from '@/widgets/panel-navigation/ui/panel-navigation'
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'
import { useAuthStore } from '@/features/auth'
import { formatPhone } from '@/shared/lib/utils'
import { toast } from 'sonner'

interface PanelHeaderProps {
  title?: string
}

export function PanelHeader({ title }: PanelHeaderProps) {
  const { data: currentUser } = useCurrentUser()
  const { logout } = useAuthStore()

  const user = currentUser?.type === 'user' ? currentUser.user : null
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : 'U'

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Вы вышли из системы')
    } catch (error) {
      toast.error('Ошибка при выходе')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Мобильное меню */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/panel" className="font-semibold">
                АСО Панель
              </Link>
            </div>
            <PanelNavigation />
          </SheetContent>
        </Sheet>

        {/* Заголовок страницы */}
        {title && <h1 className="text-xl font-semibold">{title}</h1>}

        {/* Поиск */}
        <div className="flex-1 px-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по панели..."
              className="w-full max-w-md pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Уведомления */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              3
            </Badge>
            <span className="sr-only">Уведомления</span>
          </Button>

          {/* Профиль пользователя */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {formatPhone(user?.phone || '')}
                  </p>
                  <Badge variant="outline" className="w-fit mt-1">
                    {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Перейти на сайт</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/panel/settings/profile">Настройки профиля</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Выйти</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/auth/get-current-user'
import { PanelNavigation } from '@/widgets/panel-navigation'
import { PanelHeader } from '@/widgets/panel-header'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Проверяем права доступа
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.type !== 'user') {
    redirect('/auth/login?redirect=/panel')
  }

  const user = currentUser.user
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Боковая панель - скрыта на мобильных */}
      <aside className="hidden w-72 border-r bg-background lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">АСО Панель</h2>
        </div>
        <PanelNavigation />
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        <PanelHeader />
        <main className="flex-1 overflow-y-auto bg-muted/10">{children}</main>
      </div>
    </div>
  )
}

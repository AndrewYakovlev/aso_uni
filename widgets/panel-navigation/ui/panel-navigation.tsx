'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Badge } from '@/shared/ui/badge'
import { PANEL_NAVIGATION } from '@/shared/constants/panel'
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'

interface PanelNavigationProps {
  className?: string
}

export function PanelNavigation({ className }: PanelNavigationProps) {
  const pathname = usePathname()
  const { data: currentUser } = useCurrentUser()

  const isAdmin = currentUser?.type === 'user' && currentUser.user?.role === 'ADMIN'

  return (
    <div className={cn('pb-12', className)}>
      <ScrollArea className="h-full py-6 pl-8 pr-6">
        <div className="space-y-6">
          {PANEL_NAVIGATION.map(section => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items
                  .filter(item => !item.adminOnly || isAdmin)
                  .map(item => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/panel' && pathname.startsWith(item.href))

                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn('w-full justify-start', isActive && 'bg-muted')}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                          {item.badge && (
                            <Badge
                              variant={item.badge === 'new' ? 'default' : 'secondary'}
                              className="ml-auto"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

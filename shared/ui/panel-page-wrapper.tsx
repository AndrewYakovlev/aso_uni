import { ReactNode } from 'react'
import { Breadcrumbs } from './breadcrumbs'
import { cn } from '@/shared/lib/utils'

interface PanelPageWrapperProps {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  breadcrumbs?: Array<{ title: string; href?: string }>
  className?: string
}

export function PanelPageWrapper({
  title,
  description,
  children,
  actions,
  breadcrumbs,
  className,
}: PanelPageWrapperProps) {
  return (
    <div className={cn('space-y-6 p-8', className)}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Заголовок и действия */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Контент */}
      <div>{children}</div>
    </div>
  )
}

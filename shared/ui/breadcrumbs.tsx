'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Маппинг путей к названиям для автогенерации
const pathTitles: Record<string, string> = {
  panel: 'Панель управления',
  orders: 'Заказы',
  products: 'Товары',
  categories: 'Категории',
  brands: 'Бренды',
  characteristics: 'Характеристики',
  vehicles: 'Автомобили',
  users: 'Пользователи',
  chats: 'Чаты',
  discounts: 'Скидки',
  'promo-codes': 'Промокоды',
  analytics: 'Аналитика',
  settings: 'Настройки',
  new: 'Создание',
  edit: 'Редактирование',
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Автогенерация breadcrumbs если items не переданы
  const breadcrumbItems = items || (() => {
    const segments = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []
    
    segments.forEach((segment, index) => {
      const title = pathTitles[segment] || segment
      const href = index === segments.length - 1 
        ? undefined 
        : '/' + segments.slice(0, index + 1).join('/')
      
      generatedItems.push({ title, href })
    })
    
    return generatedItems
  })()

  if (breadcrumbItems.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      {breadcrumbItems[0]?.title === 'Панель управления' && (
        <>
          <Link
            href="/panel"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbItems.length > 1 && (
            <ChevronRight className="h-4 w-4" />
          )}
        </>
      )}
      
      {breadcrumbItems.slice(breadcrumbItems[0]?.title === 'Панель управления' ? 1 : 0).map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.title}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
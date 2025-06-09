import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  MessageSquare,
  Car,
  Tags,
  Percent,
  BarChart3,
  Settings,
  FileText,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  adminOnly?: boolean
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export const PANEL_NAVIGATION: NavigationSection[] = [
  {
    title: 'Основное',
    items: [
      {
        title: 'Дашборд',
        href: '/panel',
        icon: LayoutDashboard,
      },
      {
        title: 'Заказы',
        href: '/panel/orders',
        icon: ShoppingCart,
        badge: 'new',
      },
      {
        title: 'Чаты',
        href: '/panel/chats',
        icon: MessageSquare,
        badge: '3',
      },
    ],
  },
  {
    title: 'Каталог',
    items: [
      {
        title: 'Товары',
        href: '/panel/products',
        icon: Package,
      },
      {
        title: 'Категории',
        href: '/panel/categories',
        icon: FolderTree,
      },
      {
        title: 'Бренды',
        href: '/panel/brands',
        icon: Tags,
      },
      {
        title: 'Характеристики',
        href: '/panel/characteristics',
        icon: FileText,
      },
      {
        title: 'Автомобили',
        href: '/panel/vehicles',
        icon: Car,
      },
    ],
  },
  {
    title: 'Маркетинг',
    items: [
      {
        title: 'Скидки',
        href: '/panel/discounts',
        icon: Percent,
      },
      {
        title: 'Промокоды',
        href: '/panel/promo-codes',
        icon: Tags,
      },
    ],
  },
  {
    title: 'Администрирование',
    items: [
      {
        title: 'Пользователи',
        href: '/panel/users',
        icon: Users,
        adminOnly: true,
      },
      {
        title: 'Аналитика',
        href: '/panel/analytics',
        icon: BarChart3,
      },
      {
        title: 'Настройки',
        href: '/panel/settings',
        icon: Settings,
        adminOnly: true,
      },
    ],
  },
]

// Быстрые действия для дашборда
export const QUICK_ACTIONS = [
  {
    title: 'Новый товар',
    href: '/panel/products/new',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Новая категория',
    href: '/panel/categories/new',
    icon: FolderTree,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Импорт товаров',
    href: '/panel/import',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Экспорт данных',
    href: '/panel/export',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

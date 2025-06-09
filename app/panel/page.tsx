import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { QUICK_ACTIONS } from '@/shared/constants/panel'
import { getCurrentUser } from '@/shared/lib/auth/get-current-user'
import { formatPrice } from '@/shared/lib/utils'

// Временные данные для демонстрации
const stats = [
  {
    title: 'Общая выручка',
    value: formatPrice(125430),
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
  {
    title: 'Заказов',
    value: '24',
    change: '+8',
    changeType: 'positive' as const,
    icon: ShoppingCart,
  },
  {
    title: 'Товаров',
    value: '1,234',
    change: '+64',
    changeType: 'positive' as const,
    icon: Package,
  },
  {
    title: 'Клиентов',
    value: '573',
    change: '-2.3%',
    changeType: 'negative' as const,
    icon: Users,
  },
]

const recentOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: 'Иван Иванов',
    total: 5400,
    status: 'new',
    statusLabel: 'Новый',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: 'Петр Петров',
    total: 12300,
    status: 'processing',
    statusLabel: 'В обработке',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: 'Сергей Сергеев',
    total: 3200,
    status: 'shipped',
    statusLabel: 'Отправлен',
  },
]

export default async function PanelDashboard() {
  const currentUser = await getCurrentUser()
  const user = currentUser?.type === 'user' ? currentUser.user : null
  const firstName = user?.firstName || 'Менеджер'

  return (
    <div className="space-y-8 p-8">
      {/* Приветствие */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать, {firstName}!</h1>
        <p className="text-muted-foreground">Вот что происходит в вашем магазине сегодня</p>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
                >
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="inline h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="inline h-3 w-3" />
                  )}
                  {stat.change}
                </span>{' '}
                по сравнению с прошлым месяцем
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Последние заказы */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Последние заказы</CardTitle>
                <CardDescription>Новые заказы требующие обработки</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/panel/orders">Все заказы</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/panel/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <Badge
                      variant={
                        order.status === 'new'
                          ? 'default'
                          : order.status === 'processing'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {order.statusLabel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Часто используемые операции</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {QUICK_ACTIONS.map(action => (
                <Button
                  key={action.href}
                  asChild
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <Link href={action.href}>
                    <div className={`rounded-lg p-2 ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-sm">{action.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активность */}
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
          <CardDescription>События в системе за последние 24 часа</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">
                  Новый заказ <span className="font-medium">#ORD-2024-004</span>
                </p>
                <p className="text-xs text-muted-foreground">2 минуты назад</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">
                  Товар <span className="font-medium">Масляный фильтр Bosch</span> обновлен
                </p>
                <p className="text-xs text-muted-foreground">1 час назад</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm">
                  Низкий остаток товара <span className="font-medium">Тормозные колодки</span>
                </p>
                <p className="text-xs text-muted-foreground">3 часа назад</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

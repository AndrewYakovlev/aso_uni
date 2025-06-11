import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

export async function GET() {
  try {
    // Проверяем подключение к БД
    await prisma.$connect()

    // Получаем количество записей в основных таблицах
    const [usersCount, brandsCount, orderStatusesCount, deliveryMethodsCount, paymentMethodsCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.brand.count(),
        prisma.orderStatus.count(),
        prisma.deliveryMethod.count(),
        prisma.paymentMethod.count(),
      ])

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        stats: {
          users: usersCount,
          brands: brandsCount,
          orderStatuses: orderStatusesCount,
          deliveryMethods: deliveryMethodsCount,
          paymentMethods: paymentMethodsCount,
        },
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

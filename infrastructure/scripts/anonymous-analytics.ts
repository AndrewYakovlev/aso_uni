import { prisma } from '@/shared/lib/prisma'

async function runAnalytics() {
  console.log('📊 Анализ анонимных пользователей')
  console.log('=====================================\n')

  // Общее количество анонимных пользователей
  const totalAnonymous = await prisma.anonymousUser.count()
  console.log(`👥 Всего анонимных пользователей: ${totalAnonymous}`)

  // Активные за последние 30 дней
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activeLastMonth = await prisma.anonymousUser.count({
    where: {
      lastActivity: {
        gte: thirtyDaysAgo,
      },
    },
  })
  console.log(`📅 Активные за последние 30 дней: ${activeLastMonth}`)

  // Анонимные пользователи с корзинами
  const withCarts = await prisma.anonymousUser.count({
    where: {
      carts: {
        some: {},
      },
    },
  })
  console.log(`🛒 С корзинами: ${withCarts}`)

  // Анонимные пользователи с историей просмотров
  const withViews = await prisma.anonymousUser.count({
    where: {
      viewHistory: {
        some: {},
      },
    },
  })
  console.log(`👁️  С историей просмотров: ${withViews}`)

  // Анонимные пользователи с чатами
  const withChats = await prisma.anonymousUser.count({
    where: {
      chats: {
        some: {},
      },
    },
  })
  console.log(`💬 С чатами: ${withChats}`)

  // Конверсия в зарегистрированных (приблизительная)
  // Считаем пользователей, у которых есть связанные данные от анонимных
  const convertedUsers = await prisma.user.count({
    where: {
      OR: [
        {
          carts: {
            some: {
              createdAt: {
                lt: await prisma.user
                  .findFirst({ select: { createdAt: true } })
                  .then(u => u?.createdAt || new Date()),
              },
            },
          },
        },
        {
          viewHistory: {
            some: {
              viewedAt: {
                lt: await prisma.user
                  .findFirst({ select: { createdAt: true } })
                  .then(u => u?.createdAt || new Date()),
              },
            },
          },
        },
      ],
    },
  })

  const conversionRate =
    totalAnonymous > 0 ? ((convertedUsers / totalAnonymous) * 100).toFixed(2) : 0
  console.log(`📈 Примерная конверсия: ${conversionRate}%`)

  // Распределение по дням недели
  console.log('\n📊 Распределение по дням недели:')
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  for (let day = 0; day < 7; day++) {
    const count = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM anonymous_users
      WHERE EXTRACT(DOW FROM created_at) = ${day}
    `
    console.log(`   ${dayNames[day]}: ${count[0].count}`)
  }

  // Топ User-Agent
  console.log('\n📱 Топ 5 User-Agent:')
  const topUserAgents = await prisma.anonymousUser.groupBy({
    by: ['userAgent'],
    _count: {
      userAgent: true,
    },
    orderBy: {
      _count: {
        userAgent: 'desc',
      },
    },
    take: 5,
  })

  topUserAgents.forEach((ua, index) => {
    const agent = ua.userAgent?.substring(0, 50) || 'Unknown'
    console.log(`   ${index + 1}. ${agent}... (${ua._count.userAgent})`)
  })

  // Средняя продолжительность активности
  const avgActivityDuration = await prisma.$queryRaw<[{ avg_hours: number }]>`
    SELECT AVG(EXTRACT(EPOCH FROM (last_activity - created_at)) / 3600) as avg_hours
    FROM anonymous_users
    WHERE last_activity > created_at
  `
  console.log(
    `\n⏱️  Средняя продолжительность активности: ${avgActivityDuration[0].avg_hours?.toFixed(2) || 0} часов`
  )

  console.log('\n✅ Анализ завершен')
}

// Запускаем анализ
runAnalytics()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Ошибка при анализе:', error)
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Создаем статусы чатов
  const chatStatuses = await Promise.all([
    prisma.chatStatus.upsert({
      where: { code: 'new' },
      update: {},
      create: {
        name: 'Новый',
        code: 'new',
        color: '#1971c2',
        sortOrder: 1,
      },
    }),
    prisma.chatStatus.upsert({
      where: { code: 'in_progress' },
      update: {},
      create: {
        name: 'В работе',
        code: 'in_progress',
        color: '#f59f00',
        sortOrder: 2,
      },
    }),
    prisma.chatStatus.upsert({
      where: { code: 'closed' },
      update: {},
      create: {
        name: 'Закрыт',
        code: 'closed',
        color: '#868e96',
        sortOrder: 3,
      },
    }),
  ])

  // Создаем статусы заказов
  const orderStatuses = await Promise.all([
    prisma.orderStatus.upsert({
      where: { code: 'new' },
      update: {},
      create: {
        name: 'Новый',
        code: 'new',
        color: '#1971c2',
        isInitial: true,
        sortOrder: 1,
      },
    }),
    prisma.orderStatus.upsert({
      where: { code: 'processing' },
      update: {},
      create: {
        name: 'В обработке',
        code: 'processing',
        color: '#f59f00',
        sortOrder: 2,
      },
    }),
    prisma.orderStatus.upsert({
      where: { code: 'shipped' },
      update: {},
      create: {
        name: 'Отправлен',
        code: 'shipped',
        color: '#099268',
        sortOrder: 3,
      },
    }),
    prisma.orderStatus.upsert({
      where: { code: 'delivered' },
      update: {},
      create: {
        name: 'Доставлен',
        code: 'delivered',
        color: '#2f9e44',
        isFinalSuccess: true,
        sortOrder: 4,
      },
    }),
    prisma.orderStatus.upsert({
      where: { code: 'cancelled' },
      update: {},
      create: {
        name: 'Отменен',
        code: 'cancelled',
        color: '#e03131',
        isFinalFailure: true,
        sortOrder: 5,
      },
    }),
  ])

  // Создаем методы доставки
  const deliveryMethods = await Promise.all([
    prisma.deliveryMethod.upsert({
      where: { code: 'pickup' },
      update: {},
      create: {
        name: 'Самовывоз',
        code: 'pickup',
        description: 'Самовывоз со склада',
        price: 0,
        sortOrder: 1,
      },
    }),
    prisma.deliveryMethod.upsert({
      where: { code: 'courier' },
      update: {},
      create: {
        name: 'Курьером',
        code: 'courier',
        description: 'Доставка курьером по городу',
        price: 300,
        minAmount: 3000,
        sortOrder: 2,
      },
    }),
    prisma.deliveryMethod.upsert({
      where: { code: 'cdek' },
      update: {},
      create: {
        name: 'СДЭК',
        code: 'cdek',
        description: 'Доставка транспортной компанией СДЭК',
        price: 500,
        sortOrder: 3,
      },
    }),
  ])

  // Создаем методы оплаты
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { code: 'cash' },
      update: {},
      create: {
        name: 'Наличными',
        code: 'cash',
        description: 'Оплата наличными при получении',
        icon: '💵',
        sortOrder: 1,
      },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'card' },
      update: {},
      create: {
        name: 'Картой онлайн',
        code: 'card',
        description: 'Оплата банковской картой',
        icon: '💳',
        isOnline: true,
        commission: 2.5,
        sortOrder: 2,
      },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'invoice' },
      update: {},
      create: {
        name: 'Счет для юр. лиц',
        code: 'invoice',
        description: 'Оплата по счету для юридических лиц',
        icon: '📄',
        sortOrder: 3,
      },
    }),
  ])

  // Создаем тестовые бренды
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'bosch' },
      update: {},
      create: {
        name: 'Bosch',
        slug: 'bosch',
        country: 'Германия',
        description: 'Ведущий производитель автомобильных компонентов',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'mann-filter' },
      update: {},
      create: {
        name: 'MANN-FILTER',
        slug: 'mann-filter',
        country: 'Германия',
        description: 'Премиальные фильтры для автомобилей',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'ngk' },
      update: {},
      create: {
        name: 'NGK',
        slug: 'ngk',
        country: 'Япония',
        description: 'Свечи зажигания и датчики',
      },
    }),
  ])

  // Создаем тестового администратора
  const admin = await prisma.user.upsert({
    where: { phone: '+79001234567' },
    update: {},
    create: {
      phone: '+79001234567',
      email: 'admin@aso-parts.ru',
      firstName: 'Админ',
      lastName: 'Админов',
      role: 'ADMIN',
      phoneVerified: true,
      emailVerified: true,
    },
  })

  console.log('✅ База данных успешно заполнена начальными данными!')
  console.log('📱 Тестовый администратор: +79001234567')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

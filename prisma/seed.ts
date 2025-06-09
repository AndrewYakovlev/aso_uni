import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начинаем заполнение базы данных...")

  // Создаем группу клиентов по умолчанию
  const defaultCustomerGroup = await prisma.customerGroup.create({
    data: {
      name: "Стандартная группа",
      discountPercent: 0,
      benefits: {
        description: "Стандартные условия для всех клиентов",
      },
    },
  })

  // Создаем администратора
  const adminUser = await prisma.user.create({
    data: {
      phone: "+79999999999",
      email: "admin@aso.local",
      firstName: "Администратор",
      lastName: "Системы",
      role: "ADMIN",
    },
  })

  console.log("✅ Создан администратор:", adminUser.phone)

  // Создаем менеджера
  const managerUser = await prisma.user.create({
    data: {
      phone: "+79998888888",
      email: "manager@aso.local",
      firstName: "Менеджер",
      lastName: "Продаж",
      role: "MANAGER",
    },
  })

  console.log("✅ Создан менеджер:", managerUser.phone)

  // Создаем тестового клиента
  const customerUser = await prisma.user.create({
    data: {
      phone: "+79997777777",
      email: "customer@aso.local",
      firstName: "Тестовый",
      lastName: "Клиент",
      role: "CUSTOMER",
      customerGroupId: defaultCustomerGroup.id,
    },
  })

  console.log("✅ Создан тестовый клиент:", customerUser.phone)

  // Создаем статусы чатов
  const chatStatuses = await Promise.all([
    prisma.chatStatus.create({
      data: {
        name: "Новый",
        code: "new",
        color: "#10B981",
        sortOrder: 10,
        isActive: true,
      },
    }),
    prisma.chatStatus.create({
      data: {
        name: "В работе",
        code: "in_progress",
        color: "#3B82F6",
        sortOrder: 20,
        isActive: true,
      },
    }),
    prisma.chatStatus.create({
      data: {
        name: "Ожидает ответа",
        code: "awaiting_response",
        color: "#F59E0B",
        sortOrder: 30,
        isActive: true,
      },
    }),
    prisma.chatStatus.create({
      data: {
        name: "Закрыт",
        code: "closed",
        color: "#6B7280",
        sortOrder: 40,
        isActive: true,
      },
    }),
  ])

  console.log("✅ Созданы статусы чатов:", chatStatuses.length)

  // Создаем статусы заказов
  const orderStatuses = await Promise.all([
    prisma.orderStatus.create({
      data: {
        name: "Новый",
        code: "new",
        color: "#10B981",
        description: "Заказ только что создан",
        isInitial: true,
        sortOrder: 10,
        isActive: true,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "В обработке",
        code: "processing",
        color: "#3B82F6",
        description: "Заказ обрабатывается менеджером",
        sortOrder: 20,
        isActive: true,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "Ожидает оплаты",
        code: "awaiting_payment",
        color: "#F59E0B",
        description: "Ожидается оплата от клиента",
        sortOrder: 30,
        isActive: true,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "Оплачен",
        code: "paid",
        color: "#8B5CF6",
        description: "Заказ оплачен",
        sortOrder: 40,
        isActive: true,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "В доставке",
        code: "shipping",
        color: "#06B6D4",
        description: "Заказ передан в службу доставки",
        sortOrder: 50,
        isActive: true,
        canCancelOrder: false,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "Доставлен",
        code: "delivered",
        color: "#059669",
        description: "Заказ доставлен клиенту",
        isFinalSuccess: true,
        sortOrder: 60,
        isActive: true,
        canCancelOrder: false,
      },
    }),
    prisma.orderStatus.create({
      data: {
        name: "Отменен",
        code: "cancelled",
        color: "#EF4444",
        description: "Заказ отменен",
        isFinalFailure: true,
        sortOrder: 70,
        isActive: true,
        canCancelOrder: false,
      },
    }),
  ])

  console.log("✅ Созданы статусы заказов:", orderStatuses.length)

  // Создаем методы доставки
  const deliveryMethods = await Promise.all([
    prisma.deliveryMethod.create({
      data: {
        name: "Самовывоз",
        code: "pickup",
        description: "Самовывоз со склада",
        price: 0,
        sortOrder: 10,
        isActive: true,
        settings: {
          address: "г. Москва, ул. Складская, д. 1",
          workingHours: "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
        },
      },
    }),
    prisma.deliveryMethod.create({
      data: {
        name: "Доставка курьером",
        code: "courier",
        description: "Доставка курьером по городу",
        price: 300,
        minAmount: 3000,
        sortOrder: 20,
        isActive: true,
        settings: {
          deliveryTime: "1-2 рабочих дня",
          zones: ["В пределах МКАД"],
        },
      },
    }),
    prisma.deliveryMethod.create({
      data: {
        name: "Доставка транспортной компанией",
        code: "transport_company",
        description: "Доставка транспортной компанией по России",
        price: 500,
        sortOrder: 30,
        isActive: true,
        settings: {
          companies: ["СДЭК", "Деловые линии", "ПЭК"],
          deliveryTime: "3-7 рабочих дней",
        },
      },
    }),
  ])

  console.log("✅ Созданы методы доставки:", deliveryMethods.length)

  // Создаем методы оплаты
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.create({
      data: {
        name: "Наличными при получении",
        code: "cash",
        description: "Оплата наличными курьеру или при самовывозе",
        icon: "cash",
        isOnline: false,
        sortOrder: 10,
        isActive: true,
      },
    }),
    prisma.paymentMethod.create({
      data: {
        name: "Банковской картой онлайн",
        code: "card_online",
        description: "Оплата картой Visa, MasterCard, МИР",
        icon: "credit-card",
        isOnline: true,
        sortOrder: 20,
        isActive: true,
        commission: 2.5,
        settings: {
          provider: "yookassa",
          supportedCards: ["visa", "mastercard", "mir"],
        },
      },
    }),
    prisma.paymentMethod.create({
      data: {
        name: "Безналичный расчет",
        code: "invoice",
        description: "Оплата по счету для юридических лиц",
        icon: "file-text",
        isOnline: false,
        sortOrder: 30,
        isActive: true,
        settings: {
          requiresCompanyDetails: true,
        },
      },
    }),
  ])

  console.log("✅ Созданы методы оплаты:", paymentMethods.length)

  // Создаем тестовые бренды
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: "Bosch",
        slug: "bosch",
        country: "Германия",
        description: "Немецкий производитель автозапчастей премиум-класса",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Mann-Filter",
        slug: "mann-filter",
        country: "Германия",
        description: "Ведущий производитель фильтров",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "NGK",
        slug: "ngk",
        country: "Япония",
        description: "Мировой лидер в производстве свечей зажигания",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Denso",
        slug: "denso",
        country: "Япония",
        description: "Японский производитель автокомпонентов",
        isActive: true,
      },
    }),
  ])

  console.log("✅ Созданы бренды:", brands.length)

  // Создаем корневые категории
  const rootCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Двигатель",
        slug: "engine",
        description: "Запчасти для двигателя",
        sortOrder: 10,
        isActive: true,
        metaTitle: "Запчасти для двигателя - купить в интернет-магазине АСО",
        metaDescription:
          "Большой выбор запчастей для двигателя автомобиля. Оригинальные и аналоги. Доставка по России.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Тормозная система",
        slug: "brake-system",
        description: "Компоненты тормозной системы",
        sortOrder: 20,
        isActive: true,
        metaTitle:
          "Запчасти тормозной системы - купить в интернет-магазине АСО",
        metaDescription:
          "Тормозные диски, колодки, суппорты и другие компоненты тормозной системы.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Подвеска",
        slug: "suspension",
        description: "Элементы подвески автомобиля",
        sortOrder: 30,
        isActive: true,
        metaTitle: "Запчасти подвески - купить в интернет-магазине АСО",
        metaDescription:
          "Амортизаторы, пружины, рычаги и другие элементы подвески.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Фильтры",
        slug: "filters",
        description: "Все виды фильтров для автомобиля",
        sortOrder: 40,
        isActive: true,
        metaTitle: "Автомобильные фильтры - купить в интернет-магазине АСО",
        metaDescription:
          "Воздушные, масляные, топливные, салонные фильтры для всех марок автомобилей.",
      },
    }),
  ])

  console.log("✅ Созданы корневые категории:", rootCategories.length)

  // Создаем подкатегории для "Фильтры"
  const filtersCategory = rootCategories.find(c => c.slug === "filters")!
  const filterSubcategories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Воздушные фильтры",
        slug: "air-filters",
        description: "Фильтры воздушные для двигателя",
        parentId: filtersCategory.id,
        sortOrder: 10,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Масляные фильтры",
        slug: "oil-filters",
        description: "Фильтры для моторного масла",
        parentId: filtersCategory.id,
        sortOrder: 20,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Топливные фильтры",
        slug: "fuel-filters",
        description: "Фильтры топливной системы",
        parentId: filtersCategory.id,
        sortOrder: 30,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Салонные фильтры",
        slug: "cabin-filters",
        description: "Фильтры салона автомобиля",
        parentId: filtersCategory.id,
        sortOrder: 40,
        isActive: true,
      },
    }),
  ])

  console.log(
    "✅ Созданы подкатегории для фильтров:",
    filterSubcategories.length
  )

  console.log("🎉 Инициализация базы данных завершена успешно!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error("❌ Ошибка при инициализации базы данных:", e)
    await prisma.$disconnect()
    process.exit(1)
  })

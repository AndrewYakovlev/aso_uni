import { prisma } from '@/shared/lib/prisma'
import { Prisma } from '@prisma/client'

// Используем встроенный тип Prisma для транзакций
type PrismaTransaction = Prisma.TransactionClient

// Слияние данных анонимного пользователя с авторизованным
export async function mergeAnonymousDataToUser(userId: string, anonymousId: string): Promise<void> {
  // Начинаем транзакцию для атомарности операций
  await prisma.$transaction(async tx => {
    // 1. Слияние корзин
    await mergeCartsTransaction(tx, userId, anonymousId)

    // 2. Перенос истории просмотров
    await mergeViewHistoryTransaction(tx, userId, anonymousId)

    // 3. Перенос чатов
    await mergeChatsTransaction(tx, userId, anonymousId)

    // НЕ удаляем анонимного пользователя - данные остаются для аналитики
  })
}

// Слияние корзин
async function mergeCartsTransaction(
  tx: PrismaTransaction,
  userId: string,
  anonymousId: string
): Promise<void> {
  // Получаем корзины обоих пользователей
  const [userCart, anonymousCart] = await Promise.all([
    tx.cart.findFirst({
      where: { userId },
      include: { items: true },
    }),
    tx.cart.findFirst({
      where: { anonymousId },
      include: { items: true },
    }),
  ])

  // Если у анонимного пользователя нет корзины, ничего не делаем
  if (!anonymousCart || anonymousCart.items.length === 0) {
    return
  }

  // Если у авторизованного пользователя нет корзины, просто переносим
  if (!userCart) {
    await tx.cart.update({
      where: { id: anonymousCart.id },
      data: {
        userId,
        anonymousId: null,
      },
    })
    return
  }

  // Если обе корзины существуют, объединяем товары
  for (const anonymousItem of anonymousCart.items) {
    if (!anonymousItem.productId) continue

    // Проверяем, есть ли такой товар в корзине пользователя
    const existingItem = userCart.items.find(item => item.productId === anonymousItem.productId)

    if (existingItem) {
      // Увеличиваем количество
      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + anonymousItem.quantity,
        },
      })
    } else {
      // Переносим товар в корзину пользователя
      await tx.cartItem.update({
        where: { id: anonymousItem.id },
        data: {
          cartId: userCart.id,
        },
      })
    }
  }

  // Удаляем пустую анонимную корзину
  await tx.cart.delete({
    where: { id: anonymousCart.id },
  })
}

// Слияние истории просмотров
async function mergeViewHistoryTransaction(
  tx: PrismaTransaction,
  userId: string,
  anonymousId: string
): Promise<void> {
  // Переносим всю историю просмотров анонимного пользователя
  await tx.viewHistory.updateMany({
    where: { anonymousId },
    data: {
      userId,
      anonymousId: null,
    },
  })
}

// Слияние чатов
async function mergeChatsTransaction(
  tx: PrismaTransaction,
  userId: string,
  anonymousId: string
): Promise<void> {
  // Переносим все чаты анонимного пользователя
  await tx.chat.updateMany({
    where: { anonymousId },
    data: {
      userId,
      anonymousId: null,
    },
  })
}

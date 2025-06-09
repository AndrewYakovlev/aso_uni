import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Функция для проверки соединения с БД
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log("✅ База данных подключена успешно")
    return true
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error)
    return false
  }
}

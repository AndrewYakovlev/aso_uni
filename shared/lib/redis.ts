import { createClient } from "redis"

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

export const redis =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  })

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

// Подключаемся к Redis при инициализации
redis.on("error", err => {
  console.error("❌ Redis Client Error:", err)
})

redis.on("connect", () => {
  console.log("✅ Redis подключен успешно")
})

// Автоматическое подключение
if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

// Утилиты для работы с кешем
export const cache = {
  // Получить значение из кеша
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Ошибка при получении из кеша ${key}:`, error)
      return null
    }
  },

  // Сохранить значение в кеш
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setEx(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
    } catch (error) {
      console.error(`Ошибка при сохранении в кеш ${key}:`, error)
    }
  },

  // Удалить значение из кеша
  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await redis.del(key)
      } else {
        await redis.del(key)
      }
    } catch (error) {
      console.error(`Ошибка при удалении из кеша:`, error)
    }
  },

  // Очистить весь кеш (использовать с осторожностью!)
  async flush(): Promise<void> {
    try {
      await redis.flushAll()
    } catch (error) {
      console.error("Ошибка при очистке кеша:", error)
    }
  },

  // Проверить существование ключа
  async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1
    } catch (error) {
      console.error(`Ошибка при проверке существования ключа ${key}:`, error)
      return false
    }
  },

  // Установить TTL для существующего ключа
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl)
    } catch (error) {
      console.error(`Ошибка при установке TTL для ${key}:`, error)
    }
  },
}

export const config = {
  // База данных
  database: {
    url: "postgresql://user:password@localhost:5432/aso_dev",
  },

  // Redis
  redis: {
    host: "localhost",
    port: 6379,
    password: undefined as string | undefined,
  },

  // JWT настройки
  jwt: {
    secret: "your-super-secret-jwt-key-change-this",
    expiresIn: "7d",
    refreshExpiresIn: "30d",
  },

  // SMS.ru настройки
  sms: {
    apiKey: "your-sms-ru-api-key",
    from: "ASO-PARTS",
    testMode: true, // В тестовом режиме SMS не отправляются
  },

  // Email настройки (для уведомлений о заказах)
  email: {
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    user: "noreply@aso-parts.ru",
    password: "your-email-password",
    from: "Автозапчасти АСО <noreply@aso-parts.ru>",
  },

  // Приложение
  app: {
    name: "Автозапчасти АСО",
    url: "http://localhost:3000",
    port: 3000,
    env: "development" as "development" | "production" | "test",
  },

  // Загрузка файлов
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    imagePath: "/uploads/images",
    documentPath: "/uploads/documents",
  },

  // Безопасность
  security: {
    bcryptRounds: 10,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 минут
    rateLimitMaxRequests: 100,
    corsOrigins: ["http://localhost:3000"],
  },
}

export type Config = typeof config

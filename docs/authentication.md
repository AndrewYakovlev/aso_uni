# Система авторизации

## Обзор

Система авторизации построена на основе OTP (One-Time Password) кодов, отправляемых по SMS. Это обеспечивает:

- Простую авторизацию без паролей
- Верификацию номера телефона
- Быстрый вход для постоянных клиентов
- Безопасность через временные коды

## Архитектура

### Токены

Система использует два типа токенов:

1. **Access Token** (JWT)
   - Срок жизни: 15 минут
   - Используется для авторизации запросов
   - Содержит: ID пользователя, роль

2. **Refresh Token** (JWT)
   - Срок жизни: 7 дней
   - Используется для обновления Access Token
   - Хранится в httpOnly cookie

### Процесс авторизации

1. Пользователь вводит номер телефона
2. Система генерирует 4-значный код и отправляет SMS
3. Пользователь вводит код
4. При успешной проверке:
   - Создается/находится пользователь
   - Генерируются токены
   - Данные анонимного пользователя переносятся
   - Устанавливаются cookies

## API Endpoints

### POST /api/v1/auth/send-otp

Отправка OTP кода на телефон.

**Request:**
```json
{
  "phone": "+79999999999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Код подтверждения отправлен",
    "expiresIn": 300  // только в dev режиме
  }
}
```

**Ограничения:**
- Максимум 3 попытки за 15 минут
- Минимум 1 минута между отправками

### POST /api/v1/auth/verify-otp

Проверка OTP кода и авторизация.

**Request:**
```json
{
  "phone": "+79999999999",
  "code": "1234",
  "firstName": "Иван",      // опционально
  "lastName": "Иванов",     // опционально
  "email": "ivan@mail.ru"   // опционально
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxxxxxxx",
      "phone": "+79999999999",
      "email": "ivan@mail.ru",
      "firstName": "Иван",
      "lastName": "Иванов",
      "role": "CUSTOMER"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### POST /api/v1/auth/refresh

Обновление токенов.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### POST /api/v1/auth/logout

Выход из системы.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Вы успешно вышли из системы"
  }
}
```

### GET /api/v1/auth/me

Получение текущего пользователя.

**Response для авторизованного:**
```json
{
  "success": true,
  "data": {
    "type": "user",
    "user": {
      "id": "clxxxxxxxx",
      "phone": "+79999999999",
      "email": "ivan@mail.ru",
      "firstName": "Иван",
      "lastName": "Иванов",
      "role": "CUSTOMER"
    }
  }
}
```

## Использование на клиенте

### React компоненты

```typescript
import { useAuthStore } from '@/features/auth/model/auth-store'

function LoginForm() {
  const { sendOTP, verifyOTP, isLoading, otpState } = useAuthStore()
  
  // Отправка кода
  const handleSendCode = async () => {
    await sendOTP('+79999999999')
  }
  
  // Проверка кода
  const handleVerifyCode = async (code: string) => {
    await verifyOTP(code, {
      firstName: 'Иван',
      lastName: 'Иванов'
    })
  }
}
```

### Проверка авторизации

```typescript
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'

function ProtectedComponent() {
  const { data: user, isLoading } = useCurrentUser()
  
  if (isLoading) return <div>Loading...</div>
  
  if (user?.type !== 'user') {
    return <div>Требуется авторизация</div>
  }
  
  return <div>Привет, {user.user.firstName}!</div>
}
```

### Защита API routes

```typescript
import { requireAuth, requireManager } from '@/shared/lib/auth/middleware'

// Только для авторизованных
export const GET = requireAuth(async (request) => {
  const user = getRequestUser(request)
  // user гарантированно есть
})

// Только для менеджеров и админов
export const POST = requireManager(async (request) => {
  // доступ только для MANAGER и ADMIN ролей
})
```

## Роли пользователей

- **CUSTOMER** - обычный покупатель
- **MANAGER** - менеджер (доступ к панели управления)
- **ADMIN** - администратор (полный доступ)

## SMS провайдер

Используется SMS.ru для отправки сообщений.

### Настройка

1. Зарегистрируйтесь на sms.ru
2. Получите API ID
3. Добавьте в `.env.local`:
   ```
   SMS_RU_API_ID=your-api-id
   SMS_RU_TEST_MODE=0  # 1 для тестового режима
   ```

### Тестовый режим

Когда `SMS_RU_TEST_MODE=1`:
- SMS не отправляются
- Код выводится в консоль сервера
- Не тратится баланс

## Безопасность

1. **Rate Limiting**
   - Максимум 3 попытки отправки за 15 минут
   - 1 минута между отправками

2. **OTP коды**
   - Длина: 4 цифры
   - Срок жизни: 5 минут
   - Максимум попыток: 3

3. **Токены**
   - Подписаны секретным ключом
   - httpOnly cookies
   - Secure в production
   - SameSite: lax

4. **Валидация**
   - Нормализация номеров телефона
   - Проверка формата
   - Zod схемы для всех endpoints

## Миграция анонимных данных

При авторизации автоматически переносятся:
- Товары из корзины
- История просмотров
- Активные чаты

Данные анонимного пользователя сохраняются для аналитики.

## Troubleshooting

### SMS не приходят
1. Проверьте баланс SMS.ru
2. Убедитесь, что API ID правильный
3. Проверьте логи сервера

### Код не принимается
1. Проверьте срок действия (5 минут)
2. Убедитесь, что не превышен лимит попыток
3. Проверьте правильность номера

### Токен истек
1. Используйте refresh endpoint
2. При ошибке 401 - перенаправьте на авторизацию
3. Проверьте cookies в браузере
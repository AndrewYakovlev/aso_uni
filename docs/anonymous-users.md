# Система анонимных пользователей

## Обзор

Система анонимных пользователей позволяет отслеживать действия посетителей сайта до их регистрации. Это необходимо для:

- Сохранения корзины покупок
- Истории просмотров товаров
- Ведения чатов с поддержкой
- Сбора аналитики и статистики
- Персонализации контента

## Как это работает

### 1. Создание анонимного пользователя

При первом посещении сайта:
1. Middleware проверяет наличие анонимного токена в cookies
2. Если токена нет, отправляется запрос на `/api/v1/auth/anonymous`
3. Создается запись в таблице `AnonymousUser`
4. Генерируется уникальный session ID в формате `anon_<timestamp>_<random>`
5. Session ID сохраняется в cookies на 365 дней

### 2. Проверка и обновление токена

При каждом посещении страницы (не API запросе):
1. Middleware извлекает токен из cookies
2. Проверяется существование анонимного пользователя в БД
3. Обновляется `lastActivity` для отслеживания активности
4. **Обновляется срок жизни cookie на следующие 365 дней**
5. Если пользователь не найден, создается новый

### 3. Слияние данных при регистрации

При авторизации пользователя:
1. Вызывается функция `mergeAnonymousDataToUser`
2. Переносятся:
   - Товары из корзины
   - История просмотров
   - Активные чаты
3. Анонимный токен удаляется из cookies
4. **Данные анонимного пользователя НЕ удаляются для аналитики**

### 4. Жизненный цикл анонимного пользователя

- Токен живет 365 дней
- При каждом посещении срок продлевается на 365 дней
- После 365 дней неактивности пользователь считается новым
- Старые данные сохраняются для статистики

## API

### Endpoints

#### POST /api/v1/auth/anonymous
Создает нового анонимного пользователя.

**Response:**
```json
{
  "success": true,
  "data": {
    "anonymousUser": {
      "id": "clxxxxxxxx",
      "sessionId": "anon_lxyz123_ABC123randomString"
    }
  }
}
```

#### POST /api/v1/auth/anonymous/activity
Обновляет активность анонимного пользователя и продлевает cookie.

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "anonymousId": "clxxxxxxxx"
  }
}
```

#### GET /api/v1/auth/me
Возвращает информацию о текущем пользователе.

**Response для анонимного:**
```json
{
  "success": true,
  "data": {
    "type": "anonymous",
    "anonymousUser": {
      "id": "clxxxxxxxx",
      "sessionId": "anon_lxyz123_ABC123randomString"
    }
  }
}
```

## Использование на клиенте

### React Hook

```typescript
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'

function MyComponent() {
  const { data, isLoading } = useCurrentUser()
  
  if (isLoading) return <div>Loading...</div>
  
  if (data?.type === 'user') {
    return <div>Привет, {data.user.firstName}!</div>
  }
  
  return <div>Вы не авторизованы</div>
}
```

### Серверные компоненты

```typescript
import { getCurrentUser } from '@/shared/lib/auth/get-current-user'

export default async function ServerComponent() {
  const currentUser = await getCurrentUser()
  
  if (currentUser?.type === 'user') {
    return <div>Привет, {currentUser.user.firstName}!</div>
  }
  
  return <div>Вы не авторизованы</div>
}
```

## Cookies

Система использует следующие cookies:

- `aso-anonymous-token` - Уникальный идентификатор анонимного пользователя (365 дней, обновляется при каждом посещении)
- `aso-session-id` - Дублирует anonymous token для совместимости (365 дней)
- `aso-access-token` - JWT токен авторизованного пользователя (15 минут)
- `aso-refresh-token` - Токен для обновления access токена (7 дней)

## Особенности реализации

### Формат анонимного токена
```
anon_<timestamp>_<random>
```
- `timestamp` - время создания в base36 для компактности
- `random` - 16 символов случайной строки

### Обновление срока жизни
- Cookie обновляется при каждом посещении страницы
- API запросы не обновляют cookie для оптимизации
- Статические ресурсы не обновляют cookie

### Сохранение данных
- Анонимные пользователи НИКОГДА не удаляются
- Данные накапливаются для аналитики
- При слиянии связи обновляются, но записи остаются

## Безопасность

1. Токены генерируются с помощью криптографически стойкого генератора
2. IP адрес и User-Agent сохраняются для аудита
3. Cookie имеют флаги httpOnly, secure (в production), sameSite
4. Нет автоматической очистки данных

## Аналитика

Благодаря сохранению всех данных можно анализировать:

- Конверсию анонимных пользователей в зарегистрированных
- Среднее время до регистрации
- Поведение пользователей до регистрации
- Сезонность посещений
- Географию посетителей по IP

## Примеры SQL запросов для аналитики

```sql
-- Количество анонимных пользователей по месяцам
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as anonymous_users
FROM anonymous_users
GROUP BY month
ORDER BY month DESC;

-- Конверсия в зарегистрированных
SELECT 
  COUNT(DISTINCT au.id) FILTER (WHERE u.id IS NOT NULL) * 100.0 / COUNT(DISTINCT au.id) as conversion_rate
FROM anonymous_users au
LEFT JOIN users u ON EXISTS (
  SELECT 1 FROM carts c 
  WHERE c.anonymous_id = au.id 
  AND c.user_id = u.id
);
```

## Миграция существующих пользователей

Если у вас уже есть пользователи без связи с анонимными данными, используйте следующий подход:

1. При авторизации проверяйте наличие анонимного токена
2. Если есть, вызывайте `mergeAnonymousDataToUser`
3. Это автоматически перенесет все данные

## Troubleshooting

### Токен не создается
1. Проверьте, что middleware подключен в `middleware.ts`
2. Убедитесь, что путь не в списке `excludedPaths`
3. Проверьте логи сервера на ошибки

### Cookie не обновляется
1. Проверьте, что посещаются страницы, а не только API
2. Убедитесь, что middleware обрабатывает запрос
3. Проверьте консоль на ошибки

### Данные не переносятся при авторизации
1. Проверьте, что вызывается `mergeAnonymousDataToUser`
2. Убедитесь, что транзакция выполняется успешно
3. Проверьте наличие связей в БД
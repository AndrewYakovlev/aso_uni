# Frontend компоненты авторизации

## Обзор

Frontend часть системы авторизации включает в себя набор React компонентов для удобной авторизации пользователей через SMS.

## Компоненты

### 1. AuthButton

Универсальная кнопка для входа/выхода и доступа к личному кабинету.

```tsx
import { AuthButton } from '@/features/auth'

// В шапке сайта
<header>
  <AuthButton />
</header>
```

**Поведение:**
- Для анонимных: показывает кнопку "Войти"
- Для авторизованных: выпадающее меню с опциями

### 2. LoginModal

Модальное окно с двухшаговой формой авторизации.

```tsx
import { LoginModal } from '@/features/auth'

function MyComponent() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Войти</button>
      <LoginModal open={open} onOpenChange={setOpen} />
    </>
  )
}
```

### 3. PhoneInput

Компонент ввода телефона с маской +7 (XXX) XXX-XX-XX.

```tsx
import { PhoneInput } from '@/shared/ui/phone-input'

<PhoneInput 
  value={phone}
  onChange={(value) => setPhone(value)}
  placeholder="+7 (___) ___-__-__"
/>
```

**Особенности:**
- Автоматическая маска
- Нормализация номера в формат +7XXXXXXXXXX
- Поддержка различных форматов ввода

## Уведомления (Sonner)

Для уведомлений используется библиотека Sonner вместо устаревшего toast из shadcn.

```tsx
import { toast } from 'sonner'

// Успех
toast.success('Заголовок', {
  description: 'Описание действия'
})

// Ошибка
toast.error('Ошибка', {
  description: 'Что-то пошло не так'
})

// Информация
toast.info('Информация')

// С кастомным временем
toast.success('Сообщение', {
  duration: 10000 // 10 секунд
})
```

## Zustand Store

Управление состоянием авторизации через Zustand.

```tsx
import { useAuthStore } from '@/features/auth'

function MyComponent() {
  const { 
    sendOTP,      // Отправить код
    verifyOTP,    // Проверить код
    logout,       // Выйти
    isLoading,    // Состояние загрузки
    otpState,     // Состояние OTP
    user          // Текущий пользователь
  } = useAuthStore()
}
```

## Хуки

### useCurrentUser

Получение текущего пользователя через React Query.

```tsx
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'

function MyComponent() {
  const { data, isLoading, error } = useCurrentUser()
  
  if (data?.type === 'user') {
    // Пользователь авторизован
    console.log(data.user)
  }
}
```

### Селекторы из store

```tsx
import { 
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  useOTPState 
} from '@/features/auth'

// Проверка авторизации
const isAuth = useIsAuthenticated()

// Состояние OTP
const { sent, phone, expiresIn, error } = useOTPState()
```

## Процесс авторизации

1. **Ввод телефона**
   - Пользователь вводит номер в формате +7 (XXX) XXX-XX-XX
   - Маска автоматически форматирует ввод
   - Номер нормализуется в +7XXXXXXXXXX

2. **Отправка кода**
   - Генерируется 4-значный код
   - SMS отправляется через SMS.ru
   - В тестовом режиме код выводится в консоль

3. **Ввод кода**
   - Используется InputOTP компонент
   - 4 отдельных поля для цифр
   - Автоматическая отправка при заполнении

4. **Таймер и повтор**
   - Обратный отсчет 5 минут
   - Возможность повторной отправки
   - Блокировка при истечении времени

5. **Успешная авторизация**
   - Создание/обновление пользователя
   - Генерация JWT токенов
   - Слияние данных анонимного пользователя
   - Обновление UI

## Стилизация

Все компоненты используют:
- Tailwind CSS для стилей
- shadcn/ui компоненты
- Темы через CSS переменные
- Поддержка темной темы

## Примеры использования

### Защищенная страница

```tsx
'use client'

import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'
import { LoginModal } from '@/features/auth'
import { useState } from 'react'

export default function ProtectedPage() {
  const { data: user, isLoading } = useCurrentUser()
  const [showLogin, setShowLogin] = useState(false)
  
  if (isLoading) return <div>Загрузка...</div>
  
  if (user?.type !== 'user') {
    return (
      <div>
        <p>Требуется авторизация</p>
        <button onClick={() => setShowLogin(true)}>
          Войти
        </button>
        <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      </div>
    )
  }
  
  return <div>Защищенный контент</div>
}
```

### Кастомная форма авторизации

```tsx
import { SendOTPForm, VerifyOTPForm } from '@/features/auth'
import { useState } from 'react'

export default function CustomAuth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  
  return (
    <div className="max-w-md mx-auto">
      {step === 'phone' ? (
        <SendOTPForm onSuccess={() => setStep('otp')} />
      ) : (
        <VerifyOTPForm 
          onBack={() => setStep('phone')}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
```

## Обработка ошибок

Все ошибки обрабатываются автоматически и показываются через toast уведомления:

- Ошибки сети
- Неверный код
- Истекший код
- Rate limiting
- Ошибки валидации

## Безопасность

- httpOnly cookies для токенов
- CSRF защита через SameSite cookies
- Rate limiting на стороне сервера
- Валидация на клиенте и сервере
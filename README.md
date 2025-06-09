# Автозапчасти АСО - Интернет-магазин автозапчастей

## Технологический стек

### Frontend
- **Framework**: Next.js 15.2.3+ (App Router)
- **UI Library**: React 19
- **Стилизация**: Tailwind CSS 4.1
- **Компоненты**: shadcn
- **State Management**: Zustand + TanStack Query v5
- **Формы**: React Hook Form + Zod
- **Архитектура**: Feature-Sliced Design (FSD)

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma 6.9.0
- **База данных**: PostgreSQL 15
- **Кеширование**: Redis 7
- **Валидация**: Zod
- **Аутентификация**: JWT + httpOnly cookies

## Быстрый старт

### Требования
- Node.js 18+
- Docker и Docker Compose
- npm или yarn

### Установка и запуск

1. **Клонирование репозитория**
```bash
git clone [repository-url]
cd auto-parts-store
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Запуск Docker контейнеров**
```bash
docker-compose up -d
```

4. **Настройка переменных окружения**
```bash
cp .env.local.example .env.local
# Отредактируйте .env.local согласно вашим настройкам
```

5. **Инициализация базы данных**
```bash
# Применение миграций
npm run db:push

# Заполнение базовыми данными
npm run db:seed
```

6. **Запуск приложения**
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Доступы по умолчанию

После выполнения seed скрипта будут созданы следующие пользователи:

- **Администратор**: +79999999999
- **Менеджер**: +79998888888
- **Клиент**: +79997777777

## Структура проекта

```
auto-parts-store/
├── app/                    # Next.js 15 приложение
│   ├── (public)/          # Публичные страницы
│   ├── panel/             # Административная панель
│   └── api/               # API Routes
├── widgets/               # Переиспользуемые UI блоки
├── features/              # Функциональные модули
├── entities/              # Бизнес-сущности
├── shared/                # Общий код
│   ├── api/              # API клиенты
│   ├── config/           # Конфигурация
│   ├── lib/              # Утилиты
│   ├── types/            # TypeScript типы
│   └── ui/               # UI компоненты
├── prisma/                # Схема и миграции БД
└── infrastructure/        # DevOps конфигурации
```

## Основные команды

### Разработка
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для production
npm run start        # Запуск production сборки
npm run lint         # Проверка кода
npm run type-check   # Проверка типов
```

### База данных
```bash
npm run db:push      # Применить схему к БД
npm run db:migrate   # Создать и применить миграцию
npm run db:seed      # Заполнить БД тестовыми данными
npm run db:studio    # Открыть Prisma Studio
npm run db:generate  # Сгенерировать Prisma Client
npm run db:reset     # Сбросить БД и применить миграции
```

### Docker
```bash
docker-compose up -d     # Запустить контейнеры
docker-compose down      # Остановить контейнеры
docker-compose logs -f   # Просмотр логов
```

## Дополнительные сервисы

### pgAdmin
- URL: http://localhost:5050
- Email: admin@aso.local
- Password: admin

### Redis Commander (опционально)
Для удобства работы с Redis можно установить Redis Commander:
```bash
npm install -g redis-commander
redis-commander
```

## Архитектура (FSD)

Проект следует методологии Feature-Sliced Design:

- **app/** - слой приложения (роутинг, провайдеры, глобальные стили)
- **widgets/** - композиционный слой (сборка features и entities)
- **features/** - слой фич (пользовательские сценарии)
- **entities/** - слой бизнес-сущностей
- **shared/** - переиспользуемый код

Каждый слой может импортировать только из слоев ниже.

## Разработка

### Создание новой фичи
1. Создайте папку в `features/feature-name`
2. Следуйте структуре:
   - `ui/` - React компоненты
   - `model/` - Zustand stores, бизнес-логика
   - `api/` - API вызовы
   - `index.ts` - публичный API модуля

### Работа с API
- Все API endpoints находятся в `app/api/v1/`
- Используйте `shared/api/` для клиентских вызовов
- Валидация через Zod схемы

### Стилизация
- Используйте Tailwind CSS классы
- Компоненты shadcn для базовых UI элементов
- CSS модули для сложных анимаций

## Деплой

Инструкции по деплою находятся в `infrastructure/README.md`

## Лицензия

Proprietary
#!/bin/bash

# Скрипт для инициализации базы данных

echo "🚀 Начинаем инициализацию базы данных..."

# Проверяем, запущены ли Docker контейнеры
if ! docker-compose ps | grep -q "aso-postgres.*Up"; then
    echo "📦 Запускаем Docker контейнеры..."
    docker-compose up -d
    
    # Ждем, пока PostgreSQL будет готов
    echo "⏳ Ожидаем готовности PostgreSQL..."
    sleep 5
    
    # Проверяем готовность PostgreSQL
    until docker-compose exec -T postgres pg_isready -U aso_user -d aso_db > /dev/null 2>&1; do
        echo "⏳ PostgreSQL еще не готов..."
        sleep 2
    done
fi

echo "✅ PostgreSQL готов к работе"

# Генерируем Prisma Client
echo "🔧 Генерируем Prisma Client..."
npm run db:generate

# Применяем схему к базе данных
echo "📝 Применяем схему к базе данных..."
npm run db:push

# Запускаем seed скрипт
echo "🌱 Заполняем базу данных начальными данными..."
npm run db:seed

echo "🎉 Инициализация базы данных завершена успешно!"
echo ""
echo "📌 Созданы следующие пользователи:"
echo "   - Администратор: +79999999999"
echo "   - Менеджер: +79998888888"
echo "   - Клиент: +79997777777"
echo ""
echo "🔗 Доступ к сервисам:"
echo "   - Приложение: http://localhost:3000"
echo "   - pgAdmin: http://localhost:5050 (admin@aso.local / admin)"
echo ""
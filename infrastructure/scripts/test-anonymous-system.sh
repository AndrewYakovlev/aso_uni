#!/bin/bash

echo "🧪 Тестирование системы анонимных пользователей"
echo "================================================"
echo ""

# Проверяем, запущено ли приложение
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Приложение не запущено. Запустите 'npm run dev' в другом терминале."
    exit 1
fi

echo "✅ Приложение запущено"
echo ""

# Тест 1: Создание анонимного пользователя
echo "📝 Тест 1: Создание анонимного пользователя"
echo "--------------------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/anonymous \
  -H "Content-Type: application/json" \
  -c cookies.txt)

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Извлекаем токен из response
SESSION_ID=$(echo "$RESPONSE" | jq -r '.data.anonymousUser.sessionId')
ANON_ID=$(echo "$RESPONSE" | jq -r '.data.anonymousUser.id')

if [ "$SESSION_ID" != "null" ] && [ "$ANON_ID" != "null" ]; then
    echo "✅ Анонимный пользователь создан успешно"
    echo "   Session ID: $SESSION_ID"
    echo "   Anonymous ID: $ANON_ID"
else
    echo "❌ Ошибка создания анонимного пользователя"
    exit 1
fi
echo ""

# Тест 2: Проверка /api/v1/auth/me
echo "📝 Тест 2: Проверка текущего пользователя"
echo "-----------------------------------------"

ME_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/me \
  -b cookies.txt)

echo "Response:"
echo "$ME_RESPONSE" | jq '.'
echo ""

USER_TYPE=$(echo "$ME_RESPONSE" | jq -r '.data.type')
if [ "$USER_TYPE" == "anonymous" ]; then
    echo "✅ Анонимный пользователь определен корректно"
else
    echo "❌ Ошибка определения пользователя"
fi
echo ""

# Тест 3: Проверка cookies
echo "📝 Тест 3: Проверка установленных cookies"
echo "-----------------------------------------"

if [ -f cookies.txt ]; then
    echo "Cookies:"
    cat cookies.txt | grep -E "(aso-anonymous-token|aso-session-id)" | awk '{print "   " $6 "=" substr($7, 1, 20) "..."}'
    echo ""
    echo "✅ Cookies установлены"
else
    echo "❌ Файл cookies не найден"
fi
echo ""

# Тест 4: Проверка обновления активности
echo "📝 Тест 4: Проверка обновления активности"
echo "-----------------------------------------"

ACTIVITY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/anonymous/activity \
  -b cookies.txt \
  -c cookies_updated.txt)

echo "Response:"
echo "$ACTIVITY_RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$ACTIVITY_RESPONSE" | jq -r '.data.success')
if [ "$SUCCESS" == "true" ]; then
    echo "✅ Активность обновлена успешно"
    echo "   Cookies также обновлены на следующие 365 дней"
else
    echo "❌ Ошибка обновления активности"
fi
echo ""

# Очистка
rm -f cookies.txt cookies_updated.txt

echo "🎉 Тестирование завершено!"
echo ""
echo "Для более детальной проверки:"
echo "1. Откройте http://localhost:3000/test-auth"
echo "2. Проверьте DevTools → Application → Cookies"
echo "3. Обновите страницу и убедитесь, что ID остается тем же"
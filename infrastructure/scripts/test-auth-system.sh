#!/bin/bash

echo "🧪 Тестирование системы авторизации"
echo "==================================="
echo ""

# Проверяем, запущено ли приложение
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Приложение не запущено. Запустите 'npm run dev' в другом терминале."
    exit 1
fi

echo "✅ Приложение запущено"
echo ""

# Тестовый номер телефона
PHONE="+79991234567"
PHONE_ENCODED="%2B79991234567"

# Тест 1: Отправка OTP
echo "📝 Тест 1: Отправка OTP кода"
echo "----------------------------"

OTP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}" \
  -c auth_cookies.txt)

echo "Response:"
echo "$OTP_RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$OTP_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo "✅ OTP отправлен успешно"
    echo "⚠️  Проверьте консоль сервера для получения кода"
else
    echo "❌ Ошибка отправки OTP"
    exit 1
fi
echo ""

# Ждем ввода кода от пользователя
echo "📱 Введите код из консоли сервера (4 цифры):"
read -r OTP_CODE

# Тест 2: Проверка OTP
echo ""
echo "📝 Тест 2: Проверка OTP кода"
echo "----------------------------"

VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$PHONE\",
    \"code\": \"$OTP_CODE\",
    \"firstName\": \"Тест\",
    \"lastName\": \"Пользователь\"
  }" \
  -b auth_cookies.txt \
  -c auth_cookies.txt)

echo "Response:"
echo "$VERIFY_RESPONSE" | jq '.'
echo ""

USER_ID=$(echo "$VERIFY_RESPONSE" | jq -r '.data.user.id')
if [ "$USER_ID" != "null" ]; then
    echo "✅ Авторизация успешна"
    echo "   User ID: $USER_ID"
    echo "   Phone: $(echo "$VERIFY_RESPONSE" | jq -r '.data.user.phone')"
else
    echo "❌ Ошибка авторизации"
    exit 1
fi
echo ""

# Тест 3: Проверка /api/v1/auth/me
echo "📝 Тест 3: Проверка текущего пользователя"
echo "-----------------------------------------"

ME_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/me \
  -b auth_cookies.txt)

echo "Response:"
echo "$ME_RESPONSE" | jq '.'
echo ""

USER_TYPE=$(echo "$ME_RESPONSE" | jq -r '.data.type')
if [ "$USER_TYPE" == "user" ]; then
    echo "✅ Пользователь авторизован корректно"
else
    echo "❌ Ошибка определения пользователя"
fi
echo ""

# Тест 4: Refresh токена
echo "📝 Тест 4: Обновление токенов"
echo "-----------------------------"

sleep 2 # Небольшая задержка

REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/refresh \
  -b auth_cookies.txt \
  -c auth_cookies_refreshed.txt)

echo "Response:"
echo "$REFRESH_RESPONSE" | jq '.'
echo ""

NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.tokens.accessToken')
if [ "$NEW_TOKEN" != "null" ]; then
    echo "✅ Токены обновлены успешно"
else
    echo "❌ Ошибка обновления токенов"
fi
echo ""

# Тест 5: Logout
echo "📝 Тест 5: Выход из системы"
echo "---------------------------"

LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/logout \
  -b auth_cookies_refreshed.txt \
  -c auth_cookies_logout.txt)

echo "Response:"
echo "$LOGOUT_RESPONSE" | jq '.'
echo ""

# Проверяем, что пользователь разлогинен
ME_AFTER_LOGOUT=$(curl -s http://localhost:3000/api/v1/auth/me \
  -b auth_cookies_logout.txt)

USER_TYPE_AFTER=$(echo "$ME_AFTER_LOGOUT" | jq -r '.data.type')
if [ "$USER_TYPE_AFTER" == "anonymous" ]; then
    echo "✅ Выход выполнен успешно, пользователь анонимный"
else
    echo "❌ Ошибка выхода"
fi
echo ""

# Очистка
rm -f auth_cookies*.txt

echo "🎉 Тестирование завершено!"
echo ""
echo "Для визуального тестирования:"
echo "1. Откройте http://localhost:3000/test-login"
echo "2. Следуйте инструкциям на странице"
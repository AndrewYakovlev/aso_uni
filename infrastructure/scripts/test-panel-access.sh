#!/bin/bash

echo "🧪 Проверка доступа к панели управления"
echo "======================================="
echo ""

# Проверяем, запущено ли приложение
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Приложение не запущено. Запустите 'npm run dev' в другом терминале."
    exit 1
fi

echo "✅ Приложение запущено"
echo ""

# Тест 1: Проверка редиректа для неавторизованных
echo "📝 Тест 1: Доступ без авторизации"
echo "---------------------------------"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/panel)
echo "HTTP код ответа: $RESPONSE"

if [ "$RESPONSE" == "307" ] || [ "$RESPONSE" == "308" ]; then
    echo "✅ Неавторизованные пользователи перенаправляются на страницу входа"
else
    echo "❌ Ожидался редирект (307/308), получен код $RESPONSE"
fi
echo ""

# Тест 2: Авторизация менеджера
echo "📝 Тест 2: Авторизация менеджера"
echo "--------------------------------"

PHONE="+79998888888"  # Менеджер из seed

# Отправляем OTP
echo "Отправка OTP..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"$PHONE\"}" \
  -c panel_cookies.txt)

SUCCESS=$(echo "$OTP_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo "✅ OTP отправлен"
    echo "⚠️  Проверьте консоль сервера для получения кода"
else
    echo "❌ Ошибка отправки OTP"
    exit 1
fi

# Ждем ввода кода
echo ""
echo "📱 Введите код из консоли сервера (4 цифры):"
read -r OTP_CODE

# Проверяем код
echo ""
echo "Проверка кода..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$PHONE\",
    \"code\": \"$OTP_CODE\"
  }" \
  -b panel_cookies.txt \
  -c panel_cookies.txt)

USER_ROLE=$(echo "$VERIFY_RESPONSE" | jq -r '.data.user.role')
if [ "$USER_ROLE" == "MANAGER" ]; then
    echo "✅ Менеджер авторизован"
else
    echo "❌ Ошибка авторизации"
    exit 1
fi
echo ""

# Тест 3: Доступ к панели для менеджера
echo "📝 Тест 3: Доступ менеджера к панели"
echo "------------------------------------"

PANEL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b panel_cookies.txt \
  http://localhost:3000/panel)

echo "HTTP код ответа: $PANEL_RESPONSE"

if [ "$PANEL_RESPONSE" == "200" ]; then
    echo "✅ Менеджер имеет доступ к панели"
else
    echo "❌ Ошибка доступа к панели (код $PANEL_RESPONSE)"
fi
echo ""

# Тест 4: Проверка API endpoint панели
echo "📝 Тест 4: Проверка защищенного API"
echo "-----------------------------------"

ME_RESPONSE=$(curl -s http://localhost:3000/api/v1/auth/me \
  -b panel_cookies.txt)

USER_TYPE=$(echo "$ME_RESPONSE" | jq -r '.data.type')
USER_ROLE=$(echo "$ME_RESPONSE" | jq -r '.data.user.role')

if [ "$USER_TYPE" == "user" ] && [ "$USER_ROLE" == "MANAGER" ]; then
    echo "✅ API корректно определяет роль менеджера"
    echo "   Роль: $USER_ROLE"
else
    echo "❌ Ошибка определения роли"
fi
echo ""

# Очистка
rm -f panel_cookies.txt

echo "🎉 Тестирование завершено!"
echo ""
echo "Для визуального тестирования:"
echo "1. Откройте http://localhost:3000/panel"
echo "2. Авторизуйтесь как менеджер или администратор:"
echo "   - Админ: +79999999999"
echo "   - Менеджер: +79998888888"
echo "3. Проверьте навигацию и доступ к разделам"
'use client'

import { useState } from 'react'
import {
  Button,
  TextInput,
  PinInput,
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Loader,
  Center,
  Code,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useAuthStore } from '@/entities/user/model/auth-store'

export function AuthTest() {
  const { user, anonymousSession, isAuthenticated, isLoading, sendOTP, verifyOTP, performLogout } =
    useAuthStore()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      notifications.show({
        title: 'Ошибка',
        message: 'Введите корректный номер телефона',
        color: 'red',
      })
      return
    }

    setSending(true)
    const result = await sendOTP(phone)
    setSending(false)

    if (result.success) {
      setStep('code')
      setMaskedPhone(result.maskedPhone || phone)
      notifications.show({
        title: 'Код отправлен',
        message: `SMS отправлено на ${result.maskedPhone}`,
        color: 'green',
      })
    } else {
      notifications.show({
        title: 'Ошибка',
        message: result.error,
        color: 'red',
      })
    }
  }

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      notifications.show({
        title: 'Ошибка',
        message: 'Введите 6-значный код',
        color: 'red',
      })
      return
    }

    setVerifying(true)
    const result = await verifyOTP(phone, code)
    setVerifying(false)

    if (result.success) {
      notifications.show({
        title: 'Успешно',
        message: 'Вы успешно авторизованы',
        color: 'green',
      })
      // Сбрасываем форму
      setPhone('')
      setCode('')
      setStep('phone')
    } else {
      notifications.show({
        title: 'Ошибка',
        message: result.error,
        color: 'red',
      })
    }
  }

  const handleLogout = async () => {
    await performLogout()
    notifications.show({
      title: 'Выход',
      message: 'Вы вышли из системы',
      color: 'blue',
    })
  }

  const handleRefresh = async () => {
    await useAuthStore.getState().checkAuth()
    notifications.show({
      title: 'Обновлено',
      message: 'Статус авторизации обновлен',
      color: 'blue',
    })
  }

  const handleTestSessions = async () => {
    try {
      const response = await fetch('/api/v1/auth/test-sessions')
      const data = await response.json()
      console.log('📊 Session Test Results:', data)
      notifications.show({
        title: 'Тест сессий',
        message: 'Результаты в консоли браузера',
        color: 'blue',
      })
    } catch (error) {
      console.error('Test sessions error:', error)
    }
  }

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="lg" radius="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="lg" fw={500}>
              Статус авторизации
            </Text>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={handleRefresh}>
                Обновить
              </Button>
              <Button size="xs" variant="light" color="grape" onClick={handleTestSessions}>
                Тест сессий
              </Button>
            </Group>
          </Group>

          {isAuthenticated && user ? (
            <>
              <Group>
                <Badge color="green" size="lg">
                  Авторизован
                </Badge>
                <Badge color="blue" variant="light">
                  {user.role}
                </Badge>
              </Group>
              <Text size="sm">
                ID: <Code>{user.id}</Code>
              </Text>
              <Text size="sm">Телефон: {user.phone}</Text>
              {user.firstName && (
                <Text size="sm">
                  Имя: {user.firstName} {user.lastName}
                </Text>
              )}
              <Text size="sm">Заказов: {user.ordersCount || 0}</Text>
              <Text size="sm">Избранное: {user.favoritesCount || 0}</Text>
              <Text size="sm" fw={500} c="blue">
                Анонимных сессий: {user.anonymousSessionsCount || 0}
              </Text>
              <Button onClick={handleLogout} variant="light" color="red" mt="md">
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Badge color="gray" size="lg">
                Гость
              </Badge>
              {anonymousSession ? (
                <>
                  <Text size="sm" c="dimmed">
                    Анонимная сессия
                  </Text>
                  <Text size="xs">
                    ID: <Code>{anonymousSession.id}</Code>
                  </Text>
                  <Text size="xs">
                    Session: <Code>{anonymousSession.sessionId}</Code>
                  </Text>
                  <Text size="xs" c="dimmed">
                    Корзин: {anonymousSession.cartsCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Избранное: {anonymousSession.favoritesCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Просмотров: {anonymousSession.viewsCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Создана: {new Date(anonymousSession.createdAt).toLocaleString('ru')}
                  </Text>
                </>
              ) : (
                <Text size="sm" c="red">
                  Нет анонимной сессии (проверьте cookies)
                </Text>
              )}
            </>
          )}
        </Stack>
      </Card>

      {!isAuthenticated && (
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Тест авторизации
            </Text>

            {step === 'phone' ? (
              <>
                <TextInput
                  label="Номер телефона"
                  placeholder="+7 900 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={sending}
                />
                <Button
                  onClick={handleSendCode}
                  fullWidth
                  loading={sending}
                  disabled={!phone || phone.length < 10}
                >
                  Получить код
                </Button>
                <Text size="xs" c="dimmed" ta="center">
                  Тестовый режим: код будет показан в консоли сервера
                </Text>
              </>
            ) : (
              <>
                <Text size="sm" ta="center">
                  Код отправлен на {maskedPhone}
                </Text>
                <PinInput
                  length={6}
                  type="number"
                  value={code}
                  onChange={setCode}
                  disabled={verifying}
                  oneTimeCode
                />
                <Group grow>
                  <Button
                    variant="light"
                    onClick={() => {
                      setStep('phone')
                      setCode('')
                    }}
                    disabled={verifying}
                  >
                    Изменить номер
                  </Button>
                  <Button
                    onClick={handleVerifyCode}
                    loading={verifying}
                    disabled={!code || code.length !== 6}
                  >
                    Подтвердить
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>
      )}

      <Card shadow="sm" padding="md" radius="md">
        <Text size="sm" fw={500} mb="xs">
          Отладочная информация:
        </Text>
        <Text size="xs" c="dimmed">
          Проверьте cookies в DevTools → Application → Cookies:
        </Text>
        <Stack gap="xs" mt="xs">
          <Text size="xs">• aso-anonymous-token - токен анонимной сессии</Text>
          <Text size="xs">• aso-access-token - токен авторизации</Text>
          <Text size="xs">• aso-refresh-token - токен обновления</Text>
        </Stack>
      </Card>
    </Stack>
  )
}

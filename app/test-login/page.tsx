'use client'

import { useState } from 'react'
import { useAuthStore, useOTPState } from '@/features/auth/model/auth-store'
import { useCurrentUser as useCurrentUserHook } from '@/shared/lib/hooks/use-current-user'

export default function TestLoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [showUserData, setShowUserData] = useState(false)

  const { sendOTP, verifyOTP, logout, isLoading, error, clearError } = useAuthStore()
  const otpState = useOTPState()
  const { data: currentUser, refetch } = useCurrentUserHook()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await sendOTP(phone)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyOTP(code, {
      firstName: 'Тестовый',
      lastName: 'Пользователь',
    })
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleRefreshUser = async () => {
    await refetch()
    setShowUserData(false)
    setTimeout(() => setShowUserData(true), 100)
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Тест системы авторизации</h1>

      {/* Текущий пользователь */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Текущий пользователь:</h2>
          <button onClick={handleRefreshUser} className="text-sm text-blue-600 hover:underline">
            Обновить
          </button>
        </div>

        {currentUser?.type === 'user' ? (
          <div>
            <p>
              <strong>Тип:</strong> Авторизован
            </p>
            <p>
              <strong>ID:</strong> {currentUser.user?.id}
            </p>
            <p>
              <strong>Телефон:</strong> {currentUser.user?.phone}
            </p>
            <p>
              <strong>Имя:</strong> {currentUser.user?.firstName || 'Не указано'}
            </p>
            <p>
              <strong>Роль:</strong> {currentUser.user?.role}
            </p>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? 'Выход...' : 'Выйти'}
            </button>
          </div>
        ) : (
          <div>
            <p>
              <strong>Тип:</strong> Анонимный
            </p>
            <p>
              <strong>Session ID:</strong> {currentUser?.anonymousUser?.sessionId}
            </p>
          </div>
        )}
      </div>

      {/* Форма авторизации */}
      {currentUser?.type !== 'user' && (
        <>
          {/* Отправка OTP */}
          {!otpState.sent && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Шаг 1: Введите телефон</h2>

              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 (999) 999-99-99"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Можно вводить в любом формате: +79999999999, 89999999999, 9999999999
                  </p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                {otpState.error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{otpState.error}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Отправка...' : 'Получить код'}
                </button>
              </form>
            </div>
          )}

          {/* Ввод OTP */}
          {otpState.sent && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Шаг 2: Введите код из SMS</h2>

              <p className="text-sm text-gray-600 mb-4">
                Код отправлен на номер: <strong>{otpState.phone}</strong>
              </p>

              {otpState.expiresIn && (
                <p className="text-sm text-gray-600 mb-4">
                  Код действителен: {Math.floor(otpState.expiresIn / 60)} мин{' '}
                  {otpState.expiresIn % 60} сек
                </p>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Код подтверждения</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    maxLength={4}
                    className="w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {otpState.error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{otpState.error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 4}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Проверка...' : 'Войти'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      useAuthStore.getState().clearOTPState()
                      setCode('')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Изменить номер
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Тестовые номера */}
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Тестовые данные:</h3>
        <p className="text-sm">
          В тестовом режиме SMS не отправляются. Код появится в консоли сервера.
        </p>
        <p className="text-sm mt-2">
          <strong>Существующие пользователи:</strong>
        </p>
        <ul className="text-sm list-disc list-inside">
          <li>+79999999999 - Администратор</li>
          <li>+79998888888 - Менеджер</li>
          <li>+79997777777 - Клиент</li>
        </ul>
      </div>

      {/* Debug информация */}
      {showUserData && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug: Полные данные пользователя</h3>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(currentUser, null, 2)}</pre>
        </div>
      )}

      <div className="mt-4">
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}

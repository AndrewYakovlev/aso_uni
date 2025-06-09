'use client'

import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'

export default function TestAuthPage() {
  const { data, isLoading, error } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Тест системы авторизации</h1>
        <p>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Тест системы авторизации</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Ошибка:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Тест системы авторизации</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Текущий пользователь:</h2>
        <pre className="bg-white p-4 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Тип пользователя:</h3>
          <p className="text-lg">{data?.type === 'user' ? 'Авторизован' : 'Анонимный'}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">ID пользователя:</h3>
          <p className="text-lg font-mono">
            {data?.type === 'user' ? data.user?.id : data?.anonymousUser?.id}
          </p>
        </div>

        {data?.type === 'anonymous' && (
          <>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Session ID:</h3>
              <p className="text-lg font-mono break-all">{data.anonymousUser?.sessionId}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Формат токена:</h3>
              <p className="text-sm">
                Токен имеет формат: <code>anon_&lt;timestamp&gt;_&lt;random&gt;</code>
              </p>
              <p className="text-sm mt-1">
                Срок жизни: 365 дней (обновляется при каждом посещении)
              </p>
            </div>
          </>
        )}

        {data?.type === 'user' && (
          <>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Телефон:</h3>
              <p className="text-lg">{data.user?.phone}</p>
            </div>
            <div className="bg-pink-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Роль:</h3>
              <p className="text-lg">{data.user?.role}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Проверка cookies:</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Откройте DevTools → Application → Cookies и проверьте наличие:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <code>aso-anonymous-token</code> - уникальный идентификатор анонимного пользователя
              (365 дней)
            </li>
            <li>
              <code>aso-session-id</code> - дубликат токена для совместимости (365 дней)
            </li>
            <li>
              <code>aso-access-token</code> - JWT токен авторизованного пользователя (если
              авторизован, 15 минут)
            </li>
            <li>
              <code>aso-refresh-token</code> - refresh токен (если авторизован, 7 дней)
            </li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">
            <strong>Важно:</strong> При каждом посещении страницы срок жизни анонимного токена
            продлевается на 365 дней.
          </p>
        </div>
      </div>

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

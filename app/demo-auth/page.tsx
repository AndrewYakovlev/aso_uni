'use client'

import { useState } from 'react'
import { AuthButton, LoginModal } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { useCurrentUser } from '@/shared/lib/hooks/use-current-user'
import { formatPhone } from '@/shared/lib/utils'
import { toast } from 'sonner'

export default function DemoAuthPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: currentUser, isLoading } = useCurrentUser()

  const showToast = () => {
    toast.success('Тестовое уведомление', {
      description: 'Это пример работы sonner для уведомлений',
    })
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Демо компонентов авторизации</h1>

      {/* Информация о текущем пользователе */}
      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Текущий пользователь:</h2>
        {isLoading ? (
          <p>Загрузка...</p>
        ) : currentUser?.type === 'user' ? (
          <div className="space-y-2">
            <p>
              <strong>Статус:</strong> Авторизован
            </p>
            <p>
              <strong>ID:</strong> {currentUser.user?.id}
            </p>
            <p>
              <strong>Телефон:</strong> {formatPhone(currentUser.user?.phone || '')}
            </p>
            <p>
              <strong>Имя:</strong> {currentUser.user?.firstName || 'Не указано'}
            </p>
            <p>
              <strong>Фамилия:</strong> {currentUser.user?.lastName || 'Не указано'}
            </p>
            <p>
              <strong>Email:</strong> {currentUser.user?.email || 'Не указан'}
            </p>
            <p>
              <strong>Роль:</strong> {currentUser.user?.role}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Статус:</strong> Анонимный
            </p>
            <p>
              <strong>Session ID:</strong> {currentUser?.anonymousUser?.sessionId}
            </p>
          </div>
        )}
      </div>

      {/* Демо компонентов */}
      <div className="space-y-8">
        {/* AuthButton компонент */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. AuthButton компонент</h2>
          <p className="text-muted-foreground mb-4">
            Кнопка, которая показывает "Войти" для неавторизованных и выпадающее меню для
            авторизованных пользователей.
          </p>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-background">
            <span className="text-sm text-muted-foreground">Пример в шапке сайта:</span>
            <AuthButton />
          </div>
        </section>

        {/* Модальное окно */}
        <section>
          <h2 className="text-xl font-semibold mb-4">2. Модальное окно авторизации</h2>
          <p className="text-muted-foreground mb-4">
            Двухшаговая форма авторизации: ввод телефона → ввод кода из SMS.
          </p>
          <div className="space-y-4">
            <Button onClick={() => setModalOpen(true)}>Открыть модальное окно</Button>
            <LoginModal open={modalOpen} onOpenChange={setModalOpen} />
          </div>
        </section>

        {/* Уведомления Sonner */}
        <section>
          <h2 className="text-xl font-semibold mb-4">3. Уведомления (Sonner)</h2>
          <p className="text-muted-foreground mb-4">
            Система уведомлений для отображения успешных действий и ошибок.
          </p>
          <div className="flex gap-2">
            <Button onClick={showToast} variant="outline">
              Показать уведомление
            </Button>
            <Button
              onClick={() =>
                toast.error('Пример ошибки', {
                  description: 'Что-то пошло не так',
                })
              }
              variant="outline"
            >
              Показать ошибку
            </Button>
            <Button
              onClick={() =>
                toast.info('Информация', {
                  description: 'Полезная информация для пользователя',
                })
              }
              variant="outline"
            >
              Показать информацию
            </Button>
          </div>
        </section>

        {/* Особенности реализации */}
        <section>
          <h2 className="text-xl font-semibold mb-4">4. Особенности реализации</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Маска телефона:</strong> Автоматическое форматирование в виде +7 (XXX)
                XXX-XX-XX
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Input OTP:</strong> Специальный компонент для ввода 4-значного кода
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Таймер:</strong> Обратный отсчет времени действия кода (5 минут)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Повторная отправка:</strong> Возможность запросить код повторно после
                истечения времени
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Слияние данных:</strong> При авторизации автоматически переносятся данные
                анонимного пользователя
              </div>
            </div>
          </div>
        </section>

        {/* Инструкции для тестирования */}
        <section className="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Инструкции для тестирования</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Нажмите "Открыть модальное окно" или кнопку "Войти"</li>
            <li>Введите любой номер телефона (можно использовать тестовые номера)</li>
            <li>В консоли сервера появится 4-значный код</li>
            <li>Введите код в форму</li>
            <li>После успешной авторизации страница обновится</li>
          </ol>
          <div className="mt-4">
            <p className="font-semibold">Тестовые номера:</p>
            <ul className="list-disc list-inside mt-2">
              <li>+79999999999 - Администратор</li>
              <li>+79998888888 - Менеджер</li>
              <li>+79997777777 - Клиент</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-8 border-t">
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          ← Вернуться на главную
        </a>
      </div>
    </div>
  )
}

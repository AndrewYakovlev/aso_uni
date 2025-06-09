import { clearAuthCookies } from '@/shared/lib/auth/cookies'
import { successResponse, withErrorHandler } from '@/shared/lib/api-errors'
import { getCurrentUser } from '@/shared/lib/auth/get-current-user'

export const POST = withErrorHandler(async () => {
  // Получаем текущего пользователя для логирования
  const currentUser = await getCurrentUser()

  // Очищаем все auth cookies
  await clearAuthCookies()

  if (currentUser?.type === 'user') {
    console.log(`👋 Пользователь ${currentUser.user?.phone} вышел из системы`)
  }

  return successResponse({
    success: true,
    message: 'Вы успешно вышли из системы',
  })
})

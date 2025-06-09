import { z } from 'zod'
import { VALIDATION } from '@/shared/constants'

// Схема для отправки OTP
export const sendOTPSchema = z.object({
  phone: z
    .string()
    .min(1, 'Телефон обязателен')
    .transform(val => {
      // Убираем все нецифровые символы
      let cleaned = val.replace(/\D/g, '')

      // Если начинается с 8, заменяем на 7
      if (cleaned.startsWith('8') && cleaned.length === 11) {
        cleaned = '7' + cleaned.slice(1)
      }

      // Если не начинается с 7, добавляем
      if (!cleaned.startsWith('7') && cleaned.length === 10) {
        cleaned = '7' + cleaned
      }

      // Возвращаем в формате +7XXXXXXXXXX
      return cleaned.length === 11 && cleaned.startsWith('7') ? `+${cleaned}` : val
    })
    .refine(
      val => VALIDATION.PHONE_REGEX.test(val),
      'Неверный формат телефона. Используйте формат +7XXXXXXXXXX'
    ),
})

export type SendOTPInput = z.infer<typeof sendOTPSchema>

// Схема для проверки OTP
export const verifyOTPSchema = z.object({
  phone: z
    .string()
    .min(1, 'Телефон обязателен')
    .transform(val => {
      // Применяем ту же трансформацию что и в sendOTPSchema
      let cleaned = val.replace(/\D/g, '')

      if (cleaned.startsWith('8') && cleaned.length === 11) {
        cleaned = '7' + cleaned.slice(1)
      }

      if (!cleaned.startsWith('7') && cleaned.length === 10) {
        cleaned = '7' + cleaned
      }

      return cleaned.length === 11 && cleaned.startsWith('7') ? `+${cleaned}` : val
    })
    .refine(val => VALIDATION.PHONE_REGEX.test(val), 'Неверный формат телефона'),
  code: z
    .string()
    .length(4, 'Код должен состоять из 4 цифр')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
})

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>

// Схема для обновления профиля
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// Схема для refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

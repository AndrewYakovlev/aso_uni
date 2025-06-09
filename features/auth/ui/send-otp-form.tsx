'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { PhoneInput } from '@/shared/ui/phone-input'
import { useAuthStore } from '../model/auth-store'
import { VALIDATION } from '@/shared/constants'

const formSchema = z.object({
  phone: z
    .string()
    .min(1, 'Введите номер телефона')
    .refine(val => {
      // Проверяем что номер в формате +7XXXXXXXXXX
      return VALIDATION.PHONE_REGEX.test(val)
    }, 'Введите корректный номер телефона'),
})

type FormData = z.infer<typeof formSchema>

interface SendOTPFormProps {
  onSuccess?: () => void
}

export function SendOTPForm({ onSuccess }: SendOTPFormProps) {
  const { sendOTP, isLoading } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      await sendOTP(data.phone)
      toast.success('Код отправлен', {
        description: `SMS отправлено на номер ${data.phone}`,
      })
      onSuccess?.()
    } catch (error) {
      // Ошибка уже обработана в store
      const errorMessage = useAuthStore.getState().otpError
      toast.error('Ошибка', {
        description: errorMessage || 'Не удалось отправить код',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Вход или регистрация</h2>
          <p className="text-muted-foreground">Введите номер телефона для получения кода</p>
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Номер телефона</FormLabel>
              <FormControl>
                <PhoneInput {...field} autoComplete="tel" disabled={isLoading || isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
          {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Получить код
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с условиями использования
        </p>
      </form>
    </Form>
  )
}

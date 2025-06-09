'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/shared/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/shared/ui/input-otp'
import { useAuthStore, useOTPState } from '../model/auth-store'
import { formatPhone } from '@/shared/lib/utils'

const formSchema = z.object({
  code: z
    .string()
    .length(4, 'Код должен состоять из 4 цифр')
    .regex(/^\d+$/, 'Код должен содержать только цифры'),
})

type FormData = z.infer<typeof formSchema>

interface VerifyOTPFormProps {
  onBack?: () => void
  onSuccess?: () => void
}

export function VerifyOTPForm({ onBack, onSuccess }: VerifyOTPFormProps) {
  const { verifyOTP, sendOTP, isLoading, clearOTPState } = useAuthStore()
  const otpState = useOTPState()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(otpState.expiresIn || 300)
  const [canResend, setCanResend] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  // Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const onSubmit = async (data: FormData) => {
    if (!otpState.phone) {
      toast.error('Ошибка', {
        description: 'Сначала запросите код подтверждения',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await verifyOTP(data.code)
      toast.success('Успешно!', {
        description: 'Вы успешно авторизованы',
      })
      onSuccess?.()
    } catch (error) {
      // Ошибка уже обработана в store
      const errorMessage = useAuthStore.getState().otpError
      toast.error('Ошибка', {
        description: errorMessage || 'Неверный код',
      })
      // Очищаем поле при ошибке
      form.setValue('code', '')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!otpState.phone || !canResend) return

    try {
      await sendOTP(otpState.phone)
      toast.success('Код отправлен повторно')
      setTimeLeft(300) // 5 минут
      setCanResend(false)
    } catch (error) {
      toast.error('Ошибка', {
        description: 'Не удалось отправить код повторно',
      })
    }
  }

  const handleBack = () => {
    clearOTPState()
    form.reset()
    onBack?.()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Изменить номер
          </Button>

          <h2 className="text-2xl font-bold">Введите код</h2>
          <p className="text-muted-foreground">
            Код отправлен на номер{' '}
            <span className="font-medium text-foreground">{formatPhone(otpState.phone || '')}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Код подтверждения</FormLabel>
              <FormControl>
                <InputOTP
                  {...field}
                  maxLength={4}
                  disabled={isLoading || isSubmitting}
                  onComplete={form.handleSubmit(onSubmit)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                {timeLeft > 0 ? (
                  <>Код действителен еще {formatTime(timeLeft)}</>
                ) : (
                  <>Срок действия кода истек</>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting || timeLeft === 0}
          >
            {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подтвердить
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={!canResend || isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Отправить код повторно
          </Button>
        </div>

        {otpState.error && <p className="text-sm text-destructive text-center">{otpState.error}</p>}
      </form>
    </Form>
  )
}

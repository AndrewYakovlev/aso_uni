'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { SendOTPForm } from './send-otp-form'
import { VerifyOTPForm } from './verify-otp-form'
import { useAuthStore, useOTPState } from '../model/auth-store'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const otpState = useOTPState()
  const { clearOTPState, clearError } = useAuthStore()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  // Определяем текущий шаг на основе состояния OTP
  useEffect(() => {
    if (otpState.sent && otpState.phone) {
      setStep('otp')
    } else {
      setStep('phone')
    }
  }, [otpState.sent, otpState.phone])

  // Очищаем состояние при закрытии модалки
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearOTPState()
      clearError()
      setStep('phone')
    }
    onOpenChange(newOpen)
  }

  const handlePhoneSuccess = () => {
    setStep('otp')
  }

  const handleOTPSuccess = () => {
    handleOpenChange(false)
  }

  const handleBack = () => {
    setStep('phone')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="sr-only">
          <DialogTitle>{step === 'phone' ? 'Вход или регистрация' : 'Подтверждение'}</DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? 'Введите номер телефона для входа в личный кабинет'
              : 'Введите код из SMS для подтверждения'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <SendOTPForm onSuccess={handlePhoneSuccess} />
        ) : (
          <VerifyOTPForm onBack={handleBack} onSuccess={handleOTPSuccess} />
        )}
      </DialogContent>
    </Dialog>
  )
}

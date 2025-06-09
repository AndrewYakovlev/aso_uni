'use client'

import * as React from 'react'
import InputMask from 'react-input-mask'
import { cn } from '@/shared/lib/utils'

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Конвертируем значение в формат для отображения
    const displayValue = React.useMemo(() => {
      if (!value) return ''

      // Убираем все нецифровые символы
      const cleaned = value.replace(/\D/g, '')

      // Если есть +7 в начале значения, убираем для маски
      if (value.startsWith('+7') && cleaned.length === 11) {
        return cleaned.substring(1)
      }

      // Если начинается с 8, заменяем на 7 и убираем первую цифру
      if (cleaned.startsWith('8') && cleaned.length === 11) {
        return cleaned.substring(1)
      }

      // Если начинается с 7 и длина 11, убираем 7
      if (cleaned.startsWith('7') && cleaned.length === 11) {
        return cleaned.substring(1)
      }

      // Если длина 10, возвращаем как есть
      if (cleaned.length === 10) {
        return cleaned
      }

      return value
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      // Извлекаем только цифры из маски
      const digits = inputValue.replace(/\D/g, '')

      // Формируем номер в формате +7XXXXXXXXXX
      if (digits.length === 10) {
        onChange?.(`+7${digits}`)
      } else {
        onChange?.(digits)
      }
    }

    return (
      <InputMask
        mask="+7 (999) 999-99-99"
        value={displayValue}
        onChange={handleChange}
        placeholder="+7 (___) ___-__-__"
        alwaysShowMask={false}
        maskChar="_"
      >
        {(inputProps: any) => (
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              className
            )}
            {...inputProps}
            {...props}
          />
        )}
      </InputMask>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }

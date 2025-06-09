import { AUTH } from '@/shared/constants'

interface SMSResponse {
  status: 'OK' | 'ERROR'
  status_code: number
  sms: {
    [phone: string]: {
      status: 'OK' | 'ERROR'
      status_code: number
      cost?: number
      sms_id?: string
      status_text?: string
    }
  }
  balance?: number
}

export class SMSClient {
  private apiId: string
  private testMode: boolean
  private baseUrl = 'https://sms.ru/sms/send'

  constructor() {
    this.apiId = process.env.SMS_RU_API_ID || ''
    this.testMode = process.env.SMS_RU_TEST_MODE === '1'

    if (!this.apiId) {
      console.warn('⚠️  SMS_RU_API_ID не установлен. SMS не будут отправляться.')
    }
  }

  /**
   * Отправка SMS с кодом подтверждения
   */
  async sendOTP(phone: string, code: string): Promise<boolean> {
    // В тестовом режиме просто логируем
    if (this.testMode || !this.apiId) {
      console.log('📱 [TEST MODE] SMS отправлено:')
      console.log(`   Телефон: ${phone}`)
      console.log(`   Код: ${code}`)
      console.log(`   Сообщение: Ваш код подтверждения: ${code}`)
      return true
    }

    try {
      const params = new URLSearchParams({
        api_id: this.apiId,
        to: phone.replace(/[^\d]/g, ''), // Убираем все нецифровые символы
        msg: `Ваш код подтверждения: ${code}`,
        json: '1',
      })

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SMSResponse = await response.json()

      if (data.status === 'OK') {
        const phoneResult = data.sms[phone]
        if (phoneResult && phoneResult.status === 'OK') {
          console.log(`✅ SMS отправлено на ${phone}, ID: ${phoneResult.sms_id}`)
          return true
        } else {
          console.error(`❌ Ошибка отправки SMS: ${phoneResult?.status_text}`)
          return false
        }
      } else {
        console.error(`❌ Ошибка API SMS.ru: ${data.status_code}`)
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке SMS:', error)
      return false
    }
  }

  /**
   * Генерация OTP кода
   */
  static generateOTP(length: number = AUTH.OTP_LENGTH): string {
    const digits = '0123456789'
    let code = ''

    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length))
    }

    return code
  }

  /**
   * Проверка баланса (для отладки)
   */
  async checkBalance(): Promise<number | null> {
    if (!this.apiId) {
      console.warn('⚠️  SMS_RU_API_ID не установлен')
      return null
    }

    try {
      const params = new URLSearchParams({
        api_id: this.apiId,
        json: '1',
      })

      const response = await fetch('https://sms.ru/my/balance', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const data = await response.json()

      if (data.status === 'OK') {
        console.log(`💰 Баланс SMS.ru: ${data.balance} руб.`)
        return data.balance
      } else {
        console.error(`❌ Ошибка получения баланса: ${data.status_code}`)
        return null
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке баланса:', error)
      return null
    }
  }
}

// Экспортируем singleton
export const smsClient = new SMSClient()

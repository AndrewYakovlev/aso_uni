import { config } from '@/env'

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

// Типы для ответа SMS.ru API
interface SMSRuResponse {
  status: string
  status_text?: string
  sms?: {
    [phone: string]: {
      status: string
      status_text?: string
      sms_id?: string
    }
  }
}

interface SMSRuBalanceResponse {
  status: string
  status_text?: string
  balance?: string
}

/**
 * Отправка SMS через SMS.ru API
 * В тестовом режиме просто логирует код в консоль
 */
export async function sendSMS(phone: string, message: string): Promise<SMSResult> {
  // В тестовом режиме не отправляем реальные SMS
  if (config.sms.testMode || config.app.env === 'development') {
    console.log('📱 SMS Test Mode:')
    console.log(`To: ${phone}`)
    console.log(`Message: ${message}`)
    console.log('---')

    return {
      success: true,
      messageId: 'test-' + Date.now(),
    }
  }

  try {
    // Формируем запрос к SMS.ru API
    const params = new URLSearchParams({
      api_id: config.sms.apiKey,
      to: phone.replace('+', ''), // SMS.ru не требует +
      msg: message,
      json: '1',
    })

    const response = await fetch(`https://sms.ru/sms/send?${params}`, {
      method: 'GET',
    })

    const data = (await response.json()) as SMSRuResponse

    if (data.status === 'OK' && data.sms) {
      const phoneKey = Object.keys(data.sms)[0]
      const smsData = data.sms[phoneKey]

      return {
        success: true,
        messageId: smsData.sms_id || 'unknown',
      }
    } else {
      return {
        success: false,
        error: data.status_text || 'Ошибка отправки SMS',
      }
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    return {
      success: false,
      error: 'Ошибка при отправке SMS',
    }
  }
}

/**
 * Отправка OTP кода
 */
export async function sendOTPCode(phone: string, code: string): Promise<SMSResult> {
  const message = `Ваш код подтверждения для АСО: ${code}\nКод действителен 5 минут.`
  return sendSMS(phone, message)
}

/**
 * Проверка баланса SMS.ru (для админки)
 */
export async function checkSMSBalance(): Promise<{
  success: boolean
  balance?: number
  error?: string
}> {
  if (config.sms.testMode || config.app.env === 'development') {
    return {
      success: true,
      balance: 999999,
    }
  }

  try {
    const response = await fetch(`https://sms.ru/my/balance?api_id=${config.sms.apiKey}&json=1`)
    const data = (await response.json()) as SMSRuBalanceResponse

    if (data.status === 'OK' && data.balance) {
      return {
        success: true,
        balance: parseFloat(data.balance),
      }
    } else {
      return {
        success: false,
        error: data.status_text || 'Ошибка при проверке баланса',
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка при проверке баланса',
    }
  }
}

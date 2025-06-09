import { smsClient } from '@/shared/lib/sms/sms-client'

async function checkBalance() {
  console.log('💰 Проверка баланса SMS.ru')
  console.log('========================\n')

  const testMode = process.env.SMS_RU_TEST_MODE === '1'
  const apiId = process.env.SMS_RU_API_ID

  if (!apiId || apiId === 'your-sms-ru-api-id') {
    console.log('⚠️  SMS_RU_API_ID не настроен!')
    console.log('   Установите реальный API ID в .env.local')
    return
  }

  if (testMode) {
    console.log('ℹ️  Работаем в тестовом режиме')
    console.log('   SMS не будут отправляться, баланс не расходуется')
  }

  try {
    const balance = await smsClient.checkBalance()

    if (balance !== null) {
      console.log(`\n✅ Текущий баланс: ${balance} руб.`)

      // Примерная стоимость SMS
      const smsPrice = 2.5 // руб за SMS
      const smsCount = Math.floor(balance / smsPrice)

      console.log(`📱 Примерно хватит на: ${smsCount} SMS`)

      if (balance < 50) {
        console.log('\n⚠️  Баланс низкий! Рекомендуется пополнить.')
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке баланса:', error)
  }
}

// Запускаем проверку
checkBalance()
  .then(() => {
    console.log('\n✅ Проверка завершена')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Критическая ошибка:', error)
    process.exit(1)
  })

import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createAnonymousUser } from '@/shared/lib/create-anonymous'
import { ANONYMOUS_TOKEN_COOKIE } from '@/shared/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const cookieStore = await cookies()

    // Проверяем текущий токен
    const currentToken = cookieStore.get(ANONYMOUS_TOKEN_COOKIE)?.value
    console.log(
      '📍 Anonymous POST endpoint called. Current token:',
      currentToken ? currentToken.substring(0, 8) + '...' : 'none'
    )

    const ipAddress =
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    console.log('🔨 Creating anonymous user...')

    const anonymousUser = await createAnonymousUser(ipAddress.split(',')[0].trim(), userAgent)

    if (!anonymousUser) {
      console.error('❌ Failed to create anonymous user')
      return NextResponse.json({ error: 'Не удалось создать анонимную сессию' }, { status: 500 })
    }

    console.log('✅ Anonymous user created successfully:', {
      id: anonymousUser.id,
      sessionId: anonymousUser.sessionId,
    })

    return NextResponse.json({
      success: true,
      session: {
        id: anonymousUser.id,
        sessionId: anonymousUser.sessionId,
        token: anonymousUser.token,
      },
    })
  } catch (error) {
    console.error('❌ Error creating anonymous session:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError, ApiResponse, ERROR_CODES } from '@/shared/types'

// Обработчик ошибок для API
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  // Обработка нашей кастомной ошибки
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    )
  }

  // Обработка ошибок валидации Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Ошибка валидации данных',
          details: error.flatten(),
        },
      },
      { status: 400 }
    )
  }

  // Обработка ошибок Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.ALREADY_EXISTS,
              message: 'Запись с такими данными уже существует',
              details: { field: error.meta?.target },
            },
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: 'Запись не найдена',
            },
          },
          { status: 404 }
        )
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.DATABASE_ERROR,
              message: 'Ошибка базы данных',
              details:
                process.env.NODE_ENV === 'development' ? { prismaCode: error.code } : undefined,
            },
          },
          { status: 500 }
        )
    }
  }

  // Обработка обычных ошибок
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message:
            process.env.NODE_ENV === 'development' ? error.message : 'Внутренняя ошибка сервера',
        },
      },
      { status: 500 }
    )
  }

  // Неизвестная ошибка
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Неизвестная ошибка',
      },
    },
    { status: 500 }
  )
}

// Утилита для создания успешного ответа
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  })
}

// Утилита для создания ответа с ошибкой
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusCode }
  )
}

// Middleware для обработки ошибок в API handlers
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}

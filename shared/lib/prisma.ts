import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Утилиты для работы с Prisma

/**
 * Обработчик ошибок Prisma
 */
export function handlePrismaError(error: any): {
  message: string
  code?: string
} {
  if (error.code === 'P2002') {
    return {
      message: 'Запись с такими данными уже существует',
      code: 'DUPLICATE_ENTRY',
    }
  }

  if (error.code === 'P2003') {
    return {
      message: 'Нарушение внешнего ключа',
      code: 'FOREIGN_KEY_VIOLATION',
    }
  }

  if (error.code === 'P2025') {
    return {
      message: 'Запись не найдена',
      code: 'NOT_FOUND',
    }
  }

  return {
    message: error.message || 'Произошла ошибка базы данных',
    code: 'DATABASE_ERROR',
  }
}

/**
 * Утилита для пагинации
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 20))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  const { page, limit } = getPaginationParams(params)

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

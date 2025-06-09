// shared/types/index.ts

// Re-export Prisma types
export type {
  User,
  UserRole,
  Product,
  Category,
  Brand,
  Order,
  Cart,
  CartItem,
  AnonymousUser,
} from '@prisma/client'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Auth types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Переименован из JWTPayload в AuthJWTPayload чтобы избежать конфликта с jose
export interface AuthJWTPayload {
  sub: string // user id
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  type: 'user'
  iat?: number
  exp?: number
}

export interface SessionUser {
  id: string
  phone?: string
  email?: string
  firstName?: string
  lastName?: string
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
}

export interface SessionAnonymous {
  id: string
  sessionId: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter types
export interface ProductFilters {
  categoryId?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isOriginal?: boolean
  search?: string
}

// Cart types
export interface CartWithItems {
  id: string
  userId?: string
  anonymousId?: string
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: string
    product: {
      id: string
      name: string
      slug: string
      sku: string
      brand: {
        id: string
        name: string
      }
      images: Array<{
        id: string
        url: string
        alt?: string
      }>
      stock: number
    }
  }>
  createdAt: Date
  updatedAt: Date
}

// Order types
export interface CreateOrderInput {
  deliveryMethodId: string
  paymentMethodId: string
  shippingAddress?: {
    firstName: string
    lastName: string
    phone: string
    email?: string
    city: string
    street: string
    building: string
    apartment?: string
    zipCode?: string
    comment?: string
  }
  comment?: string
  promoCode?: string
}

// Error types
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Constants
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CART_EMPTY: 'CART_EMPTY',
  PROMO_CODE_INVALID: 'PROMO_CODE_INVALID',
  PROMO_CODE_EXPIRED: 'PROMO_CODE_EXPIRED',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

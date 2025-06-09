// shared/constants/index.ts

// API Routes
export const API_ROUTES = {
  AUTH: {
    ANONYMOUS: '/api/v1/auth/anonymous',
    SEND_OTP: '/api/v1/auth/send-otp',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    LOGOUT: '/api/v1/auth/logout',
  },
  PRODUCTS: {
    LIST: '/api/v1/products',
    DETAIL: (id: string) => `/api/v1/products/${id}`,
    SEARCH: '/api/v1/products/search',
  },
  CATEGORIES: {
    LIST: '/api/v1/categories',
    DETAIL: (id: string) => `/api/v1/categories/${id}`,
    TREE: '/api/v1/categories/tree',
  },
  CART: {
    GET: '/api/v1/cart',
    ADD_ITEM: '/api/v1/cart/items',
    UPDATE_ITEM: (id: string) => `/api/v1/cart/items/${id}`,
    REMOVE_ITEM: (id: string) => `/api/v1/cart/items/${id}`,
    MERGE: '/api/v1/cart/merge',
    CALCULATE: '/api/v1/cart/calculate',
  },
  ORDERS: {
    CREATE: '/api/v1/orders',
    LIST: '/api/v1/orders',
    DETAIL: (id: string) => `/api/v1/orders/${id}`,
  },
  FAVORITES: {
    LIST: '/api/v1/favorites',
    ADD: '/api/v1/favorites',
    REMOVE: (productId: string) => `/api/v1/favorites/${productId}`,
    CHECK: '/api/v1/favorites/check',
  },
} as const

// App Routes
export const APP_ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  CATEGORY: (slug: string) => `/catalog/${slug}`,
  PRODUCT: (slug: string) => `/products/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  ORDERS: '/profile/orders',
  ORDER_DETAIL: (id: string) => `/profile/orders/${id}`,
  FAVORITES: '/profile/favorites',
  SEARCH: '/search',
  VEHICLES: '/vehicles',
  VEHICLE_MODEL: (make: string, model: string) => `/vehicles/${make}/${model}`,

  // Admin panel
  PANEL: '/panel',
  PANEL_USERS: '/panel/users',
  PANEL_PRODUCTS: '/panel/products',
  PANEL_CATEGORIES: '/panel/categories',
  PANEL_ORDERS: '/panel/orders',
  PANEL_CHATS: '/panel/chats',
} as const

// Auth constants
export const AUTH = {
  TOKEN_PREFIX: 'Bearer',
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ANONYMOUS_TOKEN_EXPIRES_IN: 365 * 24 * 60 * 60, // 365 дней в секундах
  OTP_EXPIRES_IN: 5 * 60 * 1000, // 5 minutes in ms
  OTP_LENGTH: 4,
  MAX_OTP_ATTEMPTS: 3,
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// File upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  IMAGE_QUALITY: 80,
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  PRODUCT_IMAGE_SIZE: { width: 800, height: 800 },
} as const

// Cache keys
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  CATEGORY_TREE: 'category_tree',
  BRANDS: 'brands',
  PRODUCT: (id: string) => `product:${id}`,
  CART: (id: string) => `cart:${id}`,
  USER: (id: string) => `user:${id}`,
} as const

// Cache TTL (in seconds)
export const CACHE_TTL = {
  CATEGORIES: 60 * 60, // 1 hour
  BRANDS: 60 * 60, // 1 hour
  PRODUCT: 5 * 60, // 5 minutes
  CART: 60, // 1 minute
  USER: 5 * 60, // 5 minutes
} as const

// Validation
export const VALIDATION = {
  PHONE_REGEX: /^\+7\d{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  SKU_REGEX: /^[A-Z0-9\-_]+$/i,
  SLUG_REGEX: /^[a-z0-9\-]+$/,
} as const

// Business rules
export const BUSINESS_RULES = {
  MIN_ORDER_AMOUNT: 1000,
  FREE_SHIPPING_THRESHOLD: 5000,
  MAX_CART_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 999,
} as const

// SEO
export const SEO = {
  DEFAULT_TITLE: 'Автозапчасти АСО - интернет-магазин автозапчастей',
  DEFAULT_DESCRIPTION:
    'Большой выбор автозапчастей для всех марок автомобилей. Оригинальные запчасти и качественные аналоги. Быстрая доставка по России.',
  DEFAULT_KEYWORDS:
    'автозапчасти, запчасти для авто, купить автозапчасти, интернет-магазин автозапчастей',
  TITLE_TEMPLATE: '%s | Автозапчасти АСО',
} as const

// UI
export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  PAGE_TRANSITION_DURATION: 300,
} as const

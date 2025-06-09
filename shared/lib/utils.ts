import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { VALIDATION } from "@/shared/constants"

// Утилита для объединения классов Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование телефона
export function formatPhone(phone: string): string {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, "")

  // Форматируем как +7 (999) 999-99-99
  if (cleaned.length === 11 && cleaned.startsWith("7")) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9, 11)}`
  }

  return phone
}

// Нормализация телефона для БД
export function normalizePhone(phone: string): string {
  // Удаляем все нецифровые символы
  let cleaned = phone.replace(/\D/g, "")

  // Если начинается с 8, заменяем на 7
  if (cleaned.startsWith("8") && cleaned.length === 11) {
    cleaned = "7" + cleaned.slice(1)
  }

  // Если не начинается с 7, добавляем
  if (!cleaned.startsWith("7") && cleaned.length === 10) {
    cleaned = "7" + cleaned
  }

  // Возвращаем в формате +7XXXXXXXXXX
  return cleaned.length === 11 && cleaned.startsWith("7")
    ? `+${cleaned}`
    : phone
}

// Валидация телефона
export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(normalizePhone(phone))
}

// Форматирование цены
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice)
}

// Форматирование даты
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  }).format(dateObj)
}

// Форматирование относительного времени
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return "только что"
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} мин. назад`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} ч. назад`
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} дн. назад`

  return formatDate(dateObj)
}

// Генерация slug из текста
export function generateSlug(text: string): string {
  const translitMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  }

  return text
    .toLowerCase()
    .split("")
    .map(char => translitMap[char] || char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Склонение слов
export function pluralize(
  count: number,
  one: string,
  two: string,
  five: string
): string {
  const n = Math.abs(count) % 100
  const n1 = n % 10

  if (n > 10 && n < 20) return five
  if (n1 > 1 && n1 < 5) return two
  if (n1 === 1) return one

  return five
}

// Дебаунс функции
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle функции
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Глубокое копирование объекта
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

// Генерация случайной строки
export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Форматирование размера файла
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Байт"

  const k = 1024
  const sizes = ["Байт", "КБ", "МБ", "ГБ"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Проверка, является ли объект пустым
export function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (typeof obj === "string" || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === "object") return Object.keys(obj).length === 0
  return false
}

// Задержка выполнения
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Парсинг query параметров
export function parseQueryParams(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

// Создание query строки из объекта
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

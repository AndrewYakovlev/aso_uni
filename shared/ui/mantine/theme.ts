import { createTheme, MantineColorsTuple, DEFAULT_THEME } from '@mantine/core'

// Основной цвет бренда
const brandColor: MantineColorsTuple = [
  '#e5f4ff',
  '#cde2ff',
  '#9bc2ff',
  '#64a0ff',
  '#3984fe',
  '#1d72fe',
  '#0969ff',
  '#0058e4',
  '#004ecc',
  '#0043b5',
]

// Дополнительный цвет для акцентов
const accentColor: MantineColorsTuple = [
  '#fff4e2',
  '#ffe9cc',
  '#ffd09c',
  '#fdb766',
  '#fca13a',
  '#fb931d',
  '#fc8c09',
  '#e17900',
  '#c86a00',
  '#ae5a00',
]

export const theme = createTheme({
  // Цвета
  colors: {
    brand: brandColor,
    accent: accentColor,
  },
  primaryColor: 'brand',

  // Шрифты
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace:
    'ui-monospace, SFMono-Regular, SF Mono, Monaco, Consolas, Liberation Mono, Courier New, monospace',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },

  // Радиусы
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },

  // Тени
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  },

  // Белый цвет для компонентов
  white: '#ffffff',
  black: '#000000',

  // Другие токены
  other: {
    // Кастомные переменные для проекта
    headerHeight: 60,
    sidebarWidth: 260,
    sidebarCollapsedWidth: 80,

    // Анимации
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',

    // Z-индексы
    zIndices: {
      mobileNav: 100,
      header: 101,
      modal: 200,
      popover: 300,
      tooltip: 400,
      notification: 500,
    },
  },

  // Компоненты
  components: {
    // Кнопки
    Button: {
      defaultProps: {
        size: 'sm',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    // Инпуты
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },

    // Селекты
    Select: {
      defaultProps: {
        size: 'sm',
        searchable: true,
        clearable: true,
      },
    },

    // Модальные окна
    Modal: {
      defaultProps: {
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 3,
        },
      },
    },

    // Карточки
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
  },
})

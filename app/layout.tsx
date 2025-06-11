import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { theme } from '@/shared/ui/mantine/theme'

// Импорт стилей Mantine
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/code-highlight/styles.css'
import '@mantine/spotlight/styles.css'
import '@mantine/carousel/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/charts/styles.css'

// Глобальные стили
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Автозапчасти АСО - Интернет-магазин автозапчастей',
  description:
    'Широкий ассортимент автозапчастей с быстрой доставкой. Оригинальные и аналоговые запчасти для всех марок автомобилей.',
  keywords: 'автозапчасти, запчасти для авто, купить автозапчасти, магазин автозапчастей',
  authors: [{ name: 'АСО' }],
  creator: 'АСО',
  publisher: 'АСО',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import { AuthProvider } from '@/shared/ui/auth-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications position="top-right" />
            <AuthProvider>{children}</AuthProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  )
}

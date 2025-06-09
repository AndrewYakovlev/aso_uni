import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SEO } from '@/shared/constants'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: SEO.DEFAULT_TITLE,
  description: SEO.DEFAULT_DESCRIPTION,
  keywords: SEO.DEFAULT_KEYWORDS,
  authors: [{ name: 'АСО' }],
  creator: 'АСО',
  publisher: 'АСО',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Автозапчасти АСО',
    locale: 'ru_RU',
    type: 'website',
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
  twitter: {
    title: SEO.DEFAULT_TITLE,
    card: 'summary_large_image',
  },
  verification: {
    // Добавьте ваши коды верификации
    // google: 'google-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

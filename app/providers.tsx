'use client'

import { QueryProvider } from '@/shared/lib/providers/query-provider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-center" richColors closeButton duration={5000} />
    </QueryProvider>
  )
}

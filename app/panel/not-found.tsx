import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export default function PanelNotFound() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Страница не найдена</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Страница, которую вы ищете, не существует или была перемещена.
      </p>
      <Button asChild>
        <Link href="/panel">Вернуться на главную панели</Link>
      </Button>
    </div>
  )
}

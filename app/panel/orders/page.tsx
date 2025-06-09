import { PanelPageWrapper } from '@/shared/ui/panel-page-wrapper'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'

export default function OrdersPage() {
  return (
    <PanelPageWrapper
      title="Управление заказами"
      description="Просматривайте и обрабатывайте заказы клиентов"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Создать заказ
        </Button>
      }
    >
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Страница управления заказами будет реализована в Этапе 4
        </p>
      </div>
    </PanelPageWrapper>
  )
}

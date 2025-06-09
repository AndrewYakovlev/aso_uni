export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Автозапчасти АСО</h1>
        <p className="text-xl text-muted-foreground mb-8">Интернет-магазин автозапчастей</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/catalog"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Перейти в каталог
          </a>
          <a
            href="/panel"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Панель управления
          </a>
        </div>
        <div className="mt-16 text-sm text-muted-foreground">
          <p>Проект находится в разработке</p>
          <p className="mt-2">✅ Этап 0: Базовая инфраструктура</p>
          <p className="mt-1">🚧 Этап 1: Авторизация (Backend ✅, Frontend ✅, Панель 🚧)</p>
          <div className="mt-4 space-y-2">
            <p>
              <a href="/test-auth" className="text-primary hover:underline">
                Тестировать систему анонимных пользователей →
              </a>
            </p>
            <p>
              <a href="/test-login" className="text-primary hover:underline">
                Тестировать API авторизации →
              </a>
            </p>
            <p>
              <a href="/demo-auth" className="text-primary hover:underline">
                Демо UI компонентов авторизации →
              </a>
            </p>
            <p className="pt-2 border-t">
              <a href="/panel" className="text-primary hover:underline font-medium">
                Панель управления →
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

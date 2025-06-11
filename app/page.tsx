import { Title, Text, Container, Button, Group } from '@mantine/core'
import { AuthTest } from '@/shared/ui/auth-test'

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Title order={1} size="h2" ta="center" mt="sm">
        Добро пожаловать в Автозапчасти АСО
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        Интернет-магазин автозапчастей с широким ассортиментом и быстрой доставкой
      </Text>

      <Group justify="center" mt="xl">
        <Button variant="default" size="md">
          Каталог товаров
        </Button>
        <Button size="md">Подобрать по автомобилю</Button>
      </Group>

      <Container size="sm" mt={60}>
        <AuthTest />
      </Container>

      <Text ta="center" mt={100} c="dimmed" size="sm">
        Этап 0: Базовая инфраструктура ✅<br />
        Этап 1: Авторизация (в процессе)
      </Text>
    </Container>
  )
}

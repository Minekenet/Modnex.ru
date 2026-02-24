# Modnex

Каталог игровых модификаций: универсальная витрина под разные игры (Minecraft, Path of Exile 2 и др.) с фильтрами, профилями авторов и поддержкой.

## Стек

- **Frontend:** React 19, Vite 6, React Router 7, Tailwind CSS, Zustand, Axios
- **Backend:** Node.js, Fastify, PostgreSQL, JWT, S3-совместимое хранилище (MinIO), bcryptjs

## Запуск

**Локально (без Docker):**

```bash
# Корень проекта (фронт)
npm install && npm run dev

# Бэкенд
cd backend && npm install && npm run dev
```

Нужны: PostgreSQL, переменные окружения для БД и (опционально) S3. Миграции и сид выполняются при старте бэкенда.

**Docker:**

```bash
docker-compose up -d --build
```

Фронт: http://localhost:8080, API: http://localhost:3000.

## Структура

- `components/` — UI (Header, Hero, каталог, карточки, модалки)
- `pages/` — страницы (главная, игра, каталог, проект, профиль, настройки, админка)
- `api/` — клиент и сервисы к API
- `stores/` — Zustand (auth, избранное)
- `backend/src/` — маршруты, сервисы, БД (schema, seed, миграции)

## Лицензия

MIT.

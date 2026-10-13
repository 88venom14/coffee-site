# Coffee

Простой интернет-магазин кофе. Сайт работает на React, сервер — на Go, данные хранятся в PostgreSQL.

## Что нужно установить

- Go 1.22 или новее
- Node.js и npm
- PostgreSQL

## Первый запуск

1. Создайте базу данных `coffee_shop` и пользователя PostgreSQL.
2. Если файла `backend/.env` ещё нет, скопируйте шаблон и укажите в нём адрес базы и `SESSION_SECRET` длиной не менее 32 символов:

```powershell
Copy-Item .env.example backend/.env
```

3. Примените миграции по порядку. Замените `ИМЯ_ПОЛЬЗОВАТЕЛЯ` на имя пользователя PostgreSQL. `psql` запросит пароль:

```powershell
psql -h localhost -U ИМЯ_ПОЛЬЗОВАТЕЛЯ -d coffee_shop -f backend/migrations/001_schema.sql
psql -h localhost -U ИМЯ_ПОЛЬЗОВАТЕЛЯ -d coffee_shop -f backend/migrations/002_seed.sql
psql -h localhost -U ИМЯ_ПОЛЬЗОВАТЕЛЯ -d coffee_shop -f backend/migrations/003_localize_catalog.sql
```

## Запуск

Откройте два окна терминала.

В первом запустите сервер:

```powershell
cd backend
go run ./cmd/server
```

Во втором установите зависимости и запустите сайт:

```powershell
cd frontend
npm install
npm run dev
```

Откройте в браузере <http://localhost:5173>.

## Проверка сервера

```powershell
cd backend
go test ./...
```

# Backend

При запуске создается (если еще не создан) файл базы database.sqlite
Можно подключиться через программу DBeaver (только для просмотра, менять ничего нельзя!)

## Запуск локального сервера разработки:

1. Перейти в папку backend
2. npm run dev

## Проверка доступности сервера и подключения к БД:

http://localhost:3000/api/health

Ожидаемый ответ сервера:

```json
{
  "status": "Ok",
  "message": "Backend is work!",
  "database": "Connected!"
}
```

## Проверка функционала регистрации

Mожно использовать Insomnia или что-то подобное. Можно тестировать через curl, но могут быть проблемы с кириллицей.

### Создать новый запрос:

Метод: POST
URL: http://localhost:3000/api/auth/register
Headers: Content-Type: application/json
Body (JSON):

```json
{
  "name": "Иван",
  "email": "ivan@test.com",
  "password": "myPasswd123"
}
```

Ожидаемый ответ сервера:

```json
{
  "user": {
    "id": "0d87f462-c894-4c6b-ae3a-468dabfa4a16",
    "name": "Иван",
    "email": "ivan@test.com",
    "createdAt": "2026-03-12T12:40:08.883Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjBkODdmNDYyLWM4OTQtNGM2Yi1hZTNhLTQ2OGRhYmZhNGExNiIsImlhdCI6MTc3MzMxOTIwOCwiZXhwIjoxNzczMzIyODA4fQ.-_DZ7zuEsxpFbLELpYULzqZdfvguFr3qVLhxx9IFJZQ"
}
```

# E-Library Web (Vue 3 + Vite)

Website client for the E-Library API (`elibrary-api`, Laravel).

## Run it

1. Start the API: `php artisan serve` in `elibrary-api` (runs on http://127.0.0.1:8000).
2. In this folder:

```
npm install
npm run dev
```

Open http://localhost:5173. In development, `/api` is proxied to the Laravel server.

## Production build

Copy `.env.example` to `.env`, set `VITE_API_URL` to the deployed API (for example `https://your-api.example/api`), then:

```
npm run build
```

The static site is in `dist/`.

## What works in Phase 1

- Guest session on first visit (token kept in localStorage, sent as `X-Guest-Token`)
- Register, log in, log out (Sanctum token sent as a Bearer token)
- Book catalog with search, category filter and pagination
- Download button that calls the backend, which enforces the 5 (guest) and 10 (member) limits
- Live "downloads left" counter
- Save books to My Library, mark favorites, remove them (members only; synced through the API)

## API contract used (from elibrary-api)

| Screen | Endpoint | Fields read |
|---|---|---|
| Start | `POST /guest/start` | `token` |
| Register / login | `POST /register`, `POST /login` | `token`, `user` (register sends `password_confirmation`) |
| Session | `GET /me` | `user` |
| Catalog | `GET /books?q=&category=&page=&per_page=` | Laravel paginator: `data`, `total`, `last_page` |
| Filters | `GET /categories` | `[{ category, total }]` |
| Download | `GET /books/{id}/download` | `download_url`, `limit`, `used`, `remaining` (429 on limit) |
| Counter | `GET /downloads/status` | `limit`, `used`, `remaining` |
| My Library | `GET/POST /library`, `PATCH /library/{bookId}/favorite`, `DELETE /library/{bookId}` | items `{ id, book_id, is_favorite, book }` |

---
name: api-integration
description: >-
  Use when calling the BookShelf API from the frontend, adding a service method,
  handling API errors, or reacting to a backend contract change. Covers the axios
  instance, the service-layer pattern, response envelopes, and the error contract.
---

# Talking to the BookShelf API

The backend is the separate `bookshelf-api` repo (Node + Express + TypeORM,
deployed on Render). This app never talks to it except through the service layer.

## The axios instance — `src/services/api.ts`

- `baseURL`: dev uses `/api` (Vite proxies it to `VITE_API_URL`); production uses
  `${VITE_API_URL}/api` directly (no proxy on GitHub Pages).
- **Request interceptor** attaches `Authorization: Bearer <token>` from
  `localStorage`.
- **Response interceptor**: on `401` it clears `token` + `user` from
  `localStorage` and hard-redirects to `${import.meta.env.BASE_URL}login`. Do not
  add per-call 401 handling.
- Don't import `axios` anywhere else; import this default export.

## Service layer — `src/services/<feature>.service.ts`

- `export const <feature>Service = { async op(...) { ... } }`.
- Every method: typed params in, typed envelope out, returns `response.data`.
  ```ts
  async createBook(data: CreateBookRequest): Promise<{ message: string; book: Book }> {
    const response = await api.post<{ message: string; book: Book }>('/books', data);
    return response.data;
  }
  ```
- These files use semicolons and single quotes.
- Types live in `src/types/<feature>.ts` and **mirror the API responses exactly**.

## Response envelopes (unchanged contract)

| Kind | Shape |
|---|---|
| mutation | `{ message: string, book: Book }` |
| list | `{ books: Book[], pagination: { page, limit, total, totalPages } }` |
| single | `{ book: Book }` |
| stats | `{ stats: {...} }` |
| auth | `{ message, token, user }` |
| delete | `200 { message }` |

Pagination defaults: `page=1`, `limit=10`. `booksService.getBooks()` is currently
called with no params, so the dashboard only shows the first 10 — wire params
through if you build pagination UI.

## Error contract

Every error response body is:

```json
{ "error": "message in English", "code": "SCREAMING_SNAKE_CASE", "details": [ { "path": "...", "message": "..." } ] }
```

`details` is present only for `VALIDATION_ERROR`. Known codes: `VALIDATION_ERROR`,
`INVALID_CREDENTIALS`, `EMAIL_ALREADY_REGISTERED`, `ISBN_ALREADY_REGISTERED`,
`BOOK_NOT_FOUND`, `TOKEN_MISSING`, `TOKEN_MALFORMED`, `INVALID_TOKEN`,
`ROUTE_NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

### Handling it — `src/lib/apiError.ts`

- **`getApiErrorMessage(err, fallbackKey?)`** → localized string. Order:
  joined `VALIDATION_ERROR` details → `apiErrors.<code>` (via i18n) → raw
  `body.error` → `err.message` → `t(fallbackKey)` (default `apiErrors.generic`).
- **`getApiFieldErrors(err)`** → `{ path: message }` for per-field form errors,
  or `undefined`.
- In components: `catch (err) { setError(getApiErrorMessage(err, 'ns.fallback')) }`.
  Never destructure `err.response.data` yourself.

## When the backend contract changes

1. Update `src/types/*` to match new/changed response shapes.
2. New error `code` → add `apiErrors.<CODE>` to **both** locale files (see the
   `i18n` skill).
3. New/renamed endpoint or params → update the service method only; components
   shouldn't need to know the URL.
4. Check `AuthContext` if the auth response (`{ message, token, user }`) changed.
5. `npm run build` + click through the affected flow against a running API.

## Auth specifics — `src/contexts/AuthContext.tsx`

- `login` / `register` call `authService`, set `user` + `token` state, persist to
  `localStorage`, `navigate('/dashboard')`. They let errors **propagate** — the
  calling page localizes them with `getApiErrorMessage`.
- Components read auth via `useAuth()`; never touch `localStorage` for
  `token`/`user` outside this context and `api.ts`.

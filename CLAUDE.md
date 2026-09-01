# CLAUDE.md — BookShelf Frontend

> **Respond to the user in Brazilian Portuguese (pt-BR).**
> All code, comments, identifiers, commit messages, and docs stay in **English**.
> **User-facing UI strings go through i18n** (`pt-BR` + `en`) — never hardcode
> them. Only the chat replies are pt-BR.

## What this is

Single-page frontend for a personal book library. React 18 + Vite + TypeScript +
Tailwind + shadcn/ui (Radix) + axios + react-i18next. JWT auth held in
`AuthContext` (localStorage-backed). Talks to **`bookshelf-api`** (separate repo,
deployed on Render). Deployed to **GitHub Pages** under `/bookshelf-frontend/` by
GitHub Actions on every push to `main`.

This repo is part of a **test-automation portfolio**: end-to-end suites
(Playwright, Robot Framework) live in their own repos and drive this UI through
`data-testid` attributes — treat those attributes as a public contract.

The project is intentionally **pre-1.0**.

## Layout

```
src/
  pages/         one component per route — LoginPage, RegisterPage, DashboardPage
  components/     shared components; components/ui/ is reserved for shadcn primitives
                 BookModal, DeleteConfirmModal, LanguageSwitcher
  contexts/      AuthContext — { user, token, login, register, logout, isAuthenticated }
  services/      api.ts (shared axios instance) + <feature>.service.ts (typed calls)
  lib/           apiError.ts (backend error -> localized message), utils.ts (cn)
  i18n/          index.ts (init) + locales/{pt-BR,en}.ts
  types/         auth.ts, book.ts — mirror the API response shapes
  @types/        ambient d.ts (react-i18next translation-key typing)
  App.tsx        routes only
  main.tsx       providers (QueryClient, BrowserRouter basename, AuthProvider); imports ./i18n
public/          404.html — SPA-routing fallback for GitHub Pages
```

## Conventions (follow these when changing code)

- **i18n:** never hardcode UI text. Add the key to `src/i18n/locales/pt-BR.ts`
  (source of truth) **and** `en.ts` (typed `: typeof ptBR`, so the build breaks
  if a key is missing). In components use `useTranslation()` → `t('ns.key')`. See
  the `i18n` skill.
- **`data-testid`:** every interactive or asserted element gets one, in
  `kebab-case`; list items use `name-${id}` (e.g. `book-item-${book.id}`).
  External test repos depend on these — a rename is a breaking change, flag it.
- **API access:** only through `src/services/<feature>.service.ts`, which use the
  shared `api` instance from `src/services/api.ts`. Never call `axios`/`fetch`
  from a component. See the `api-integration` skill.
- **Errors:** in the component, `catch` and
  `setError(getApiErrorMessage(err, 'ns.fallbackKey'))` from `src/lib/apiError.ts`.
  It maps the backend `{ error, code, details? }` body to a localized
  `apiErrors.*` string. Per-field form errors: `getApiFieldErrors(err)`. Never
  read `err.response.data.*` by hand.
- **API envelopes:** success `{ message, book }` / `{ books, pagination }` /
  `{ stats }` / `{ message, token, user }`. Error `{ error, code, details? }`
  with `code` in `SCREAMING_SNAKE_CASE`.
- **Components:** function components + hooks. Local `useState`/`useEffect` +
  service calls is the current norm. `@tanstack/react-query` is provider-wired
  but **not used** by feature code yet — don't adopt it piecemeal without saying so.
- **Style:** `.tsx` files (pages, components) use **no semicolons**, single
  quotes, 2-space indent — match `App.tsx`. `src/services/*` and `src/types/*`
  use semicolons. Match the file you are editing.
- **Comments:** only the *why* (a workaround, a non-obvious constraint). Delete
  comments that restate the code.
- **Imports:** the `@/` alias resolves in Vite but **not** in `tsc` (no `paths`
  in tsconfig). Prefer relative imports in new files so `npx tsc -b` stays usable.
- **Auth:** read the session with `useAuth()`. The 401 response interceptor in
  `api.ts` already clears storage and hard-redirects to `${BASE_URL}login` — do
  not duplicate that.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | Vite dev server at `localhost:5173/bookshelf-frontend/`; proxies `/api` → `VITE_API_URL` |
| `npm run build` | `tsc && vite build`. **The `tsc` step is a no-op** (root `tsconfig.json` has `files: []`); `vite build` is the real gate |
| `npm run preview` | serve the production build locally |
| `npx tsc -b` | the actual type-check. 4 **pre-existing** errors today (`button.tsx` `@/` alias, `vite.config.ts` node globals) — ignore those, keep new code clean. Emits stray `vite.config.js`/`.d.ts` at repo root; delete them |
| `npm run lint` | **broken** (`--ext` flag + missing eslint deps). Do not rely on it |
| `npm run deploy` | manual `gh-pages` publish; normally CI handles deploy |

CI (`.github/workflows/deploy-pages.yml`) runs `npm ci && npm run build` and
deploys to Pages on every push to `main`. **There is no lint/test/typecheck gate**
— a green `npm run build` is the only automated check. Keep it green.

## Git & deploy

- **Conventional Commits**, in English, `type(scope): summary`, matching the
  existing history. **Never** add `Co-Authored-By`, `Claude-Session`, or any
  AI-attribution trailer.
- Do not commit or push unless the user asks. `main` **auto-deploys to GitHub
  Pages**.
- Remote: `bookshelf-web/bookshelf-frontend` over SSH (host alias
  `github.com-thiago8rocha`). The `gh` CLI here is a **read-only** account — it
  cannot open PRs or Releases on that repo.
- No `CHANGELOG.md` and no version tags in this repo (the API repo has them).
  `package.json` `version` is static.
- A `bookshelf-api` contract change can break this app. The coupling points are
  `src/types/*` (response shapes) and `src/lib/apiError.ts` (error `code`s). See
  the `api-integration` skill.

## Gotchas

- **GitHub Pages subpath `/bookshelf-frontend/`.** `vite.config.ts` `base`,
  `BrowserRouter basename`, and the `BASE_URL`-prefixed redirect in `api.ts` all
  depend on it. `public/404.html` + the inline script in `index.html` provide the
  SPA-routing fallback — a hard refresh on a deep route breaks without them.
- **`VITE_API_URL`.** Dev reads it from `.env` (`http://localhost:3000/api`).
  The production build reads the repo **Actions Variable** `VITE_API_URL` (base
  URL only — `api.ts` appends `/api`).
- `@tanstack/react-query`, `react-hook-form`, `zod` are installed (and RQ is
  provider-wired) but unused by feature code — scaffolding, not the current
  pattern.
- `booksService.getBooks()` is called with no params on the dashboard, so only
  the first 10 books render and `pagination` is ignored — known, not yet wired
  to any UI.
- No local backend/DB on this machine by default. Run `bookshelf-api` separately,
  or point `VITE_API_URL` at the Render URL, to exercise real data.

## Skills

- `add-feature` — add a screen / component / service the way this codebase layers it
- `i18n` — add or change translation keys, add a language
- `api-integration` — the axios instance, service pattern, and error contract
- `deploy` — GitHub Pages build & deploy, and verifying the live site

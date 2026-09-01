---
name: i18n
description: >-
  Use when adding or changing user-facing text in the BookShelf frontend, wiring
  up translations, or adding a new language. Covers the react-i18next setup, the
  pt-BR-as-source-of-truth locale files, key naming, and the LanguageSwitcher.
---

# Internationalization

The app uses **react-i18next** with `i18next-browser-languagedetector`. Languages:
`pt-BR` (default and fallback) and `en`. Init is in `src/i18n/index.ts`; it runs
synchronously at import time (`main.tsx` does `import './i18n'`), so no `<Suspense>`
boundary is needed.

## The rule

**No hardcoded user-facing strings.** Every visible string — JSX text,
`placeholder`, `aria-label`, `title`, `alt`, error fallbacks — goes through
`t('...')`.

## Files

- `src/i18n/index.ts` — config. `supportedLngs`, `fallbackLng`, detector order
  (`localStorage` → `navigator`), `SUPPORTED_LANGUAGES` / `SupportedLanguage` /
  `DEFAULT_LANGUAGE` exports.
- `src/i18n/locales/pt-BR.ts` — **source of truth** for the key shape. Plain
  nested object, default export.
- `src/i18n/locales/en.ts` — typed `const en: typeof ptBR = { ... }`. If you add a
  key to `pt-BR.ts` and forget it here (or vice-versa), `vite build` and
  `npx tsc -b` fail. That is the safety net — don't defeat it with `as any`.
- `src/@types/react-i18next.d.ts` — augments `i18next`'s `CustomTypeOptions` so
  `t()` autocompletes keys and rejects unknown ones.

## Adding or changing a string

1. Pick a namespace: `common` (shared: appName, email, password, cancel…),
   `language`, `login`, `register`, `dashboard`, `bookForm`, `deleteBook`,
   `apiErrors`. Add a new top-level namespace for a new feature area.
2. Add the key to `pt-BR.ts`, then the matching key to `en.ts`. Keep the objects
   in the same order.
3. Use it: `const { t } = useTranslation()` then `t('dashboard.subtitle')`.
4. Interpolation: `t('dashboard.greeting', { name })` with the placeholder as
   `"Olá, {{name}}!"` / `"Hello, {{name}}!"`. `escapeValue` is off (React escapes).
5. Run `npx tsc -b` — a key mismatch between the two locales shows up here.

## API error messages

Backend errors carry a `code` (`INVALID_CREDENTIALS`, `BOOK_NOT_FOUND`, …). Each
one has a key under `apiErrors.<CODE>` in both locales, plus `apiErrors.generic`.
`getApiErrorMessage()` in `src/lib/apiError.ts` resolves them via `i18n.t`
directly (it works outside React). When the backend adds a new error `code`, add
the matching `apiErrors.<CODE>` entry to both locale files. See the
`api-integration` skill for the error contract.

## The language switcher

`src/components/LanguageSwitcher.tsx` — accessible segmented control
(`role="group"`, `aria-pressed`, `data-testid` `language-switcher` / `lang-pt` /
`lang-en`). It calls `i18n.changeLanguage(lng)`; the detector persists the choice
in `localStorage` under `i18nextLng`. Two visual variants via the `variant` prop:
`onDark` (login/register gradients) and `onLight` (default, e.g. dashboard header).

## Adding a language

1. `src/i18n/locales/<lng>.ts` — `const x: typeof ptBR = { ... }`, translate every
   value.
2. `src/i18n/index.ts` — add `<lng>` to `SUPPORTED_LANGUAGES` and a
   `resources['<lng>'] = { translation: x }` entry.
3. `LanguageSwitcher` maps over `SUPPORTED_LANGUAGES` automatically, but add a
   `language.<lng>` label key and a `data-testid` case for it, and check the
   segmented control still fits on the login screen.
4. Verify `i18n.resolvedLanguage` maps regional tags (e.g. `es-AR` → `es`) —
   `load: 'currentOnly'` + `nonExplicitSupportedLngs: true` handle that.

## Verify

`npm run build`, then `npm run dev` and toggle every screen (login, register,
dashboard, both modals) in both languages. Refresh — the choice must persist. A
fresh/incognito profile must open in `pt-BR`.

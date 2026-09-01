---
name: add-feature
description: >-
  Use when adding a new screen, route, modal, or feature to the BookShelf
  frontend. Walks through the page -> component -> service -> i18n -> data-testid
  pattern the codebase follows so new code matches the existing structure.
---

# Adding a feature to the BookShelf frontend

Read one existing slice first and mirror it: `src/pages/DashboardPage.tsx`
(page + data loading + modals) and `src/components/BookModal.tsx` (form + submit +
error) are the most complete.

## 1. Decide where it lives

- **New route** → a component in `src/pages/`, one component per route. Register
  it in `src/App.tsx` inside `<Routes>`, guarding with `isAuthenticated` the same
  way the existing routes do.
- **Reusable piece of UI** → `src/components/`. `src/components/ui/` is reserved
  for shadcn/Radix primitives — do not put feature components there.
- **New backend call** → a method on the matching `src/services/<feature>.service.ts`
  (create the file if the resource is new). Never call `axios`/`fetch` from a
  component or page.

## 2. Service — `src/services/<feature>.service.ts`

- Import the shared instance: `import api from './api'`.
- One `async` method per operation, typed both ways:
  ```ts
  async getThings(params: GetThingsParams = {}): Promise<ThingsListResponse> {
    const response = await api.get<ThingsListResponse>('/things', { params });
    return response.data;
  }
  ```
- Return `response.data` (the envelope), not the axios response.
- Response shapes go in `src/types/<feature>.ts` and must match the API:
  `{ message, thing }` for mutations, `{ things, pagination }` / `{ thing }` for
  reads. These files use semicolons.
- This file follows the API contract — see the `api-integration` skill.

## 3. Page / component

- Function component, hooks. Copy the state pattern from `DashboardPage`:
  `loading`, `error`, data state; load in `useEffect`; a `loadData` you can call
  again after a mutation.
- **Every user-facing string** comes from `t('...')` — see step 5. No literals in
  JSX, `placeholder`, `aria-label`, `title`, or `alt`.
- **Every interactive / asserted element** gets a `data-testid` (step 6).
- `.tsx` files use no semicolons, single quotes, 2-space indent.
- Keep the visual system: Tailwind utility classes, the existing gradient / card
  / rounded-2xl language, `Button` from `src/components/ui/button`.

## 4. Errors

- In the submit / load handler:
  ```ts
  try {
    // ...
  } catch (err) {
    setError(getApiErrorMessage(err, 'feature.genericErrorKey'))
  }
  ```
  `getApiErrorMessage` (from `src/lib/apiError.ts`) maps the backend `code` to a
  localized `apiErrors.*` message. Never read `err.response.data.*` directly.
- Render the error in a `role="alert"` block, with a `data-testid` if a test
  needs to read it (e.g. `error-message`, `dashboard-error`).
- For per-field form validation, use `getApiFieldErrors(err)` → `{ path: message }`.
- 401 is handled globally by the interceptor in `api.ts` — do not add your own.

## 5. i18n — add the keys

- Add every new string to **both** `src/i18n/locales/pt-BR.ts` and
  `src/i18n/locales/en.ts`, under a namespace for the feature. `en.ts` is typed
  `: typeof ptBR`, so a missing key fails `vite build`.
- Interpolation: `t('feature.greeting', { name })` with `"...{{name}}..."` in the
  locale.
- Full details and the key-naming convention: the `i18n` skill.

## 6. `data-testid`

- `kebab-case`, describing the element: `add-thing-button`, `thing-name-input`,
  `save-thing-button`.
- List rows: `thing-item-${thing.id}`; row actions: `edit-thing-${id}`,
  `delete-thing-${id}`.
- Reuse the vocabulary already in the codebase (`*-button`, `*-input`,
  `*-modal`, `*-page`, `error-message`).
- External Playwright / Robot repos assert on these. If you must rename one, say
  so explicitly in your summary.

## 7. Verify

```
npm run build          # tsc no-op + vite build — the real gate
npx tsc -b             # type check; ignore the 4 known pre-existing errors
```

Then `npm run dev` and click through the flow: both languages via the
`LanguageSwitcher`, the happy path, and an error path (bad input / offline API).
Confirm the new `data-testid`s are present in the DOM.

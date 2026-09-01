---
name: deploy
description: >-
  Use when deploying the BookShelf frontend, debugging the GitHub Pages build, or
  changing anything that touches the subpath / SPA-routing setup. Covers the
  Actions workflow, VITE_API_URL, the base-path gotchas, and verifying the live site.
---

# Deploying the BookShelf frontend

Hosting is **GitHub Pages**, served under `https://<org>.github.io/bookshelf-frontend/`.
Deploy is automatic: `.github/workflows/deploy-pages.yml` runs on every push to
`main` (and via `workflow_dispatch`).

## The pipeline

```
push to main
  → build job: npm ci → npm run build (env: VITE_API_URL from repo Variable) → upload dist/
  → deploy job: actions/deploy-pages
```

There is **no lint / test / typecheck** step. `npm run build` (`tsc` no-op +
`vite build`) is the only gate — if it builds, it ships. Keep it green.

## `VITE_API_URL`

- **Dev:** from `.env` — `http://localhost:3000/api` (note the `/api`; the Vite
  proxy forwards it).
- **Production:** the repo **Actions Variable** `VITE_API_URL`
  (Settings → Secrets and variables → Actions → Variables). **Base URL only** —
  `src/services/api.ts` appends `/api` in prod. `.env.production` holds the
  current value as a fallback/reference.
- CORS: the API's `CORS_ORIGIN` must include the Pages origin
  (`https://<org>.github.io`).

## The subpath — do not break this

Everything below assumes the app is NOT at the domain root:

- `vite.config.ts` → `base: '/bookshelf-frontend/'`.
- `src/main.tsx` → `<BrowserRouter basename={import.meta.env.BASE_URL}>`.
- `src/services/api.ts` → 401 redirect uses `${import.meta.env.BASE_URL}login`.
- `public/404.html` + the inline script in `index.html` → SPA-routing fallback.
  GitHub Pages serves `404.html` for unknown paths; it stashes the route in
  `sessionStorage.redirect` and bounces to `/bookshelf-frontend/`, then
  `index.html` restores it before React mounts. Without this, a hard refresh on
  `/dashboard` 404s.

If the repo/site name ever changes, update all five of the above together.

## Manual / re-run deploy

Pages source is **"GitHub Actions"** (`build_type: workflow`), so the live site is
whatever the last `deploy-pages.yml` run published. To deploy without a code push:
Actions tab → "Deploy to GitHub Pages" → **Run workflow** (`workflow_dispatch`).

The `npm run deploy` script and the `gh-pages` branch are **inert** now — Pages no
longer serves that branch. Leave the script alone or delete it; don't rely on it.

## Verify a deploy

1. Actions tab → the "Deploy to GitHub Pages" run is green; note the deployed URL.
2. Open `https://<org>.github.io/bookshelf-frontend/` — login screen renders,
   `LanguageSwitcher` works.
3. Log in against the live API (confirms `VITE_API_URL` + CORS).
4. Navigate to `/dashboard`, then **hard-refresh** — it must stay on the
   dashboard (SPA fallback working).
5. DevTools → Network: API calls go to `https://<render-url>/api/...`, not
   `localhost` or a relative `/api`.

## Common failures

- **Blank page / 404 on assets:** `base` doesn't match the repo name.
- **Refresh 404s on deep routes:** `public/404.html` missing from `dist/`, or its
  `basePath` constant is wrong.
- **API calls hit `localhost` in production:** `VITE_API_URL` Variable not set on
  the repo, so the build fell back to `.env`.
- **CORS errors in the browser:** API `CORS_ORIGIN` doesn't list the Pages origin.
- **Routing works locally, breaks on Pages:** you used a root-absolute path or
  `<a href>` instead of react-router `Link` / `navigate`.

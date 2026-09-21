# BookShelf Frontend

[![Deploy to GitHub Pages](https://github.com/bookshelf-web/bookshelf-frontend/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bookshelf-web/bookshelf-frontend/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

Single-page web app for managing a personal book library. It is the client for
the [BookShelf API](https://github.com/bookshelf-web/bookshelf-api).

**Live demo:** <https://bookshelf-web.github.io/bookshelf-frontend/>

> The demo API runs on Render's free tier and sleeps when idle, so the first
> request after a period of inactivity can take up to a minute.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- JWT authentication: register, login, logout and protected routes
- Accounts with combinable **roles**: personal library, buy in the bookstore, sell in the bookstore
  (chosen at sign-up, changeable in *My account*); routes and navigation follow the roles
- Company registration for sellers (CNPJ validated by the API) and an admin page to verify companies
- Admin user management: search, edit name/email/roles, suspend or reactivate accounts (audited)
- Profile: change your name and password from *My account*
- Shared catalog: a book exists once (by ISBN); edits to a reviewed book are sent for admin approval and
  flagged on the card, and admins moderate new registrations and proposed edits at `/admin/catalog`
- Second-hand bookstore (`/store`): browse and filter listings, a cart checked out seller by seller, shipping
  or pickup, orders (`/orders`), and for sellers `/sell` and `/sales`; admins moderate orders and listings at
  `/admin/marketplace`
- Simulated payments: Pix and test cards only, with a permanent "test environment" banner. The Pix code is
  deliberately not payable at a bank; the API refuses payments in production unless it is explicitly enabled
- Dashboard with reading statistics (total, to read, reading, read)
- Add, edit and delete books (title, author, ISBN, publisher, year, pages, language, description)
- Star rating (1-5) and personal notes on every book
- Book covers (by URL) shown on the cards, with a fallback when the image cannot load
- Import book data (title, author, ISBN, cover...) from the [Google Books API](https://developers.google.com/books) while adding a book
- Reading status (to read, reading, read) changed straight from the book card
- Search by title or author, filter by status and rating, and sorting
- Paginated book list
- Dark mode: follows the OS by default, toggle persisted per browser
- Installable PWA with offline access to the app shell
- Form validation with localized error messages
- Internationalization: Brazilian Portuguese and English
- Responsive layout

## Tech stack

| Area          | Tools |
|---------------|-------|
| Core          | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [React Router](https://reactrouter.com/) |
| UI            | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) ([Radix UI](https://www.radix-ui.com/)), [Lucide](https://lucide.dev/) |
| Data          | [Axios](https://axios-http.com/), [Google Books API](https://developers.google.com/books) (keyless, called from the browser) |
| Quality       | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/), [ESLint](https://eslint.org/), `tsc` |
| i18n          | [i18next](https://www.i18next.com/) / [react-i18next](https://react.i18next.com/) |

## Getting started

### Prerequisites

- Node.js 20+
- A running instance of the [BookShelf API](https://github.com/bookshelf-web/bookshelf-api)
  (local, see its README, or the hosted demo)

### Installation

```bash
git clone https://github.com/bookshelf-web/bookshelf-frontend.git
cd bookshelf-frontend
npm install
npm run dev
```

The app is served at <http://localhost:5173>. In development,
requests to `/api` are proxied to `http://localhost:3000` (the API's default
port). To point at another API, set `VITE_API_URL` when starting Vite.

## Environment variables

| Variable       | Used in                     | Description |
|----------------|-----------------------------|-------------|
| `VITE_API_URL` | dev proxy, production build | Base URL of the API **without** the `/api` suffix (e.g. `https://bookshelf-api-wfzs.onrender.com`). The app appends `/api` itself in production. |

Only variables prefixed with `VITE_` are exposed to the client. For the deployed
build, `VITE_API_URL` is read from the repository's *Actions variables*.

## Scripts

| Script            | Description                         |
|-------------------|-------------------------------------|
| `npm run dev`     | Start the dev server with hot reload |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Serve the production build locally  |
| `npm run lint`    | Lint with ESLint                    |
| `npm run typecheck` | Type-check with `tsc -b`          |
| `npm test`        | Run the unit tests once (Vitest)    |
| `npm run test:coverage` | Unit tests with coverage and thresholds |
| `npm run test:watch` | Run the unit tests in watch mode |

## Project structure

```
src/
  pages/        route components (Login, Register, Dashboard, Account, CompanyForm, Store, Cart, Orders, Order, Sell, Admin*)
  components/   shared components; ui/ holds shadcn primitives
  contexts/     AuthContext (session) and CartContext (bookstore cart, kept in localStorage)
  hooks/        data loading (useBookLibrary) and theme (useTheme)
  services/     shared Axios instance + typed API calls
  lib/          API error mapping, theme and option helpers, service worker registration
  i18n/         i18next setup and locales (pt-BR, en)
  types/        API response types
  App.tsx       routes
  main.tsx      providers and entry point
public/         static assets, PWA manifest/icons/service worker and the SPA fallback for GitHub Pages
```

## Testing

Unit and component tests run with `npm test` (Vitest + Testing Library). Lint, type-check
and unit tests also gate every deploy and every pull request.

End-to-end, visual and accessibility suites live in separate repositories and
drive this UI through `data-testid` attributes:

| Suite | Repository | Report |
|-------|------------|--------|
| Playwright (TypeScript) | [bookshelf-playwright-tests](https://github.com/thiago8rocha/bookshelf-playwright-tests) | [Allure](https://thiago8rocha.github.io/bookshelf-playwright-tests/allure-report/) |
| Robot Framework | [bookshelf-robotframework-tests](https://github.com/thiago8rocha/bookshelf-robotframework-tests) | [Allure](https://thiago8rocha.github.io/bookshelf-robotframework-tests/allure-report/) |

Every interactive or asserted element has a `data-testid` (for example
`login-button`, `add-book-button`, `stats-total`, `book-item-{id}`), so renaming
them is a breaking change for those suites.

### Running the suites from this repository

The [Run E2E Tests](.github/workflows/run-e2e-tests.yml) workflow triggers the
suites without leaving this repo: open *Actions → Run E2E Tests → Run workflow*,
choose `playwright`, `robot` or `both` (and a Robot suite such as `smoke`), and
follow the links in the run summary. Results are published to the Allure reports
above.

It needs a repository secret named `E2E_DISPATCH_TOKEN`: a fine-grained personal
access token with **Actions: read and write** on the two test repositories.

## Deployment

Every push to `main` triggers
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml), which builds the app
and publishes it to GitHub Pages under `/bookshelf-frontend/`. To deploy your
own copy:

1. In *Settings → Pages*, set the source to **GitHub Actions**.
2. In *Settings → Secrets and variables → Actions → Variables*, add
   `VITE_API_URL` with the public URL of your API.
3. Allow your Pages origin in the API's `CORS_ORIGIN` setting.

## Roadmap

- [x] JWT authentication
- [x] Dashboard with reading statistics
- [x] Add, edit and delete books
- [x] Internationalization (pt-BR and English)
- [x] Paginated book list
- [x] Search, filters and sorting
- [x] Reading status, ratings and personal notes
- [x] Dark mode
- [x] PWA support
- [x] Book cover images
- [x] Import book data from the Google Books API
- [x] Accounts with roles and company registration
- [x] Second-hand bookstore: shared catalog with admin moderation, listings, cart and orders
- [x] Payments (simulated gateway)
- [ ] Upload cover images instead of linking to a URL
- [ ] Reading progress (current page)

## Contributing

Contributions are welcome. Fork the repository, create a branch, and open a pull
request. Run `npm run lint`, `npm run typecheck` and `npm test` first; the same checks run in CI.
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

**Thiago Rocha** — [@thiago8rocha](https://github.com/thiago8rocha)

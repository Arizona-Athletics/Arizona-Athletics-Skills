# `@ua/template-nextjs-app-router`

Next.js 16 App Router starter for University of Arizona Athletics web projects.
Consumes [`@ua/ua-tokens`](../../packages/ua-tokens/) for all design tokens.

In the monorepo, read [`AGENTS.md`](../../AGENTS.md) at the repo root before
editing any code here. In a standalone extraction, use the absolute GitHub docs
linked below. The short version: never hardcode UA colors, default to semantic
tokens, and build pages from the six shared components.

## Standalone quick start

Use this path when the folder was extracted with:
`bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/nextjs-app-router my-site`.

```bash
cd my-site
bun install
bun run dev
bun run build
bun run check
```

The template vendors a minimal `@ua/ua-tokens` package at
`vendor/ua-tokens`, so it does not need the monorepo workspace after
extraction. For the repo-wide rules, use the GitHub docs:
[`AGENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/AGENTS.md),
[`docs/COMPONENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/COMPONENTS.md),
and [`docs/DARK_MODE.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/DARK_MODE.md).

Project-specific components belong in `components/` only when the six shared
components do not cover the workflow. Keep them token-driven and compose them
from `Card`, `Toolbar`, or `Hero` patterns where possible.

## Monorepo quick start

```bash
# from the repo root
bun install
bun --filter @ua/template-nextjs-app-router run dev
```

The dev server runs on `http://localhost:3000` using Turbopack. The React
Compiler is enabled via `next.config.ts`.

Other scripts:

```bash
bun --filter @ua/template-nextjs-app-router run build   # production build
bun --filter @ua/template-nextjs-app-router run start   # serve the build
bun --filter @ua/template-nextjs-app-router run check   # tsc --noEmit
bun --filter @ua/template-nextjs-app-router run lint    # next lint
```

## Stack

| Piece | Version |
| --- | --- |
| Next.js | 16.2 (App Router, Turbopack dev, React Compiler) |
| React | 19.2 |
| TypeScript | 5.7 strict, self-contained for standalone extraction |
| Tailwind | 4 (`@tailwindcss/postcss` PostCSS plugin) |
| Tokens | `@ua/ua-tokens` vendored file dep |
| Auth | Cognito confidential client, server-side code exchange |

## The six components

Per [`docs/COMPONENTS.md`](../../docs/COMPONENTS.md), every template ships:

| Component | Where |
| --- | --- |
| Header | `components/Header.tsx` (server) |
| Hero | `components/Hero.tsx` (server) |
| Toolbar | `components/Toolbar.tsx` (server) |
| Card | `components/Card.tsx` (server) |
| Footer | `components/Footer.tsx` (server) |
| ThemeToggle | `components/ThemeToggle.tsx` (`"use client"`) |

The home page at `app/page.tsx` composes all six.

## Dark mode

Dark mode is keyed off `data-theme` on `<html>`. The FOUC-safe pre-paint
script in `app/layout.tsx` runs before any stylesheet and resolves
`system → light | dark` synchronously. Do not "modernize" it — it is ES5 on
purpose so it parses on every browser without a transpile step. Reference:
[`docs/DARK_MODE.md`](../../docs/DARK_MODE.md).

All component styling uses semantic Tailwind utilities (`bg-semantic-surface`,
`text-semantic-text-strong`, `border-semantic-border`, etc.) so the same
markup flips between light and dark with no overrides.

## Auth (Cognito + UA SAML)

Three server-side route handlers stub the confidential-client flow:

- `app/auth/signin/route.ts` — generates `state`, stores it in an httpOnly
  cookie, redirects to the Cognito Hosted UI with `identity_provider` set to
  the UA SAML IdP.
- `app/auth/callback/route.ts` — validates `state`, exchanges the code for
  tokens, sets an httpOnly session cookie. **Stub — does not verify the JWT
  signature; production must.**
- `app/auth/signout/route.ts` — clears cookies and redirects to Cognito
  `/logout`.

Helpers live in `lib/auth.ts`, which imports `server-only` so the bundler
will fail the build if a client component ever tries to pull it in. The
client secret is read from `process.env.COGNITO_CLIENT_SECRET` and never
exposed via `NEXT_PUBLIC_*`. See [`docs/AUTH.md`](../../docs/AUTH.md).

### `// CONFIGURE_ME` checklist

Before this template can be deployed at UA, every `// CONFIGURE_ME` marker
needs a real value. The full list:

- `app/layout.tsx` — page title and description in `metadata`.
- `components/Header.tsx` — nav items, brand mark SVG, sign-in target.
- `components/Footer.tsx` — link columns, Privacy URL, Accessibility URL,
  official wordmark SVG.
- `lib/auth.ts` — JWT verification, post-login landing page.
- `app/auth/callback/route.ts` — error-page rendering on auth failure.
- `.env.local` (copy from `.env.example`) —
  - `AWS_REGION`
  - `COGNITO_USER_POOL_ID`
  - `COGNITO_CLIENT_ID`
  - `COGNITO_CLIENT_SECRET` (server-side only; never `NEXT_PUBLIC_`)
  - `COGNITO_DOMAIN`
  - `COGNITO_REDIRECT_URI`
  - `COGNITO_LOGOUT_URI`
  - `COGNITO_SAML_PROVIDER_NAME`
  - `AUTH_STATE_SECRET`

`COGNITO_CLIENT_SECRET` is read **only** in `app/auth/*/route.ts` handlers.
Do not import `lib/auth.ts` from any client component or page that renders
on the client; the `server-only` guard will fail the build if you do.

## Project layout

```
app/
  layout.tsx             # root layout, FOUC-safe theme script
  page.tsx               # home: Header + Hero + Toolbar + 3 Cards + Footer
  globals.css            # imports @ua/ua-tokens/tokens.css + Tailwind
  auth/
    signin/route.ts      # GET /auth/signin
    callback/route.ts    # GET /auth/callback
    signout/route.ts     # GET /auth/signout
components/
  Header.tsx
  Hero.tsx
  Toolbar.tsx
  Card.tsx
  Footer.tsx
  ThemeToggle.tsx        # "use client"
lib/
  auth.ts                # server-only Cognito helpers
  theme.ts               # client-side theme helpers
next.config.ts           # React Compiler on, Turbopack default in dev
tailwind.config.ts       # @ua/ua-tokens/tailwind preset
postcss.config.js        # Tailwind 4 PostCSS plugin
tsconfig.json            # self-contained strict TypeScript config
.env.example             # Cognito server config
```

## Hard rules

- **Never** hardcode UA hex values in component code. Use semantic Tailwind
  utilities or `var(--*)` from `@ua/ua-tokens/tokens.css`.
- **Never** prefix `COGNITO_CLIENT_SECRET` with `NEXT_PUBLIC_`.
- **Never** remove or alter the required legal bar in `components/Footer.tsx`.
- **Always** read [`AGENTS.md`](../../AGENTS.md) before non-trivial work.

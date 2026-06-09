# `@ua/template-astro`

University of Arizona Athletics starter — **Astro 6 + Tailwind 4 + `@ua/ua-tokens`**.
Long-form / editorial / mostly-static sites that still need PKCE auth and the
six shared UA components.

> In the monorepo, read [`AGENTS.md`](../../AGENTS.md) first. In a standalone
> extraction, use the absolute GitHub docs linked below.

## Standalone quick start

Use this path when the folder was extracted with:
`bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/astro my-site`.

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

Project-specific components belong in `src/components/` only when the six
shared components do not cover the workflow. Keep them token-driven and compose
them from `Card`, `Toolbar`, or `Hero` patterns where possible.

## Monorepo quick start

```bash
# from the repo root
bun install
bun --filter @ua/template-astro run dev      # http://localhost:4321
bun --filter @ua/template-astro run build    # → dist/
bun --filter @ua/template-astro run check    # astro check + tsc --noEmit
```

## Stack decisions

- **Astro 6** with `output: "static"`. The PKCE callback runs entirely in the
  browser, so a server runtime isn't needed. If a future project needs the
  Authorization Code + client_secret flow (see [`docs/AUTH.md`](../../docs/AUTH.md)),
  switch to `output: "server"` and add `@astrojs/node`.
- **Tailwind 4 via `@tailwindcss/vite`** (the Vite plugin), not the legacy
  `@astrojs/tailwind` integration. `@astrojs/tailwind` is pinned to Tailwind 3
  and Astro ≤ 5. The Vite plugin is what Astro 6 + Tailwind 4 actually uses,
  and it matches `templates/react-vite-plus`.
- **`@ua/ua-tokens`** as a vendored file dependency. The Tailwind preset
  (`@ua/ua-tokens/tailwind`) is the single source of truth for colors, type,
  spacing, radii, and shadows. Use `bg-semantic-*` / `text-semantic-*` etc.
  rather than hex.
- **PKCE for auth.** No client_secret ships in the browser bundle. See
  [`src/lib/auth.ts`](./src/lib/auth.ts) and
  [`src/pages/auth/callback.astro`](./src/pages/auth/callback.astro).

## Six shared components (per `docs/COMPONENTS.md`)

- **Header** → [`src/components/Header.astro`](./src/components/Header.astro)
- **Hero** → [`src/components/Hero.astro`](./src/components/Hero.astro)
- **Toolbar** → [`src/components/Toolbar.astro`](./src/components/Toolbar.astro)
- **Card** → [`src/components/Card.astro`](./src/components/Card.astro)
- **Footer** → [`src/components/Footer.astro`](./src/components/Footer.astro)
- **ThemeToggle** → [`src/components/ThemeToggle.astro`](./src/components/ThemeToggle.astro)

All six are composed on the demo page at [`src/pages/index.astro`](./src/pages/index.astro).

## Dark mode

The FOUC-safe pre-paint script lives inline at the top of
[`BaseLayout.astro`](./src/layouts/BaseLayout.astro)'s `<head>` —
**before** Astro injects any stylesheet. See
[`docs/DARK_MODE.md`](../../docs/DARK_MODE.md) for the rationale.

The toggle (`ThemeToggle.astro`) cycles `system → light → dark`, persists to
`localStorage.ua-theme`, and reuses the canonical `setTheme` /
`watchSystemTheme` helpers in [`src/lib/theme.ts`](./src/lib/theme.ts).

## CONFIGURE_ME checklist

These markers appear in source and must be filled in before deploying:

- **`src/lib/auth.ts`** — every field of `authConfig` (region, Cognito domain,
  client ID, redirect URI, logout URI, SAML provider name) reads from
  `import.meta.env`. Fill those in via `.env`.
- **`src/pages/auth/callback.astro`** — post-login landing route + how tokens
  are handed off to the app-level store. Default is `/`.
- **`src/components/Header.astro`** — replace the placeholder text mark with
  the official Block A or UA wordmark SVG (ask UA Marcom).
- **`src/components/Hero.astro`** — set a real `background-image` on the
  `with-image` variant when wiring up a real hero photo.
- **`src/components/Footer.astro`** — confirm the Privacy / Accessibility URLs
  match UA Marcom's current statements before launch.
- **`src/layouts/BaseLayout.astro`** — uncomment and fill in the Typekit
  `<link>` once UA Marcom has cleared the domain for `{KIT_ID}`. See
  [`docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md).
- **`.env`** — copy `.env.example`, then fill in real values via the UA IT
  engagement ticket.

## Auth flow

PKCE against AWS Cognito federated with UA's SAML IdP. Sequence diagram and
environment variables live in [`docs/AUTH.md`](../../docs/AUTH.md). The
short version:

1. App calls `buildAuthorizeUrl()` and redirects to Cognito Hosted UI.
2. Cognito redirects to UA's SAML IdP; user authenticates with NetID.
3. Cognito redirects back to `/auth/callback` with `?code=…&state=…`.
4. `callback.astro` verifies state, exchanges the code via
   `exchangeCodeForTokens()`, and routes on. Tokens live in memory.

## Files / structure

```
templates/astro/
  astro.config.mjs            # static output + Tailwind 4 via @tailwindcss/vite
  tailwind.config.ts          # presets: [@ua/ua-tokens/tailwind]
  tsconfig.json               # self-contained strict TypeScript config
  package.json                # @ua/template-astro
  .env.example                # Cognito + Typekit placeholders
  src/
    env.d.ts
    layouts/BaseLayout.astro  # FOUC-safe pre-paint script + global.css import
    pages/
      index.astro             # demo composing all six components
      auth/callback.astro     # PKCE callback handler
    components/
      Header.astro
      Hero.astro
      Toolbar.astro
      Card.astro
      Footer.astro
      ThemeToggle.astro
    lib/
      auth.ts                 # PKCE helpers
      theme.ts                # setTheme + watchSystemTheme
    styles/
      global.css              # imports @ua/ua-tokens/tokens.css + Tailwind
```

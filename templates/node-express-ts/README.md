# UA Athletics — Node + Express + TypeScript

Server-rendered starter for **University of Arizona Athletics** apps.
Node 22 + Express 5 + TypeScript (strict) + EJS, modeled on the
production `Arizona-Athletics/bear-down-lms` app.

Renders the six canonical UA components — Header, Hero, Toolbar, Card,
Footer, ThemeToggle — using **Arizona Bootstrap 5.1.3** served from the
official UA CDN (`cdn.digital.arizona.edu`). All colors come from
[`@ua/ua-tokens`](../../packages/ua-tokens) so light/dark/system flips with
zero per-component overrides.

## Standalone quick start

Use this path when the folder was extracted with:
`bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/node-express-ts my-site`.

```bash
cd my-site
bun install
cp .env.example .env
bun run dev
bun run build
```

The template vendors a minimal `@ua/ua-tokens` package at
`vendor/ua-tokens`, so it does not need the monorepo workspace after
extraction. For the repo-wide rules, use the GitHub docs:
[`AGENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/AGENTS.md),
[`docs/COMPONENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/COMPONENTS.md),
and [`docs/DARK_MODE.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/DARK_MODE.md).

Project-specific view partials belong in `src/views/partials/` only when the
six shared partials do not cover the workflow. Keep them token-driven and
compose from the existing card, toolbar, and hero partials where possible.

## Monorepo quick start

```bash
# from the monorepo root, install once (Bun)
bun install

# copy the env stub and fill in CONFIGURE_ME values
cp templates/node-express-ts/.env.example templates/node-express-ts/.env

# dev server with TS watch
cd templates/node-express-ts
bun run dev

# open http://localhost:3000
```

Production build:

```bash
bun run build   # tsc → dist/
bun run start   # node dist/server.js
```

## Toolchain

| Tool | Version |
| --- | --- |
| Bun | 1.3+ (install + scripts) |
| Node | 22+ |
| TypeScript | 5.7 strict |
| Express | 5.2.1 |
| EJS | 3.1 |
| Helmet | 8 |
| zod | 3.23 |
| `@ua/ua-tokens` | `file:./vendor/ua-tokens` |

Arizona Bootstrap is **not** an npm dependency. It is loaded from
`cdn.digital.arizona.edu/lib/arizona-bootstrap/5.1.3/`, which is the only
distribution Arizona Digital ships. Same for the wordmark and Block A — see
[`docs/COMPONENTS.md`](../../docs/COMPONENTS.md).

## Layout

```
templates/node-express-ts/
├── src/
│   ├── server.ts           # Express app, view engine, error handler, graceful shutdown
│   ├── env.ts              # zod-validated env loader
│   ├── auth/
│   │   ├── cognito.ts      # Authorize / token / logout URL builders (stub exchange)
│   │   ├── session.ts      # express-session config + cookie hardening
│   │   └── middleware.ts   # attachUser / requireAuth / requireGroup
│   ├── routes/
│   │   ├── index.ts        # home — renders hero + toolbar + cards
│   │   ├── healthz.ts      # /healthz JSON probe
│   │   └── auth.ts         # /auth/login, /auth/callback, /auth/logout stubs
│   ├── middleware/
│   │   ├── security.ts     # Helmet + CSP (allows cdn.digital.arizona.edu, Typekit, Material Symbols)
│   │   ├── theme.ts        # reads ua-theme cookie
│   │   └── errors.ts       # 404 + 500 handlers
│   └── views/
│       ├── partials/
│       │   ├── head.ejs        # <head> + FOUC-safe pre-paint script
│       │   ├── foot.ejs        # AZ Bootstrap JS + theme-toggle runtime
│       │   ├── header.ejs      # .arizona-header.bg-red + brand band + .bg-blue nav
│       │   ├── footer.ejs      # 5-column footer + legal strip
│       │   ├── theme-toggle.ejs # 3-state toggle
│       │   └── card.ejs        # reusable card snippet
│       └── pages/
│           ├── home.ejs        # hero / toolbar / card grid
│           ├── 404.ejs         # branded "this one slipped past us"
│           └── 500.ejs         # branded error
├── public/
│   ├── styles/app.css      # @ua/ua-tokens + Bootstrap-CSS-var bridge
│   └── img/block-a.svg     # placeholder — swap for licensed asset before production
├── .env.example            # CONFIGURE_ME for every Cognito / SAML / Typekit value
├── package.json
├── tsconfig.json
└── README.md
```

Static assets are served under `/static`, so `/static/styles/app.css` resolves
to `public/styles/app.css`.

## The UA chrome

| Region | What you get |
| --- | --- |
| **Header** | Canonical `.arizona-header.bg-red` with the UA wordmark from `cdn.digital.arizona.edu`, plus a white brand band with the **Block A** on its required white substrate, plus a `.navbar.navbar-expand-lg.bg-blue` site nav. |
| **Hero** | `.background-wrapper.text-bg-red.bg-triangles-top-left` with a `display-2` headline (weight 300 — heavy display feels ASU), `.lead` subhead, and two `.btn-outline-white` CTAs. |
| **Toolbar** | Thin Tickets / Schedule / Roster / News / Watch bar on `.bg-warm-gray`. |
| **Cards** | Three white-surface `.shadow-sm.rounded-3` cards on a `.bg-warm-gray` section with a red small-caps eyebrow per the design spec. |
| **Footer** | 5-column grid with Block A, link columns, newsletter form, and the legal strip — *"Bear Down® and Block A® are registered trademarks of the Arizona Board of Regents"*. |
| **ThemeToggle** | 3-state (system / light / dark) with a FOUC-safe pre-paint script. Writes a `ua-theme` cookie so SSR matches the browser. |

Voice follows the design spec: confident, optimistic, short, second-person, action-led.
*"Bear Down. Build Up."* as rhetorical punctuation, not the opener every time.

## Tokens — the one-line rule

Consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to semantic
tokens (`--bg`, `--surface`, `--text`, `--accent`); reach for brand tokens
(`--ua-red`, `--ua-blue`) only for one-off identity accents.

`head.ejs` loads `@ua/ua-tokens/tokens.css` before `public/styles/app.css`;
`app.css` then bridges Bootstrap utility surfaces back to semantic variables so
the entire UI flips dark/light without per-component overrides.

## Theme toggle

A FOUC-safe inline script in `partials/head.ejs` runs **before any stylesheet**:

1. Reads `localStorage["ua-theme"]` (or falls back to `prefers-color-scheme`).
2. Sets `data-theme` + `data-bs-theme` on `<html>` so both `@ua/ua-tokens`
   and Arizona Bootstrap pick up the same mode on first paint.
3. Writes a `ua-theme` cookie so the next server-rendered request matches.

The runtime in `partials/foot.ejs` wires the toggle button to cycle
**system → light → dark** and live-updates `<html>` + the cookie. Dark mode
is brand-true navy (Midnight + Arizona Blue) — never GitHub gray.

## Getting auth working

The standard UA Athletics auth pattern is **AWS Cognito User Pool federated
with the UA SAML Identity Provider** (NetID via WebAuth). This template
ships the *shape* of that flow:

- `src/auth/cognito.ts` — builds Cognito Hosted-UI authorize / logout URLs
  from the env, and declares an `exchangeCodeForUser()` stub that real
  projects implement against `openid-client` + JWKS verification.
- `src/auth/session.ts` — `express-session` config with httpOnly, SameSite=Lax,
  Secure-in-prod cookies. Production deployments should swap the default
  MemoryStore for Redis / Postgres / DynamoDB (commented inline).
- `src/auth/middleware.ts` — `attachUser`, `requireAuth`, `requireGroup`.
  Group names are passed in by the consuming app; never hardcoded in this
  template.
- `src/routes/auth.ts` — `/auth/login` mints `state`, redirects to Cognito
  Hosted UI with `identity_provider=<COGNITO_SAML_PROVIDER_NAME>`.
  `/auth/callback` validates state, exchanges code for tokens server-side
  (HTTP Basic with the client secret), and stores a slim user record on the
  session. `/auth/logout` clears the local session, then bounces the
  browser to Cognito's `/logout` endpoint so the Cognito-side session is
  cleared too.

Every UA-specific value lives in `.env` (gitignored) and is referenced via
`CONFIGURE_ME` placeholders. **No pool IDs, client IDs, client secrets,
internal callback URLs, or UA IdP names ship in this template.**

Full contract: [`docs/AUTH.md`](../../docs/AUTH.md).

### Required env

See `.env.example`. Variables to fill in:

| Var | Source |
| --- | --- |
| `SESSION_SECRET` | `openssl rand -base64 48` |
| `AWS_REGION` | Your AWS account |
| `COGNITO_USER_POOL_ID` | AWS Console |
| `COGNITO_CLIENT_ID` | AWS Console (app client) |
| `COGNITO_CLIENT_SECRET` | AWS Console (server-side ONLY) |
| `COGNITO_DOMAIN` | AWS Console (Cognito Hosted UI subdomain) |
| `COGNITO_REDIRECT_URI` | Must match the app client's allowed callback URL |
| `COGNITO_LOGOUT_URI` | Must match the app client's allowed sign-out URL |
| `COGNITO_SAML_PROVIDER_NAME` | Cognito IdP name that points at the UA SAML IdP |
| `TYPEKIT_KIT_ID` | Adobe Fonts kit ID (your unit licenses its own) |

## CSP

`src/middleware/security.ts` issues a Helmet CSP that allows exactly what
the canonical UA chrome needs:

- `cdn.digital.arizona.edu` — Arizona Bootstrap CSS + JS, wordmark, Block A.
- `fonts.googleapis.com` + `fonts.gstatic.com` — Material Symbols Rounded.
- `use.typekit.net` + `p.typekit.net` — Adobe Fonts (Proxima Nova).
- `*.amazoncognito.com` — Hosted-UI form-action target.

The inline pre-paint + theme-toggle scripts run under per-request nonces.

## What this template does **not** include

- **No Wilbur, no cat face, no team lockups.** Athletics-licensed only.
- **No Bear Down Bold font.** Athletics-licensed only.
- **No real UA identifiers.** Every Cognito / SAML / Typekit value is
  `CONFIGURE_ME`.
- **No DB.** Sessions live in `MemoryStore` by default — swap in for
  production (see the comment in `src/auth/session.ts`).
- **No business logic.** This is a starter shell.

## Where to learn more

- [`AGENTS.md`](../../AGENTS.md) — repo LLM contract.
- [`docs/COLORS.md`](../../docs/COLORS.md), [`docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md),
  [`docs/COMPONENTS.md`](../../docs/COMPONENTS.md), [`docs/DARK_MODE.md`](../../docs/DARK_MODE.md).
- [`docs/AUTH.md`](../../docs/AUTH.md) — Cognito + UA SAML in detail.
- [`docs/COMPONENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/COMPONENTS.md)
  — canonical design spec (Header markup, Hero, Cards, Footer, Block A rules).

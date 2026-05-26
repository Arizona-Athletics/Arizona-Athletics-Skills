# @ua/template-html-tailwind

University of Arizona Athletics starter — **plain HTML5 + Tailwind 4 + Arizona Bootstrap (CDN)**. Demonstrates how a Tailwind-first project consumes UA tokens AND the canonical Arizona Bootstrap components side-by-side.

For the full design-system contract (six components, hard don'ts, token discipline) read [`/AGENTS.md`](../../AGENTS.md) before changing anything.

## Quick start

```bash
# from the repo root
bun install

# build Tailwind once, then serve the static files on :8081
bun --filter @ua/template-html-tailwind run build
bun --filter @ua/template-html-tailwind run serve

# or, while iterating, run the Tailwind watcher in one pane
bun --filter @ua/template-html-tailwind run dev
# and `bun --filter @ua/template-html-tailwind run serve` in another
```

Then open <http://localhost:8081>.

| Script  | What it does                                                              |
| ------- | ------------------------------------------------------------------------- |
| `dev`   | `tailwindcss -i src/styles.css -o dist/styles.css --watch`                |
| `build` | One-shot compile to `dist/styles.css`.                                    |
| `serve` | `python3 -m http.server 8081` — zero-install static file server.          |

## Stack

- **HTML5** — vanilla, no framework, no bundler.
- **Tailwind 4 (Oxide)** via the `@tailwindcss/cli` package, configured by
  [`tailwind.config.ts`](./tailwind.config.ts). The config consumes the workspace
  preset from [`@ua/ua-tokens`](../../packages/ua-tokens) so UA brand and
  semantic utilities (`bg-ua-red`, `text-semantic-text-strong`,
  `border-semantic-border`) are available out of the box. No hand-rolled
  `theme.extend.colors`.
- **Arizona Bootstrap 5.1.3** loaded from `cdn.digital.arizona.edu`. AZ
  Bootstrap is **not on npm** — the CDN is the canonical distribution. The
  CSS provides `.arizona-header`, `.bg-red`, `.display-2`,
  `.background-wrapper.bg-triangles-top-left`, `.btn-outline-white`,
  `.bg-warm-gray`, the `.card` system, and all the structural classes used in
  this template. The JS bundle drives the offcanvas + navbar collapse.
- **Vanilla JS** — `theme.js` (FOUC-safe theme toggle) and `auth.js`
  (Cognito + UA SAML PKCE scaffold).

## How Tailwind and AZ Bootstrap coexist

The two CSS layers are intentionally complementary, not competitive:

1. **AZ Bootstrap owns the canonical components.** Every structural element
   — `.arizona-header.bg-red`, `.background-wrapper.text-bg-red.bg-triangles-top-left`,
   `.navbar.navbar-expand-lg.bg-blue`, `.bg-warm-gray`, `.card.border-0.shadow-sm.rounded-3`,
   `.row.row-cols-md-5` — uses canonical AZ Bootstrap markup straight from
   [`../../.claude/research/ua-design-spec-2026-05-22.md`](../../.claude/research/ua-design-spec-2026-05-22.md).
   Do not replace those with Tailwind utility chains; doing so drifts the
   brand and breaks the dark-mode wiring AZ ships.
2. **Tailwind handles project-specific polish.** Micro-spacing
   (`gap-2`, `ml-auto`), per-page layout (`grid-cols-…`, `min-h-screen`),
   and semantic tokens via the preset (`bg-semantic-bg`,
   `text-semantic-text-strong`).
3. **Load order matters.** AZ Bootstrap CSS loads BEFORE the compiled Tailwind
   stylesheet, so Tailwind utilities win where the two overlap. AZ Bootstrap's
   component classes are specific enough (`.arizona-header`, `.btn-red`,
   `.display-2`) to survive Tailwind's preflight reset.

### Caveat — reset coexistence

Both AZ Bootstrap and Tailwind ship a reset (Bootstrap's Reboot, Tailwind's
Preflight). They are mostly compatible but they DO both touch the same handful
of elements: `html`, `body`, `h1`–`h6`, `button`, `a`. The net result on this
template:

- `body` background and font come from `@ua/ua-tokens` semantic tokens applied
  in [`src/styles.css`](./src/styles.css)'s `@layer base` (loaded last → wins).
- Headings inside AZ Bootstrap components (`.display-2`, `.h4`, `.lead`) work
  exactly as designed — Tailwind's preflight does not override the AZ class.
- Bare `<a>` tags pick up the link color from
  `[data-bs-theme]` via the tokens layer.
- Bare `<button>` styling falls to AZ Bootstrap, which is what AZ component
  classes expect.

If you find a reset clash, the fix is almost always to add the appropriate AZ
Bootstrap class (`.btn`, `.h4`, `.lead`) rather than reach for a Tailwind
override.

## Files

| File                     | What it is                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| `index.html`             | Demo page with all six components (Header, Hero, Toolbar, Card, Footer, ThemeToggle). |
| `src/styles.css`         | Tailwind entry: `@import "tailwindcss"`, tokens import, `@source`, thin project layer. |
| `tailwind.config.ts`     | Config; presets in `@ua/ua-tokens/tailwind`, scans `index.html` + `src/**`. |
| `dist/styles.css`        | Compiled Tailwind output (gitignored — produced by `bun run build`).       |
| `theme.js`               | Cycle-button ThemeToggle + system-preference listener + footer year stamp. |
| `auth.js`                | Cognito + UA SAML PKCE scaffold. All real values are `// CONFIGURE_ME`.    |
| `public/block-a.svg`     | Placeholder 96×96 Block A on white substrate. Replace with the unit asset. |
| `.env.example`           | Cognito + Typekit placeholders. Copy to `.env` and fill in.                |

## Six-component checklist (per `/docs/COMPONENTS.md`)

- **Header** — canonical `.arizona-header.bg-red` with CDN wordmark, brand
  band with Block A on white substrate, then `.navbar.navbar-expand-lg.bg-blue`.
- **Hero** — `.background-wrapper.text-bg-red.bg-triangles-top-left` with
  `.display-2.fw-bold` headline, `.lead` subhead, two `.btn-outline-white.btn-lg`
  CTAs.
- **Toolbar** — `.navbar.navbar-expand.bg-warm-gray.border-bottom` with
  Tickets / Schedule / Roster / News / Watch links in small-caps.
- **Card** — three `.card.border-0.shadow-sm.rounded-3.h-100` tiles on a
  `.bg-warm-gray` section, red small-caps eyebrow + `.h4` headline.
- **Footer** — five-column `.row.row-cols-md-5` with Block A column, link
  columns, newsletter form, and the required `Bear Down® and Block A®` legal strip.
- **ThemeToggle** — `#ua-theme-toggle` cycle-button (`system → light → dark`)
  styled with AZ Bootstrap's `.btn-arizona-header` so it sits cleanly in the
  red bar. Pre-paint script inline in `<head>`; runtime helpers in `theme.js`.

## Dark mode

- The pre-paint script is the first thing inside `<head>`, **before any
  `<link rel="stylesheet">`**. It reads `localStorage["ua-theme"]` and writes
  both `data-theme` and `data-bs-theme` on `<html>`. See
  [`/docs/DARK_MODE.md`](../../docs/DARK_MODE.md).
- Cycle order: **system → light → dark → system**.
- `@ua/ua-tokens/tokens.css` (imported by `src/styles.css`) ships the dark
  override block for both `[data-theme="dark"]` and `[data-bs-theme="dark"]`,
  so AZ Bootstrap and the Tailwind semantic utilities flip on the same attribute.
- Do **not** add component-level dark overrides. The tokens layer handles it.

## `// CONFIGURE_ME` items

These values are intentionally blank. Fill them in via your project's
deployment process — never commit real values. See
[`/docs/AUTH.md`](../../docs/AUTH.md) for the engagement process.

| Where                                 | What                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `index.html` Typekit `<link>`         | Currently commented out. Replace `CONFIGURE_ME` with your kit ID. Requires UA Marcom clearance — email `web@arizona.edu`. |
| `public/block-a.svg`                  | Placeholder Block A. Swap for your unit's licensed Block A asset from `cdn.digital.arizona.edu` or `licensing.arizona.edu`. |
| `auth.js` → `config.region`           | AWS region of your Cognito User Pool.                                                                                 |
| `auth.js` → `config.cognitoDomain`    | Cognito hosted-UI subdomain.                                                                                          |
| `auth.js` → `config.clientId`         | Cognito **public** app-client ID (SPA, PKCE — no client secret).                                                      |
| `auth.js` → `config.samlProviderName` | The SAML provider name registered in Cognito (e.g. `UAWebAuth`).                                                       |
| `auth.js` → `config.redirectUri` / `logoutUri` | Must be registered on the Cognito app client.                                                                 |
| `.env.example`                        | Same values as above, in shell form. Copy to `.env` and fill in. `.env` is gitignored.                                |

## Hard don'ts

- Zero hex values in `src/styles.css`. Tokens come from the
  `@ua/ua-tokens` Tailwind preset (brand utilities for one-off accents,
  semantic utilities for everything else).
- Do not migrate this template from the Tailwind preset to a hand-rolled
  `theme.extend.colors` block. Tokens flow through the preset on purpose.
- Do not replace canonical AZ Bootstrap markup (`.arizona-header`,
  `.background-wrapper.bg-triangles-top-left`, `.btn-red`, `.display-2`,
  `.bg-warm-gray`, `.row.row-cols-md-5`) with bespoke Tailwind utility chains.
- Do not use Wilbur, the cat-face mark, team lockups, or Bear Down Bold —
  Athletics-only assets, never in a starter.
- No stock athlete photos. The hero is intentionally a triangles pattern.
- No heavy display weights (display elements ship `fw-bold` from AZ Bootstrap,
  rendered as 300/400). See [`/docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md).
- Do not put `COGNITO_CLIENT_SECRET` in any file that ships to the browser.
  SPAs use PKCE only.
- Do not move the inline pre-paint `<script>` below any `<link>`. It must run
  before the first paint.
- Do not write `@media (prefers-color-scheme: dark)` overrides. The tokens
  layer handles the flip via `[data-theme="dark"]` / `[data-bs-theme="dark"]`.

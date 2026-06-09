# @ua/template-html-bootstrap5

University of Arizona Athletics starter — **plain HTML5 + Arizona Bootstrap 5.1.3 (loaded via the official UA CDN) + vanilla JS**. No bundler, no framework, no build step.

In the monorepo, read [`AGENTS.md`](../../AGENTS.md) before changing anything.
In a standalone extraction, use the absolute GitHub docs linked below.

## Standalone quick start

Use this path when the folder was extracted with:
`bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/html-bootstrap5 my-site`.

```bash
cd my-site
bun install
bun run dev
```

The template vendors a minimal `@ua/ua-tokens` package at
`vendor/ua-tokens`, and `index.html` loads
`./vendor/ua-tokens/dist/tokens.css` directly. For the repo-wide rules, use the
GitHub docs:
[`AGENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/AGENTS.md),
[`docs/COMPONENTS.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/COMPONENTS.md),
and [`docs/DARK_MODE.md`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/blob/main/docs/DARK_MODE.md).

Project-specific sections should stay in `index.html` unless repetition
justifies a tiny include/preprocess layer. Keep new UI token-driven and reuse
the Header, Hero, Toolbar, Card, Footer, and ThemeToggle shapes.

## Monorepo quick start

```bash
cd templates/html-bootstrap5
bun run dev
# or directly:
python3 -m http.server 8080
```

Open <http://localhost:8080>. Edit any file and reload — there is nothing to rebuild.

## What you get

A single canonical page that demonstrates every UA Athletics surface in the spec:

1. **Arizona Header** — `.arizona-header.az-fixed-header-on-mobile.bg-red` with the wordmark loaded from the UA logo CDN and a Material-Symbols mobile menu trigger that opens an offcanvas drawer.
2. **Brand band** — white substrate with the Block A placeholder + "Arizona Athletics" lockup and a theme-toggle button (cycles system → light → dark).
3. **Site navbar** — `.navbar.navbar-expand-lg.bg-blue` with Football / Basketball / Baseball / Softball / All Sports / Shop.
4. **Hero** — `.background-wrapper.text-bg-red.bg-triangles-top-left` with the canonical "Bear Down. Build Up." headline, lead subhead, and two `.btn-outline-white.btn-lg` CTAs.
5. **Toolbar** — thin `.navbar.bg-warm-gray.border-bottom` row with Tickets · Schedule · Roster · News · Watch in small caps.
6. **Card grid** — three white `.card.border-0.shadow-sm.rounded-3` cards on `.bg-warm-gray` with red small-caps eyebrows ("From McKale", "From Arizona Stadium", "From the Desert") and `stretched-link` "Read story" CTAs.
7. **Footer** — five-column `.row.row-cols-1.row-cols-sm-2.row-cols-md-5.py-5.my-5.border-top` with Block A + address + Arizona Board of Regents copyright, Athletics links, Resources links, newsletter form with `.btn-red`, and a bottom legal strip with the `Bear Down® and Block A®` line plus Material-Symbols social icons.

## Stack

- **HTML5** — vanilla, no framework.
- **Arizona Bootstrap 5.1.3** — loaded from the official UA CDN. AZ Bootstrap is not on npm, so the CDN `<link>` and `<script>` tags are the canonical install:
  - CSS: `https://cdn.digital.arizona.edu/lib/arizona-bootstrap/5.1.3/css/arizona-bootstrap.min.css`
  - JS: `https://cdn.digital.arizona.edu/lib/arizona-bootstrap/5.1.3/js/arizona-bootstrap.bundle.min.js`
- **`@ua/ua-tokens`** — vendored at `vendor/ua-tokens`; `index.html` loads its committed `dist/tokens.css` snapshot directly.
- **Material Symbols Rounded** — Google Fonts CDN; used by the AZ header buttons and the social icon row in the footer.
- **Vanilla JS** — `theme.js` (FOUC-safe theme toggle, system-change listener, year stamp) and `auth.js` (Cognito + UA SAML PKCE scaffold, all values `// CONFIGURE_ME`).

## Files

| File                  | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `index.html`          | Canonical full-page layout. Header → brand band → navbar → hero → toolbar → cards → footer. |
| `styles.css`          | Project-local overrides. **Zero hex values** — Arizona Bootstrap + `@ua/ua-tokens` CSS vars only. |
| `theme.js`            | `[data-ua-theme-toggle]` cycle button + OS prefers-color-scheme listener + year stamp.  |
| `auth.js`             | Cognito + UA SAML PKCE scaffold. Every real value is `// CONFIGURE_ME`. No secrets.     |
| `package.json`        | Template metadata and Bun scripts: `dev` / `format` / `lint`. |
| `.env.example`        | Cognito placeholders. Copy to `.env` (gitignored) and fill in for your deployment.       |
| `.gitignore`          | `node_modules/`, `.env`, OS junk.                                                       |
| `public/block-a.svg`  | Placeholder Block A (96×96, white substrate, Arizona Blue block, Arizona Red serif). Swap for the licensed asset. |

## Swapping the Arizona Bootstrap CDN version

Edit two lines in `index.html`:

```html
<link rel="stylesheet" href="https://cdn.digital.arizona.edu/lib/arizona-bootstrap/<NEW_VERSION>/css/arizona-bootstrap.min.css" />
…
<script src="https://cdn.digital.arizona.edu/lib/arizona-bootstrap/<NEW_VERSION>/js/arizona-bootstrap.bundle.min.js" defer></script>
```

Then run `/ua-standards-check` to confirm the version is current per [`az-digital/arizona-bootstrap`](https://github.com/az-digital/arizona-bootstrap/releases). Don't bump the version without re-checking the AZ release notes for breaking class renames.

## Dark mode

- The pre-paint script is the first thing inside `<head>`, **before any `<link rel="stylesheet">`**. It reads `localStorage["ua-theme"]` and writes both `data-theme` and `data-bs-theme` on `<html>`. See [`/docs/DARK_MODE.md`](../../docs/DARK_MODE.md).
- Cycle order: **system → light → dark → system**.
- `tokens.css` handles `[data-theme="dark"], [data-bs-theme="dark"]` for you — do not add component-level dark overrides in `styles.css`.

## `// CONFIGURE_ME` checklist

These values are intentionally blank. Fill them in through your project's deployment process (UA IT engagement for Cognito; UA Marcom for Typekit). **Never** commit real values. See [`/docs/AUTH.md`](../../docs/AUTH.md) and [`/docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md).

| Where                                  | What                                                              |
| -------------------------------------- | ----------------------------------------------------------------- |
| `auth.js` → `config.region`            | AWS region of your Cognito User Pool.                             |
| `auth.js` → `config.cognitoDomain`     | Cognito hosted-UI subdomain.                                      |
| `auth.js` → `config.clientId`          | Cognito **public** app-client ID (SPA, PKCE — no client secret).  |
| `auth.js` → `config.samlProviderName`  | The SAML provider name registered in Cognito (e.g. `UAWebAuth`).  |
| `auth.js` → `config.redirectUri` / `logoutUri` | Must be registered on the Cognito app client.             |
| `index.html` Typekit `<link>`          | Currently commented out. Adding your kit ID requires UA Marcom clearance — email `web@arizona.edu` first. |
| `public/block-a.svg`                   | Replace with the official licensed Block A asset from UA Marcom.  |
| `.env.example`                         | Same values as above, in shell form. Copy to `.env` and fill in.  |

## Hard don'ts

- Do not hardcode hex values in `styles.css`. Use Arizona Bootstrap (`--bs-red`, `--bs-blue`, `--bs-warm-gray`, …) or `@ua/ua-tokens` (`--bg`, `--surface`, `--text`, `--accent`, …) CSS variables.
- Do not use Bootstrap's `btn-primary` for UA CTAs — use `.btn-red` / `.btn-blue` / `.btn-outline-white`, which Arizona Bootstrap re-maps to the UA palette.
- Do not write `@media (prefers-color-scheme: dark)` overrides. `tokens.css` handles the flip via the `data-theme` / `data-bs-theme` attributes.
- Do not put `COGNITO_CLIENT_SECRET` in any file that ships to the browser. SPAs use PKCE only.
- Do not move the inline pre-paint `<script>` below any `<link>`. It must run before the first paint.
- Do not ship Wilbur, the cat face, team lockups, or stock athlete photography in this starter — all Athletics-only licensed assets.
- Do not introduce maroon, gold, purple, or orange brand colors.

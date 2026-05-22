# @ua/template-hugo

University of Arizona Athletics starter — **Hugo** static-site generator wired to [`@ua/ua-tokens`](../../packages/ua-tokens) and [Arizona Bootstrap 5.1.3](https://digital.arizona.edu/arizona-bootstrap) (CDN).

For the full design-system contract (six components, hard don'ts, token discipline) read [`/AGENTS.md`](../../AGENTS.md) before changing anything. The canonical build spec lives in [`.claude/research/ua-design-spec-2026-05-22.md`](../../.claude/research/ua-design-spec-2026-05-22.md).

## Prereqs

- [Hugo extended](https://gohugo.io/installation/) **≥ 0.140.0**
  ```bash
  brew install hugo
  hugo version   # must include "extended"
  ```
- [Bun](https://bun.sh) ≥ 1.3 (workspace tooling — installs the `@ua/ua-tokens` link).

## Quick start

```bash
# from repo root
bun install

# mirror the compiled tokens.css snapshot into static/ for Hugo's pipeline
cd templates/hugo
bun run tokens:sync

# dev server (drafts on, live-reload)
bun run dev          # → http://localhost:1313

# production build
bun run build        # → ./public
```

`tokens:sync` copies `packages/ua-tokens/dist/tokens.css` into `static/css/tokens.css`. The file is in `.gitignore` — re-run the script after every token bump or `@ua/ua-tokens` build.

## Stack

- **Hugo extended** — no npm build step; Hugo's own pipeline handles CSS, JS, and assets in `/static`.
- **Arizona Bootstrap 5.1.3** via `cdn.digital.arizona.edu`. The version is pinned in `hugo.toml` under `[params].azBootstrapVersion` — the freshness audit (`/ua-standards-check`) checks this against the upstream release feed.
- **`@ua/ua-tokens`** — linked through the Bun workspace. The compiled CSS file is mirrored into `static/css/tokens.css` via `bun run tokens:sync` (Hugo's static pipeline cannot reach into `node_modules`).
- **Vanilla JS** — `static/js/theme.js` (FOUC-safe theme toggle) and `static/js/auth.js` (Cognito PKCE scaffold).

## Layout

```
templates/hugo/
├── hugo.toml                       # site config + [params]
├── config/_default/menus.yml       # main nav + secondary toolbar
├── content/
│   ├── _index.md                   # homepage frontmatter + hero/cards
│   └── news/                       # news section + three sample articles
├── layouts/
│   ├── _default/
│   │   ├── baseof.html             # <head> chrome + body shell
│   │   ├── single.html             # /news/<article>/
│   │   └── list.html               # /news/
│   ├── index.html                  # homepage — composes the 6 components
│   └── partials/
│       ├── header.html             # .arizona-header.bg-red + brand band + .navbar.bg-blue
│       ├── hero.html               # .background-wrapper.text-bg-red.bg-triangles-top-left
│       ├── toolbar.html            # Tickets · Schedule · Roster · News · Watch
│       ├── card.html               # white card on .bg-warm-gray
│       ├── footer.html             # 5-col footer + legal strip
│       └── theme-toggle.html       # light/dark cycle button
└── static/
    ├── block-a.svg                 # 96x96 placeholder — replace with licensed UA asset
    ├── css/
    │   ├── tokens.css              # mirrored from @ua/ua-tokens (gitignored)
    │   └── styles.css              # project overrides — zero hex values
    └── js/
        ├── theme.js                # theme cycle + system listener
        └── auth.js                 # Cognito + UA SAML PKCE scaffold
```

## Six-component checklist (per `/docs/COMPONENTS.md`)

- **Header** — `layouts/partials/header.html`. Canonical `.arizona-header.bg-red` with CDN wordmark + Block A brand band on opaque white substrate + `.navbar.navbar-expand-lg.bg-blue` primary nav from `site.Menus.main`.
- **Hero** — `layouts/partials/hero.html`. `.background-wrapper.text-bg-red.bg-triangles-top-left` with `display-2 fw-light` "Bear Down. Build Up." and `.btn-outline-white` CTAs. Pulls from page frontmatter or `site.Params.hero`.
- **Toolbar** — `layouts/partials/toolbar.html`. Thin `.navbar.bg-warm-gray` with Tickets · Schedule · Roster · News · Watch from `site.Menus.toolbar`.
- **Card** — `layouts/partials/card.html`. Reusable dict-accepting partial. White surface on a `.bg-warm-gray` section, `.shadow-sm.rounded-3`, red small-caps eyebrow.
- **Footer** — `layouts/partials/footer.html`. 5-column grid with Block A, link cols, newsletter form, social row, and legal strip ending with "Bear Down® and Block A® are registered trademarks of the Arizona Board of Regents."
- **ThemeToggle** — `layouts/partials/theme-toggle.html`. Cycle button (system → light → dark) wired by `static/js/theme.js`. Pre-paint script lives inline at the top of `<head>` in `baseof.html`.

## Dark mode

- Pre-paint script is the **first** child of `<head>` in `baseof.html`, before any `<link>`. Reads `localStorage["ua-theme"]`, writes both `data-theme` and `data-bs-theme` on `<html>`. See [`/docs/DARK_MODE.md`](../../docs/DARK_MODE.md).
- Cycle order: **system → light → dark → system**.
- `tokens.css` handles `[data-theme="dark"], [data-bs-theme="dark"]` — never add component-level dark overrides.

## `// CONFIGURE_ME` items

These values are intentionally blank. Fill them in via your project's deployment process — never commit real values. See [`/docs/AUTH.md`](../../docs/AUTH.md) for the engagement process.

| Where | What |
| ----- | ---- |
| `static/js/auth.js` → `config.region` | AWS region of your Cognito User Pool. |
| `static/js/auth.js` → `config.cognitoDomain` | Cognito hosted-UI subdomain. |
| `static/js/auth.js` → `config.clientId` | Cognito **public** app-client ID (SPA, PKCE — no client secret). |
| `static/js/auth.js` → `config.samlProviderName` | The SAML provider name registered in Cognito (e.g. `UAWebAuth`). |
| `static/js/auth.js` → `config.redirectUri` / `logoutUri` | Must be registered on the Cognito app client. |
| `.env.example` | Same values as above, in shell form. Copy to `.env` and fill in. |
| `hugo.toml` → `[params].typekitKitId` | Adobe Typekit kit ID for Proxima Nova + Garamond Premier Pro. Requires UA Marcom clearance — email `web@arizona.edu` first. See [`/docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md). |
| `static/block-a.svg` | Geometric placeholder. Replace with the approved UA Athletics Block A SVG from UA Marcom before production. |

## Hard don'ts

- Do not hardcode hex values in `styles.css`. Use semantic tokens (`--bg`, `--surface`, `--text`, `--accent`, ...). Brand tokens (`--ua-red`, `--ua-blue`) are reserved for one-off identity accents.
- Do not bake in Wilbur, the cat face, team lockups, or Bear Down Bold — Athletics-only, licensed per team.
- Do not write `@media (prefers-color-scheme: dark)` overrides. `tokens.css` handles the flip via `[data-theme="dark"]` / `[data-bs-theme="dark"]`.
- Do not put `COGNITO_CLIENT_SECRET` in any file that ships to the browser. SPAs use PKCE only.
- Do not move the inline pre-paint `<script>` below any `<link>`. It must run before the first paint.
- Do not pick npm/yarn/pnpm. Bun.

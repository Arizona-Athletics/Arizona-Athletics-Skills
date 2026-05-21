# Arizona Athletics Web Templates — Plan

A shared design system and a small fleet of starter templates so the team (and LLMs writing
code for the team) produce visually consistent, on-brand work whether the project is React,
Next.js, Astro, plain HTML+Bootstrap, HTML+Tailwind, or a Node/Express server-rendered app.

This document is the plan. Nothing in this repo is built yet.

---

## 1. Why

Two production apps already exist with similar-but-divergent designs:

- **`athletics-apps-home`** (private) — React + Vite + TS + Bootstrap 5. Has a working UA
  token system using `--ua-*` CSS variables plus a semantic layer (`--bg`, `--surface`,
  `--text`, `--text-muted`, `--border`). Light/dark via `[data-bs-theme]`.
- **`Arizona-Athletics/bear-down-lms`** (private) — Node + Express 5 + EJS + AZ Digital
  Bootstrap 5.1.3 (CDN). Richer `--az-*` token system with strict semantic separation, a
  brand-true dark theme built on Midnight + Arizona Blue (not GitHub gray), Typekit Proxima
  Nova, and a FOUC-safe 3-state theme toggle (light/dark/system).

When a developer or an LLM asks "build me a new Arizona Athletics app/page," they should
pull from one canonical place — not reverse-engineer either of the above. That place is
this repo.

---

## 2. Sources of truth

| Source | What it gives us |
|---|---|
| [marcom.arizona.edu](https://marcom.arizona.edu/applying-the-brand/colors) | Official UA palette, typography, voice. Primary: Arizona Red `#AB0520`, Arizona Blue `#0C234B`. Full complementary + accent palette below. |
| [`az-digital/arizona-bootstrap`](https://github.com/az-digital/arizona-bootstrap) v2.0.27 | UA-themed Bootstrap 5 fork. SCSS variables `$red, $blue, $bloom, $chili, $sky, $oasis, $azurite, $midnight, $cool-gray, $warm-gray, $leaf, $river, $silver, $dark-silver, $mesa, $ash, $sage` (each with 100–900 tints/shades). CDN at `cdn.digital.arizona.edu/lib/arizona-bootstrap/5.1.3/`. Includes `hugo_template.yml`. |
| [`az-digital/az_quickstart`](https://github.com/az-digital/az_quickstart) (Drupal 10) | UA's official Drupal CMS distribution — Arizona Quickstart 3.0. Bundles Arizona Bootstrap 5, Paragraphs, Layout Builder, accessibility defaults. The platform `arizona.edu` and most campus sites run on. |
| `athletics-apps-home` | Working React shell — Layout, Navbar, Hero, Toolbar, AppCard, Footer; `react-oidc-context` → Cognito auth pattern. |
| `bear-down-lms` | Working server-rendered shell — `az-header`, `az-nav`, theme toggle pre-paint script, full semantic-token system, brand-true dark mode; `openid-client` + `express-session` → Cognito (SAML→UA NetID) auth pattern. |
| [arizona.edu](https://arizona.edu) / [arizonawildcats.com](https://arizonawildcats.com) | High-level UX patterns: mega-menu, full-width hero, card grids, three-column footer, Block A placement. |
| Trellis Marketing Cloud (Salesforce) | UA's email platform. Limits available fonts (Calibri/Times alternates) and rules for the `email-html` template. |

---

## 3. Brand reference (canonical)

### Color palette

**Primary**

| Name | Hex |
|---|---|
| Arizona Red | `#AB0520` |
| Arizona Blue | `#0C234B` |

**Neutrals**

| Name | Hex |
|---|---|
| White | `#FFFFFF` |
| Warm Gray | `#F4EDE5` |
| Cool Gray | `#E2E9EB` |

**Complementary**

| Name | Hex |
|---|---|
| Midnight | `#001C48` |
| Azurite | `#1E5288` |
| Oasis | `#378DBD` |
| Chili | `#8B0015` |

**Accent (use sparingly)**

| Name | Hex |
|---|---|
| Bloom | `#EF4056` |
| Sky | `#81D3EB` |
| Leaf | `#70B865` |
| River | `#007D84` |
| Mesa | `#A95C42` |

### Typography

- **Sans (primary):** Proxima Nova — via Typekit, fall back to Calibri, system stack.
- **Serif:** Garamond Premier Pro — fall back to Garamond, Times New Roman, serif.
- Web body 12–16px; long-form 14–16px.

### Type scale (from bear-down-lms, adopted)

| Element | Size | Notes |
|---|---|---|
| h1 | 2.25rem | weight 700, letter-spacing -0.005em |
| h2 | 1.75rem | |
| h3 | 1.375rem | |
| h4 | 1.125rem | |
| h5 | 1rem | |
| h6 | 0.875rem | uppercase, letter-spacing 0.08em, muted color |

---

## 4. Token system (single source of truth)

**`packages/ua-tokens`** is the only place where colors, type, spacing, radii, and shadows
are defined. Every template consumes it.

### File layout

```
packages/ua-tokens/
├── package.json
├── tokens.json          # source of truth
├── build.ts             # emits the files below
└── dist/
    ├── tokens.css       # CSS variables — for React, HTML, anything
    ├── tokens.scss      # SCSS variables — matches az-digital/arizona-bootstrap names
    ├── tokens.ts        # TS object exports — for typed JS access
    └── tailwind.preset.cjs  # Tailwind preset
```

### CSS variable prefixes — ship BOTH as aliases

To avoid a migration tax on existing apps, the emitted `tokens.css` declares both prefixes:

```css
:root {
  /* Canonical: --ua-* */
  --ua-red:      #AB0520;
  --ua-blue:     #0C234B;
  --ua-midnight: #001C48;
  --ua-azurite:  #1E5288;
  --ua-oasis:    #378DBD;
  --ua-chili:    #8B0015;
  --ua-bloom:    #EF4056;
  --ua-sky:      #81D3EB;
  --ua-leaf:     #70B865;
  --ua-river:    #007D84;
  --ua-mesa:     #A95C42;
  --ua-warm-gray:#F4EDE5;
  --ua-cool-gray:#E2E9EB;

  /* Alias: --az-* (for bear-down-lms compatibility) */
  --az-red:      var(--ua-red);
  --az-blue:     var(--ua-blue);
  --az-midnight: var(--ua-midnight);
  /* …etc */

  /* Semantic layer — light */
  --bg:            #FAF8F4;
  --surface:       #FFFFFF;
  --surface-alt:   #F4EDE5;
  --surface-sunk:  #EFE9DF;
  --border:        #E2E9EB;
  --border-strong: #C9D2D7;
  --text:          #1A2740;
  --text-strong:   #0C234B;
  --text-muted:    #5A6577;
  --text-faint:    #8895A8;
  --link:          #1E5288;
  --link-hover:    #0C234B;
  --accent:        #AB0520;
  --accent-hover: #8B0015;
}

[data-theme="dark"], [data-bs-theme="dark"] {
  --bg:            #04122A;
  --surface:       #0C234B;
  --surface-alt:   #122E5E;
  --surface-sunk:  #061A37;
  --border:        #1B3A78;
  --border-strong: #2A4E94;
  --text:          #E8ECF4;
  --text-strong:   #FFFFFF;
  --text-muted:    #A6B5CC;
  --text-faint:    #7B8AA6;
  --link:          #81D3EB;
  --link-hover:    #B6E3F1;
  --accent:        #D8112D;
  --accent-hover:  #EF4056;
  color-scheme: dark;
}
```

> **Rule for contributors and LLMs:** use semantic tokens (`var(--text)`, `var(--surface)`,
> `var(--accent)`) in components. Brand tokens (`var(--ua-red)`, etc.) are for one-off
> brand moments only.

### SCSS emission

`dist/tokens.scss` mirrors `az-digital/arizona-bootstrap`'s names (`$red`, `$blue`,
`$azurite`, `$bloom`, etc.) so projects that prefer SCSS + AZ Bootstrap can drop the
package in without renaming anything.

### Tailwind preset

`dist/tailwind.preset.cjs` exposes the palette as `colors.ua.red`, `colors.ua.blue`, etc.
plus a `fontFamily.sans` / `fontFamily.serif` definition.

---

## 5. Toolchain baseline (May 2026)

Pinned versions every template should target unless noted:

| Tool | Version | Notes |
|---|---|---|
| **Bun** | 1.3.14 (May 12 2026) | **Standard package manager + script runner across every template.** Replaces npm/pnpm/yarn. (Anthropic acquired Bun, Dec 2025.) |
| **TypeScript** | 5.7.x strict | TS-only — no plain JS templates. |
| **Vite+** (`vp` CLI) | Preview, early-2026 | Used by the React-Vite template. CLI wraps Vite, Oxlint, Vitest, tsgo. **Preview product** — see §5.1 below for the fallback. |
| **React** | 19.2.x | Server Components + Actions stable. React Compiler stable in Next. |
| **Next.js** | 16.2.x | Turbopack default for `dev`/`build`. React Compiler stable. App Router only. |
| **Astro** | 6.x | Live content collections stable. Content Layer API. |
| **Tailwind CSS** | 4.3.0 | Oxide engine (Rust). CSS-first config — `@theme {}` in `app.css`, not `tailwind.config.js`. |
| **Express** | 5.2.1 | Async error handling improvements; ReDoS-safe routing. |
| **Bootstrap** | 5.3.x | Used by templates that want vanilla BS5. |
| **AZ Digital Bootstrap** | 5.1.3 | UA-themed; lags upstream BS 5.3 — documented constraint. CDN: `cdn.digital.arizona.edu/lib/arizona-bootstrap/5.1.3/`. |
| **Bootstrap Icons** | latest | Used by every Bootstrap-leaning template. |

> **Bun-first scripting.** All templates' `package.json` will assume `bun install`,
> `bun run dev`, `bun add`, `bun test`. The README documents `npm`/`pnpm` fallbacks but
> Bun is the path Engineering supports.

### 5.1 Vite+ (`vp`) — preview product, with a clean fallback

Vite+ is the unified `vp` CLI from VoidZero (still in preview, public preview targeted
early 2026). It wraps:
- `vp dev` / `vp build` — Vite under the hood, Turbopack-class speed.
- `vp check` — Oxlint (50–100× ESLint) + tsgo (type checks) + formatter, one pass.
- `vp test` — Vitest with browser mode.
- `vp run` — task runner with caching for monorepos.
- `vp pack` — library packaging with DTS.

Because Vite+ is still preview, each Vite-based template ships with **both** a `vp` script
and a plain `vite` fallback so the template works even if Vite+ isn't installed locally:

```json
{
  "scripts": {
    "dev":   "vp dev   || vite",
    "build": "vp build || vite build",
    "check": "vp check || (oxlint . && tsc --noEmit)",
    "test":  "vp test  || vitest"
  }
}
```

Install Vite+ (macOS/Linux): `curl -fsSL https://vite.plus | bash`.

---

## 6. Templates

Every template ships with:
- `@ua/ua-tokens` wired in.
- The same six components: `Header`, `Hero`, `Toolbar`, `Card`, `Footer`, `ThemeToggle`.
- Light/dark/system theme with FOUC-safe pre-paint (inline script in `<head>` before any CSS).
- An `AGENTS.md` LLM contract.
- A `README.md` with Bun-first quickstart.
- An `auth/` directory with a stubbed identity layer and clearly-commented hooks for
  Cognito + UA SAML federation. **No secrets, no real client IDs, no real pool IDs.**

### `templates/react-vite-plus/` (TypeScript, Vite+)

- React 19.2 + Vite 7 (driven by `vp`) + TS strict.
- Bootstrap 5.3 + Bootstrap Icons + `@ua/ua-tokens`.
- Optional AZ Digital Bootstrap layer behind a feature flag.
- Component layout mirrors `athletics-apps-home` with no business logic.
- Auth: `react-oidc-context` stub; doc explains the Cognito + UA SAML config shape.
- Scripts: `bun run dev` → `vp dev` (fallback `vite`).

### `templates/react-ts-lib/` (TypeScript, React library)

- A separate React+TS template optimised for **publishable component libraries**, not
  applications. Useful when teams want to extract shared UA components.
- Vite (library mode) + `vp pack` for DTS + Bun for packaging.
- No router, no app shell — just the component contract + Storybook-lite.
- Outputs ESM + CJS + `.d.ts`.

### `templates/nextjs-app-router/` (TypeScript)

- Next.js 16.2 + App Router + RSC + Turbopack (default).
- React Compiler enabled.
- Same six components, ported to server/client boundaries where it makes sense.
- Auth: `openid-client` route handler stub.
- Scripts: `bun run dev`.

### `templates/astro/` (TypeScript)

- Astro 6 + Content Collections 2.0 + MDX.
- `.astro` components with the same names/contract as the React templates.
- Good fit for content-heavy sites (handbooks, news, training material).
- Scripts: `bun run dev`.

### `templates/html-bootstrap5/` (plain HTML)

- Static `index.html`, `dashboard.html`, `content.html`.
- AZ Digital Bootstrap 5.1.3 via `cdn.digital.arizona.edu`.
- `assets/site.css` imports the token CSS plus app-specific tweaks.
- No build step required.

### `templates/html-tailwind/` (plain HTML + Tailwind 4)

- Tailwind CSS 4.3 (Oxide engine) — CSS-first config in `app.css` via `@theme {}`.
- Tokens come from `@ua/ua-tokens/dist/tailwind.preset.cjs`.
- No JS framework. Build via `bun run build` → `tailwindcss -i app.css -o dist.css`.

### `templates/node-express-ts/` (TypeScript)

- Express 5.2 + EJS + TS strict.
- Mirrors `bear-down-lms`'s shape: `src/server.ts`, `src/auth/`, `src/views/`,
  `src/public/css/`.
- Auth: `openid-client` + `express-session` stub for Cognito+SAML federation.
- Helmet, CSP nonce pattern, CSRF middleware.
- Scripts: `bun run dev` (using `bun --hot src/server.ts`).

### `templates/drupal-quickstart-subtheme/` (PHP / Drupal — Arizona Marcom standard)

- A subtheme starter for [Arizona Quickstart 3.0](https://github.com/az-digital/az_quickstart),
  UA's official Drupal distribution (maintained by Arizona Digital, used by `arizona.edu`
  and most campus sites).
- Bundles `@ua/ua-tokens/dist/tokens.css` as a Drupal library so a Quickstart site
  picks up the same semantic tokens as the React / Next / HTML templates.
- Twig overrides for the header/footer that match the `az-header` pattern from
  `bear-down-lms`.
- Composer install instructions only — no fork of Quickstart itself, just the subtheme
  + `composer.json` snippet that pulls Quickstart as a dependency.
- Bootstrap version: **Arizona Bootstrap 5.1.3** (whatever Quickstart pins; we follow).
- Auth: relies on Drupal's CAS/SAML modules — documented, not stubbed.

### `templates/hugo/` (Go templates — optional, low-priority)

- Static site generator option. `az-digital/arizona-bootstrap` ships a `hugo_template.yml`
  so the toolkit is already Hugo-aware.
- Good fit for fast brochure sites that don't need a CMS and don't want Astro's tooling.
- Bundles AZ Digital Bootstrap 5.1.3 + `@ua/ua-tokens` via partials.
- `bun run dev` proxies to `hugo server -D`.

### `templates/email-html/` (HTML email — Trellis-safe)

- MJML source compiled to inline-CSS HTML.
- **Constraint:** Trellis Marketing Cloud (UA's email platform via Salesforce) is the
  documented destination — colors limited to the UA-safe subset, Calibri as the font
  alternate (per `marcom.arizona.edu` typography rules).
- No JS, no web fonts in the output (Outlook compatibility).

---

## 7. Documentation

```
docs/
├── COLORS.md         # palette table, semantic mapping, AA-pair table
├── TYPOGRAPHY.md     # Proxima/Garamond + Typekit + fallback stacks + scale
├── COMPONENTS.md     # six-component contract — props, slots, accessibility
├── DARK_MODE.md      # navy-family approach, FOUC-safe pre-paint pattern
├── AUTH.md           # Cognito + UA SAML federation, sanitized examples
└── LLM_GUIDE.md      # do/don't, prompt patterns, anti-patterns
```

### What `AGENTS.md` covers (the LLM contract)

- **Use semantic tokens.** Never hardcode hex codes — `var(--text)` not `#1A2740`.
- **Brand tokens are accents.** Use `var(--ua-red)` for a CTA accent, not for body text.
- **Dark mode is brand-true.** Surfaces are Midnight/Arizona Blue — never GitHub gray.
- **Accessibility.** Body text on `--bg` must be `--text`. Sky/Bloom never used for text.
- **Pre-paint script first.** Always include the inline theme-script in `<head>` before
  any CSS to avoid FOUC.
- **Header pattern.** Red 4px top stripe → Arizona Blue background → Red 3px bottom
  border. Wordmark left, nav right.
- **Container max-width.** 1040px default unless the page needs full-bleed.
- **Focus ring.** 2px solid Oasis, 2px offset.

---

## 8. Build order

1. `packages/ua-tokens` — tokens.json + emitter + dist files.
2. `docs/` — written once, referenced by every template.
3. `templates/react-vite-plus` — port + clean shell from `athletics-apps-home`.
4. `templates/html-bootstrap5` — three static pages.
5. `templates/nextjs-app-router` — port components to App Router / RSC.
6. `templates/astro` — same components as `.astro`.
7. `templates/node-express-ts` — port shell from `bear-down-lms`.
8. `templates/html-tailwind` — Tailwind 4 + Oxide + token preset.
9. `templates/drupal-quickstart-subtheme` — subtheme + tokens library + composer instructions.
10. `templates/react-ts-lib`, `templates/hugo`, `templates/email-html` — last.

Each milestone lands as its own PR so it can be reviewed before the next starts.

---

## 9. Open questions / decisions deferred

- **Typekit kit ID.** `bear-down-lms` uses kit `emv3zbo`. We can use the same kit for
  templates if Marketing/MarComm clears it; otherwise document the swap.
- **`@ua/ua-tokens` publishing.** Private npm scope (GitHub Packages) vs. just pinning to
  the GitHub URL. Probably GitHub Packages.
- **Auth in templates.** Stubbed by default; Cognito wiring lives in `docs/AUTH.md` and a
  commented `// CONFIGURE_ME` block. No client IDs or secrets in the repo.
- **Component library packaging.** If `Header/Hero/Card/...` proves stable, eventually
  extract into `packages/ua-react` and `packages/ua-html` so templates re-export rather
  than duplicate. Defer until two templates have shipped.

---

## 10. Not in scope

- Visual redesign. We're consolidating existing brand work, not changing it.
- Migrating `athletics-apps-home` or `bear-down-lms` onto the new tokens. Those moves
  happen later, app by app, after the token package is stable.
- Backend frameworks beyond Node/Express. Add Python/Flask or .NET only if there's
  concrete demand.

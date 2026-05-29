# @ua/ua-tokens

Single source of truth for **University of Arizona Athletics** design tokens.

One `tokens.json` → CSS, SCSS, TypeScript, and a Tailwind preset. Every template in
this repo (React, Next, Astro, Bootstrap, Tailwind, Drupal subtheme, Hugo, email)
consumes from here. **Do not hand-edit `dist/`.**

## Install

```bash
bun add @ua/ua-tokens
# or, inside this monorepo, it's already a workspace dependency
```

## Use it

### Plain HTML / Bootstrap

```html
<link rel="stylesheet" href="node_modules/@ua/ua-tokens/dist/tokens.css" />
```

Gives you:

- `--ua-red`, `--ua-blue`, `--ua-midnight`, … (canonical brand tokens)
- `--az-red`, `--az-blue`, … (aliases for `az-digital/arizona-bootstrap` compatibility)
- `--bg`, `--surface`, `--text`, `--text-strong`, `--text-muted`, `--border`, `--link`,
  `--accent`, `--focus-ring`, … (semantic tokens — use these for everything except one-off accents)
- Typography (`--font-sans`, `--font-serif`, `--font-size-h1`, `--font-weight-bold`, …)
- Spacing scale (`--space-1` … `--space-12`), radii, shadows, container widths
- Dark mode via `[data-theme="dark"]` **or** `[data-bs-theme="dark"]` — both supported

### SCSS (AZ Digital Bootstrap subtheme)

```scss
@use "@ua/ua-tokens/tokens.scss" as ua;

$primary: ua.$red;
$secondary: ua.$blue;
```

Variable names match `az-digital/arizona-bootstrap` so existing SCSS partials work
without rewrites.

### TypeScript / JavaScript

```ts
import { tokens, type BrandToken, type SemanticToken } from "@ua/ua-tokens";

tokens.brand.red;                  // "#AB0520"
tokens.semantic.light.accent;      // "#AB0520"
tokens.semantic.dark.surface;      // "#0C234B"
```

### Tailwind

```js
// tailwind.config.js
import preset from "@ua/ua-tokens/tailwind";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx,html}"],
};
```

Use `bg-ua-red`, `text-semantic-text-muted`, `border-semantic-border`, etc. The
`semantic.*` colors resolve through CSS variables, so dark mode just works.

## Brand layer vs semantic layer

Two layers, by design:

| Layer | Prefix | Use for |
| --- | --- | --- |
| **Brand** | `--ua-*` / `tokens.brand` | One-off accents tied to UA identity — Bloom CTA, Sky highlight, Mesa illustration tint |
| **Semantic** | `--bg`, `--text`, `--accent`, … / `tokens.semantic.*` | Everything else — body text, surfaces, borders, links. **This is what theming switches.** |

If you find yourself writing `color: var(--ua-blue)` in a component, you probably want
`color: var(--text-strong)` instead.

## Dark mode

The dark theme is **brand-true navy** (Midnight `#04122A` background, Arizona Blue
`#0C234B` surfaces) — not GitHub gray. See [`../../docs/DARK_MODE.md`](../../docs/DARK_MODE.md)
for the FOUC-safe pre-paint script every template ships.

## Build

```bash
bun install
bun run build       # emits dist/
bun run check       # tsc --noEmit
bun run clean
```

`build.ts` is a pure Bun script with no external deps. It:

1. Reads `tokens.json`
2. Emits `dist/tokens.css`, `dist/tokens.scss`, `dist/tokens.ts`, `dist/tokens.js`
   (ESM), `dist/tokens.cjs` (CJS), `dist/tokens.d.ts`, and `dist/tailwind.preset.cjs`
3. Runs sanity checks (verifies `--ua-red` resolves, dark block exists, Tailwind
   preset is requireable, etc.)

If you change `tokens.json`, run `bun run build` and commit `dist/`. The dist
snapshot is checked in so downstream templates don't need a build step to consume it.

## Versioning

- **Patch** — color hex tweak, new alias
- **Minor** — new token added, no removals
- **Major** — token removed or renamed (will break templates — coordinate)

## Sources reconciled

- [`Arizona-Athletics/bear-down-lms`](https://github.com/Arizona-Athletics/bear-down-lms) — `--az-*` token system, navy dark theme, FOUC-safe toggle
- [`athletics-apps-home`](../../../athletics-apps-home) — `--ua-*` Bootstrap-themed React app
- [`az-digital/arizona-bootstrap`](https://github.com/az-digital/arizona-bootstrap) — official UA Marcom Bootstrap fork
- [`az-digital/az_quickstart`](https://github.com/az-digital/az_quickstart) — Arizona Quickstart 3 Drupal CMS
- [marcom.arizona.edu](https://marcom.arizona.edu/) — UA brand standards

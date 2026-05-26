# arizona-athletics-web-templates

Shared design system and starter templates for **University of Arizona Athletics** web
projects. One source of truth, many templates — so a developer (or an LLM) writing a
new UA Athletics site produces on-brand work whether the target is React, Next, Astro,
HTML + Bootstrap, HTML + Tailwind, Node/Express, a Drupal Quickstart subtheme, Hugo,
or transactional email.

## Status

The token package, the design-system docs, and all nine starter templates are in
place. See [`PLAN.md`](./PLAN.md) for the full roadmap.

## What's here

- [`packages/ua-tokens`](./packages/ua-tokens) — single source of truth. Compiles
  `tokens.json` to CSS variables, SCSS variables, a TypeScript object, and a Tailwind
  preset. Both `--ua-*` (canonical) and `--az-*` (alias for AZ Digital Bootstrap
  compatibility) ship.
- [`docs/`](./docs) — the design system:
  - [`COLORS.md`](./docs/COLORS.md) — palette, semantic mapping, AA contrast pairs
  - [`TYPOGRAPHY.md`](./docs/TYPOGRAPHY.md) — fonts, type scale, Typekit
  - [`COMPONENTS.md`](./docs/COMPONENTS.md) — six-component cross-template contract
  - [`DARK_MODE.md`](./docs/DARK_MODE.md) — brand-true navy + FOUC-safe theme script
  - [`AUTH.md`](./docs/AUTH.md) — Cognito + UA SAML federation shape (no secrets)
  - [`LLM_GUIDE.md`](./docs/LLM_GUIDE.md) — do/don't list for AI coding assistants
- [`BRAND.md`](./BRAND.md) — palette + type tables at a glance
- [`AGENTS.md`](./AGENTS.md) — condensed contract for LLMs and agentic tools
- [`PLAN.md`](./PLAN.md) — long-form rationale and roadmap

## Templates

Nine starter templates live in [`templates/`](./templates):

```
templates/
├── react-vite-plus            # React 19 + Vite+ + TS
├── html-bootstrap5            # vanilla HTML + Bootstrap 5.3
├── drupal-quickstart-subtheme # Arizona Quickstart 3 subtheme (Marcom standard)
├── nextjs-app-router          # Next 16 + App Router + Turbopack
├── astro                      # Astro 6
├── node-express-ts            # Express 5 + TS + EJS
├── html-tailwind              # vanilla HTML + Tailwind 4
├── hugo                       # static site
└── email-html                 # transactional email (MJML)
```

### Pull a template

Each template is self-contained. Scaffold a new project straight from GitHub with
[`giget`](https://github.com/unjs/giget) — no clone, no monorepo checkout:

```bash
bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/<slug> my-app
```

Replace `<slug>` with one of: `astro`, `drupal-quickstart-subtheme`, `email-html`,
`html-bootstrap5`, `html-tailwind`, `hugo`, `nextjs-app-router`, `node-express-ts`,
`react-vite-plus`.

## Quick start

```bash
bun install
bun run build       # builds @ua/ua-tokens → packages/ua-tokens/dist
```

Use the tokens in any project:

```html
<!-- Vanilla HTML -->
<link rel="stylesheet" href="node_modules/@ua/ua-tokens/dist/tokens.css">
```

```ts
// TypeScript
import { tokens } from "@ua/ua-tokens";
tokens.semantic.light.accent; // "#AB0520"
```

```scss
// SCSS (AZ Digital Bootstrap subtheme)
@use "@ua/ua-tokens/tokens.scss" as ua;
$primary: ua.$red;
```

```js
// Tailwind
import preset from "@ua/ua-tokens/tailwind";
export default { presets: [preset], content: ["./src/**/*.{ts,tsx,html}"] };
```

## The rule

> Consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to **semantic**
> tokens (`--bg`, `--surface`, `--text`, `--accent`); reach for **brand** tokens
> (`--ua-red`, `--ua-blue`) only for one-off identity accents.

See [`AGENTS.md`](./AGENTS.md) for the short version, [`docs/LLM_GUIDE.md`](./docs/LLM_GUIDE.md)
for the do/don't list.

## Toolchain

- **Bun** 1.3.14 (workspaces, installs, scripts)
- **TypeScript** 5.7 strict
- **React** 19.2 · **Next** 16.2 · **Astro** 6 · **Tailwind** 4.3 (Oxide) ·
  **Express** 5.2 · **Bootstrap** 5.3 · **AZ Digital Bootstrap** 5.1.3 ·
  **Arizona Quickstart** 3
- **Vite+** for React templates

## License

MIT. See [`LICENSE`](./LICENSE) (forthcoming).

## Maintainers

University of Arizona Athletics · Web team

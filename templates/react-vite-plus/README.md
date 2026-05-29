# @ua/template-react-vite-plus

University of Arizona Athletics starter — **React 19 + Vite+ + Arizona Bootstrap
(`@az-digital/arizona-bootstrap`)** wired to `@ua/ua-tokens`. Implements all six shared components from
[`../../docs/COMPONENTS.md`](../../docs/COMPONENTS.md) on a single demo page
that renders correctly in both light and dark mode out of the box.

In the monorepo, relative docs links resolve against the repo root. In a
standalone extraction, use the absolute GitHub docs linked below.

This template is a **scaffold**, not a finished site. The placeholder
content, demo cards, and `// CONFIGURE_ME` markers are there for the human
or LLM landing on a fresh clone — wire them up, then delete them.

## Standalone quick start

Use this path when the folder was extracted with:
`bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/react-vite-plus my-site`.

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
bun --filter @ua/template-react-vite-plus run dev
```

The dev server runs at <http://localhost:5173> (Vite+ default).

Other scripts:

| Script    | What it does                              |
| --------- | ----------------------------------------- |
| `dev`     | `vp dev` — Vite+ dev server + HMR         |
| `build`   | `vp build` — production build to `dist/`  |
| `preview` | `vp preview` — serve the built bundle     |
| `check`   | `tsc --noEmit` — TypeScript check         |

## The contract

Everything in this template flows from three places. Read them in order:

1. [`../../AGENTS.md`](../../AGENTS.md) — the repo-wide LLM contract
2. [`../../docs/COMPONENTS.md`](../../docs/COMPONENTS.md) — the six-component spec
3. [`../../docs/DARK_MODE.md`](../../docs/DARK_MODE.md) — the FOUC-safe theme bootstrap

## Where the six components live

| Component     | Path                                     |
| ------------- | ---------------------------------------- |
| `Header`      | `src/components/Header.tsx`              |
| `Hero`        | `src/components/Hero.tsx`                |
| `Toolbar`     | `src/components/Toolbar.tsx`             |
| `Card`        | `src/components/Card.tsx`                |
| `Footer`      | `src/components/Footer.tsx`              |
| `ThemeToggle` | `src/components/ThemeToggle.tsx`         |

All six are composed in `src/App.tsx` for the demo homepage.

## Tokens, not hex

Component code uses **canonical Arizona Bootstrap class names** (`.bg-red`,
`.bg-blue`, `.bg-warm-gray`, `.btn-red`, `.btn-outline-white`, `.display-2`,
`.lead`, `.background-wrapper`, `.bg-triangles-top-left`, etc.) and reaches
into CSS custom properties from `@ua/ua-tokens` (`var(--surface)`,
`var(--accent)`) only when extending Bootstrap. Never raw hex in component
files. Dark mode flips automatically via `[data-bs-theme="dark"]` on `<html>`.

If you find yourself reaching for `var(--ua-red)` for body text, you want
`var(--text-strong)` instead. See [`../../docs/COLORS.md`](../../docs/COLORS.md).

## Dark mode

- A FOUC-safe pre-paint script in `index.html` resolves the saved or system
  preference before the first stylesheet evaluates, setting `data-bs-theme`
  and `data-theme` on `<html>`. See
  [`../../docs/DARK_MODE.md`](../../docs/DARK_MODE.md).
- The `ThemeToggle` cycles `system → light → dark → system` and persists the
  selected mode to `localStorage["ua-theme"]`.

## Things to configure before shipping (`// CONFIGURE_ME`)

Search the project for `CONFIGURE_ME` — every match is a UA-specific value
the human must fill in. Highlights:

- **Block A / wordmark assets** — `src/components/Header.tsx`, `src/components/Footer.tsx`
  (placeholder "A" badges). Replace with the official UA Marcom SVGs.
- **Typekit kit ID** — `index.html` (commented `<link>`) and
  `.env.example` (`VITE_TYPEKIT_KIT_ID`). Email **web@arizona.edu** before
  pointing a new domain at the shared kit.
- **Cognito IDs and SAML provider name** — `.env.example` and read in
  `src/lib/auth.ts`. Obtain via the UA IT engagement process; see
  [`../../docs/AUTH.md`](../../docs/AUTH.md).
- **Nav, filters, footer columns, social URLs** — `src/App.tsx`. Demo
  placeholders only.
- **Card media** — `src/App.tsx` uses `https://placehold.co/...`. Swap for
  real, alt-described photography.
- **Privacy / Accessibility URLs** — `src/components/Footer.tsx`. Point at
  the project's hosted pages.

## Auth (scaffold only)

`src/lib/auth.ts` ships a PKCE scaffold: the config shape, code-verifier and
S256 challenge helpers, an authorize-URL builder, and a logout-URL builder.
The token exchange itself is intentionally a `TODO` — every project's error
handling and token-storage decisions need a human eye. See
[`../../docs/AUTH.md`](../../docs/AUTH.md) for the full flow shape.

**SPAs use PKCE. Never put `COGNITO_CLIENT_SECRET` in any file in this
template.** If you need a confidential client, you want the Next.js or
Express templates instead.

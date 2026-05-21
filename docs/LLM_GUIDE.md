# LLM Guide — UA Athletics Web Templates

If you are an LLM writing code for a UA Athletics web project (Claude, GPT, Copilot, Cursor, or any other assistant), **read this first**. This is the do/don't list for the `arizona-athletics-web-templates` repo — the one canonical place a React app, a Drupal subtheme, and a Bootstrap HTML page all pull UA Athletics design language from. The full specs live in the sibling docs (`COLORS.md`, `TYPOGRAPHY.md`, `COMPONENTS.md`, `DARK_MODE.md`, `AUTH.md`). This file is the short brief you load before touching code.

---

## The one-line rule

> **Always consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to semantic tokens; reach for brand tokens only for one-off identity accents.**

If you follow that single sentence, 90% of the bugs in this section never happen.

---

## Quick-start decision tree

Common decisions, with the answer up front:

- **Which font?** → `var(--font-sans)` (Proxima Nova stack). Use the serif (`var(--font-serif)`, Garamond Premier Pro) only for editorial / long-form. Mono is `var(--font-mono)` (system).
- **What color for body text?** → `var(--text)`. For headlines / strong UI text, `var(--text-strong)`. For secondary copy, `var(--text-muted)`.
- **What color for a button background?** → `var(--accent)`. Hover state → `var(--accent-hover)`. Text on accent → `var(--on-accent)`.
- **What color for a card background?** → `var(--surface)`. Page background is `var(--bg)`. Card border is `var(--border)`.
- **What color for a link?** → `var(--link)` default, `var(--link-hover)` on hover. Don't override with brand red directly.
- **How do I do dark mode?** → **You don't write any dark-mode CSS.** Use semantic tokens; they flip automatically when `[data-theme="dark"]` (or `[data-bs-theme="dark"]`) is set on `<html>`.
- **Where do I get the Block A logo?** → `// CONFIGURE_ME` — every template ships a placeholder. Do **not** invent an SVG path or download from a guessed URL. Ask the human for the asset.
- **Which template should I use?**
  - React app → `templates/react-vite-plus`
  - Marketing / static page → `templates/html-bootstrap5`
  - Drupal site → `templates/drupal-quickstart-subtheme`
  - Long-form / editorial content → `templates/astro`
  - API or SSR app → `templates/nextjs-app-router` or `templates/node-express-ts`

If your question isn't on this list, check the sibling doc for that topic before guessing.

---

## Do

- **DO** import tokens from `@ua/ua-tokens` — pick the artifact the template uses (CSS variables via `tokens.css`, Tailwind preset via `ua-preset`, or the typed TS object via `tokens.ts`). All three are generated from the same `tokens.json`.
- **DO** use **semantic tokens** (`--bg`, `--surface`, `--text`, `--text-strong`, `--text-muted`, `--border`, `--link`, `--accent`, `--accent-hover`, `--on-accent`) for everything structural. Brand tokens (`--ua-red`, `--ua-blue`, `--ua-navy`, `--ua-bloom`, `--ua-chili`, `--ua-sky`, `--ua-oasis`, `--ua-leaf`, `--ua-river`, `--ua-mesa`, `--ua-warm-gray`, etc.) are for one-off identity accents only.
- **DO** use the six shared components — **Header, Hero, Toolbar, Card, Footer, ThemeToggle** — as the skeleton of every page. See `COMPONENTS.md` for the prop contracts.
- **DO** ship a **FOUC-safe pre-paint theme script** in `<head>` so the page renders in the right theme on first paint. See `DARK_MODE.md` for the exact snippet.
- **DO** use **TypeScript** across all JS templates (`.ts` / `.tsx`). No new `.js` files in JS templates without a reason.
- **DO** use **Bun** as the package manager and script runner. `bun install`, `bun run`, `bun x`. Lockfile is `bun.lockb`.
- **DO** mark every configurable value (logo path, school name override, social URLs, Cognito IDs, analytics keys, contact info) with a `// CONFIGURE_ME` comment so the next dev (or the next LLM) sees the seam immediately.
- **DO** read the sibling docs before assuming a pattern — `COLORS.md`, `TYPOGRAPHY.md`, `COMPONENTS.md`, `DARK_MODE.md`, `AUTH.md`. They are short on purpose.
- **DO** test **both light and dark** before claiming a feature is done. Toggle `[data-theme="dark"]` on `<html>` in devtools and walk the page.
- **DO** use UA SAML federation via Cognito for auth on any UA-staff-facing surface. See `AUTH.md` for the federation flow and the `// CONFIGURE_ME` IDs.
- **DO** prefer **Tailwind (Oxide engine) with the UA preset** for new JS templates, or **vanilla CSS reading from `tokens.css`** for HTML / Drupal / Astro. Both end up consuming the same variables.
- **DO** keep both `--ua-*` and `--az-*` prefixes shipping side-by-side — the `--az-*` aliases exist for `az-digital/arizona-bootstrap` interop and are not deprecated.

---

## Don't

- **DON'T** hardcode hex values like `#AB0520`, `#0C234B`, `#1E5288`, or `#FAF8F4`. Use `var(--ua-red)` or — better — the semantic token that names the role (`var(--accent)`, `var(--bg)`, etc.).
- **DON'T** pick fonts not in the stack. The stack is **Proxima Nova** (sans), **Garamond Premier Pro** (serif), **system mono**. That's it. No Inter, no Roboto, no Open Sans, no Helvetica fallback shimmed in by hand.
- **DON'T** write a "dark mode override" block. Semantic tokens already handle the flip. If something looks wrong in dark mode, the bug is almost always that you reached for a **brand** token (or a raw hex) where a **semantic** one was needed.
- **DON'T** use Tailwind's default gray scale — no `bg-gray-900`, `text-slate-500`, `border-zinc-200`, etc. Use the UA preset's `bg-semantic-bg`, `bg-semantic-surface`, `text-semantic-text`, `text-semantic-text-muted`, `border-semantic-border`, `bg-semantic-accent`, etc.
- **DON'T** invent component names. There are **six**: Header, Hero, Toolbar, Card, Footer, ThemeToggle. Use them. Compose with them. Build a new component only when none of the six fit, and even then check `COMPONENTS.md` first.
- **DON'T** import the dark palette directly. `tokens.semantic.dark.bg` is not a thing component code should reference. The toggle flips semantics under the hood; you read `var(--bg)` and let CSS do the work.
- **DON'T** put `COGNITO_CLIENT_SECRET`, `AWS_SECRET_ACCESS_KEY`, or any secret in client-side code, in a public env file, or in a committed `.env`. See `AUTH.md` for the server-side handoff pattern.
- **DON'T** add a "We" / "Our team" / "Bear Down" editorial voice to UA Athletics pages without checking copy with UA Marcom. This repo provides the **visual** contract, not the editorial voice.
- **DON'T** pick npm, yarn, or pnpm. Use **Bun**. If a tool genuinely doesn't support Bun, flag it for the human; don't silently switch package managers.
- **DON'T** reach for CSS Modules, styled-components, Emotion, vanilla-extract, or Stitches for new templates without a strong, stated reason. The default is **Tailwind (Oxide) with the UA preset** or **vanilla CSS reading from `tokens.css`**.
- **DON'T** migrate `--az-*` variables to `--ua-*` inside an existing app without an explicit task to do so. Both prefixes ship as aliases on purpose — silently rewriting them breaks downstream consumers.
- **DON'T** write a `README.md` for every subdirectory unless asked. The docs in `/docs` are canonical; per-folder READMEs drift.
- **DON'T** guess UA brand assets — Block A SVG, wordmark, athletic mark, sport-specific marks, official photography. If it isn't in the repo, ask.

---

## Common LLM mistakes and how to spot them

Three pairs. If your diff looks like the left-hand side, rewrite it as the right-hand side.

### 1. Hardcoded colors that won't flip in dark

```css
/* wrong — hardcoded, won't flip in dark */
.card {
  background: white;
  color: #1a2740;
  border: 1px solid #e5e7eb;
}

/* right — semantic tokens, flips automatically */
.card {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}
```

### 2. Tailwind gray scale instead of the UA preset

```tsx
// wrong — Tailwind's gray scale, not UA, dies in dark mode
<div className="bg-gray-50 text-gray-700 border border-gray-200">
  …
</div>

// right — UA semantic utilities from the preset
<div className="bg-semantic-bg text-semantic-text border border-semantic-border">
  …
</div>
```

### 3. Manual dark-mode branching in JS

```ts
// wrong — branching on theme in component code
const bg = theme === "dark" ? "#04122A" : "#FAF8F4";
const fg = theme === "dark" ? "#F4F1EA" : "#1A2740";

// right — semantic token; the CSS layer handles the flip
const bg = "var(--bg)";
const fg = "var(--text)";
```

### 4. Reaching for a brand token where a semantic one belongs

```css
/* wrong — locks the button to red even when the page theme says otherwise */
.btn-primary {
  background: var(--ua-red);
  color: white;
}

/* right — accent role; theme can rebalance without touching this rule */
.btn-primary {
  background: var(--accent);
  color: var(--on-accent);
}
.btn-primary:hover {
  background: var(--accent-hover);
}
```

### 5. Inventing a logo path

```tsx
// wrong — fabricated asset path, will 404
<img src="/assets/ua-block-a.svg" alt="Arizona" />

// right — placeholder, flagged for the human to wire up
// CONFIGURE_ME: replace with the official Block A SVG from UA Marcom
<img src={BLOCK_A_PLACEHOLDER} alt="Arizona" />
```

---

## When you're stuck

Route to the right doc, then ask the human if it isn't covered:

- **Color question?** → `COLORS.md` (brand palette, semantic roles, light/dark mappings, `--ua-*` / `--az-*` alias table)
- **Type question?** → `TYPOGRAPHY.md` (font stack, scale, weights, line-heights, when to use serif)
- **Component shape, props, or slots?** → `COMPONENTS.md` (Header, Hero, Toolbar, Card, Footer, ThemeToggle)
- **Dark mode behavior, toggle wiring, FOUC script?** → `DARK_MODE.md`
- **Auth, SAML, Cognito, federation, redirect URIs?** → `AUTH.md`
- **Anything not covered above?** → **Ask the human.** Don't guess UA-specific identifiers, logo paths, contact info, social URLs, Cognito IDs, or any value that has to match a real-world system.

---

## Close

Consume from `@ua/ua-tokens`. Default to **semantic** tokens (`--bg`, `--surface`, `--text`, `--text-strong`, `--text-muted`, `--border`, `--link`, `--accent`, `--accent-hover`, `--on-accent`) and only reach for **brand** tokens (`--ua-red`, `--ua-blue`, etc.) for deliberate identity accents. Build pages from the six shared components — Header, Hero, Toolbar, Card, Footer, ThemeToggle. Ship a FOUC-safe pre-paint theme script. Never hardcode UA colors, fonts, or assets. If you do those five things, your code looks like UA Athletics across every template in this repo — and it stays that way the next time the brand evolves.

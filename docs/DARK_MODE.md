# Dark Mode

University of Arizona Athletics dark mode is **brand-true navy**, not generic gray. The background is `#04122A` (deeper than Midnight, designed to sit beneath Arizona Blue surfaces); the canonical surface is Arizona Blue `#0C234B`; and accents brighten so they read on dark navy. This matches the dark theme shipped in `bear-down-lms` and is the standard for every UA Athletics template in this repo.

## Why brand-true navy, not gray

UA's visual identity is navy and red. A neutral gray dark theme would dilute that identity on every page that opts in. By grounding dark mode in Midnight (`#001C48`) and Arizona Blue (`#0C234B`), the dark experience stays unmistakably Arizona — the same brand on a dark canvas, not a different product. Gray is a safe default for product UIs without a strong identity; UA Athletics has a strong identity, so we lean into it.

The accent color also shifts: Arizona Red (`#AB0520`) is too dark to read on navy, so we use a brighter red (`#D8112D`) in dark mode, with a brighter step (`#DE1F3C`) for hover — bright enough to read as hover while keeping white labels AA. Links use Sky (`#81D3EB`) so they pop against the deep navy without competing with the red accent.

## The three states

Dark mode has three user-facing states:

| State | Behavior |
| --- | --- |
| `system` (default) | Resolve to light or dark at load time based on `prefers-color-scheme`. |
| `light` | Force light, regardless of OS. |
| `dark` | Force dark, regardless of OS. |

The user's choice is persisted to `localStorage` under the key `ua-theme` with one of three string values: `"system"`, `"light"`, or `"dark"`. If the key is missing, the app behaves as if the value is `"system"`.

## How the toggle is keyed

Dark mode is activated by setting one of two attributes on the `<html>` element:

- `<html data-theme="dark">` — the canonical attribute, used by generic HTML, React, Astro, Next, Drupal Twig, and Hugo templates.
- `<html data-bs-theme="dark">` — the attribute used by AZ Digital's Bootstrap distribution. We respect it so Bootstrap-based UA apps keep their existing selector.

`tokens.css` ships a single combined selector so either attribute works:

```css
[data-theme="dark"],
[data-bs-theme="dark"] {
  --bg: #04122A;
  --surface: #0C234B;
  /* ...etc */
  color-scheme: dark;
}
```

In practice, the bootstrap script below sets **both** attributes at once. That way a Bootstrap-aware component and a token-aware component on the same page agree on the current theme without either having to know about the other.

### Why we don't use `@media (prefers-color-scheme: dark)` in `tokens.css`

It is tempting to put the dark palette inside `@media (prefers-color-scheme: dark)` and skip JavaScript entirely. We don't, because:

1. The user can override the OS with `light` or `dark`. A pure-CSS approach can't honor that override.
2. SSR'd HTML needs a predictable, attribute-driven state so server-rendered markup matches client paint.

Instead, the bootstrap script **resolves** `system → light | dark` synchronously at load and writes the resolved value to `data-theme` / `data-bs-theme`. The CSS only ever needs to look at the attribute. This keeps server-rendered HTML predictable and keeps the dark-mode override behavior under our control.

## The FOUC-safe pre-paint script

This is the most important script in the whole design system. It must be inlined in `<head>`, **before any stylesheet link or import**, so it runs and sets the theme attribute before the browser's first paint. If it runs late, users see a white flash on every dark-mode page load.

```html
<!-- UA Athletics theme bootstrap — must run BEFORE any stylesheet -->
<script>
  (function () {
    try {
      var stored = localStorage.getItem("ua-theme");
      var mode = stored || "system";
      var resolved = mode === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : mode;
      var html = document.documentElement;
      html.dataset.theme = resolved;
      html.dataset.bsTheme = resolved;
      html.dataset.themeMode = mode;
    } catch (e) {
      document.documentElement.dataset.theme = "light";
    }
  })();
</script>
```

Line by line:

- `var stored = localStorage.getItem("ua-theme");` — pull the persisted choice. May be `null` if the user has never toggled.
- `var mode = stored || "system";` — fall back to `system` when there's no stored value.
- `var resolved = mode === "system" ? ... : mode;` — resolve `system` to a concrete `light` or `dark` by asking the OS. Forced modes pass through unchanged.
- `html.dataset.theme = resolved;` — set the canonical attribute that `tokens.css` reads.
- `html.dataset.bsTheme = resolved;` — set the Bootstrap attribute so AZ Digital Bootstrap components on the same page agree.
- `html.dataset.themeMode = mode;` — record the **mode** (`system | light | dark`) separately from the **resolved** value. The toggle UI needs this to render the correct active state; the system-change listener (below) needs it to know whether to re-resolve.
- The `try/catch` guards against private-mode browsers where `localStorage` access throws. On failure, we land on light — UA's default — instead of crashing the boot.

The script is intentionally written in ES5 with `var` and no arrow functions so it parses on any browser without a transpile step. Don't "modernize" it.

## Reacting to system changes

If the user is in `system` mode and toggles dark mode in macOS or Windows while the tab is open, the page should follow. Add this listener once the app has hydrated — typically inside the `ThemeToggle` component or a top-level theme provider:

```ts
const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener("change", (e) => {
  if (document.documentElement.dataset.themeMode !== "system") return;
  const resolved = e.matches ? "dark" : "light";
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.bsTheme = resolved;
});
```

The early return is critical: if the user has explicitly chosen `light` or `dark`, we honor that and ignore OS-level changes until they switch back to `system`.

## Setting the theme from the toggle

The canonical setter the `ThemeToggle` component calls:

```ts
function setTheme(mode: "system" | "light" | "dark") {
  const resolved = mode === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : mode;
  const html = document.documentElement;
  html.dataset.theme = resolved;
  html.dataset.bsTheme = resolved;
  html.dataset.themeMode = mode;
  localStorage.setItem("ua-theme", mode);
}
```

Notes:

- We persist `mode`, not `resolved`. If a user picks `system`, we want their next visit to also follow `system`, not whatever it happened to resolve to on this visit.
- We write all three dataset attributes every time so the toggle and the system listener never disagree about state.
- The function is intentionally side-effect-heavy and does not return anything. State lives in the DOM and in `localStorage`; consumers read it back from `document.documentElement.dataset.themeMode`.

## CSS contract

Components in this design system must read from **semantic tokens**, never from brand tokens, for any color that participates in theming:

- Good: `background: var(--surface);` `color: var(--text);` `border-color: var(--border);`
- Bad: `background: var(--ua-blue);` `color: var(--ua-white);`

Brand tokens (`--ua-blue`, `--ua-red`, `--ua-sky`, ...) stay **constant across themes**. They are the literal hex values from the UA brand guide and never flip. Semantic tokens (`--bg`, `--surface`, `--text`, `--accent`, `--link`, `--border`, `--focus-ring`) **do flip** between light and dark.

If a component renders the wrong color in dark mode, the diagnosis is almost always the same: it referenced a brand token (`--ua-blue`) where it should have referenced a semantic one (`--surface`). Fix the reference; do not add a dark-mode override at the component level.

## `color-scheme`

The light root in `tokens.css` includes `color-scheme: light;`, and the dark
block includes `color-scheme: dark;`. This is a small CSS property with outsized
impact: it tells the browser to render native form controls, scrollbars, and
other user-agent UI in the active theme. Without the light value, a user who
forces light mode on a dark OS can still get dark native controls.

Confirm the matching value is set whenever you write a new scoped theme selector
outside of `tokens.css`:

```css
[data-theme="dark"],
[data-bs-theme="dark"] {
  /* tokens... */
  color-scheme: dark;
}
```

If you ever scope dark mode to a subtree (rare, but possible for a single dark-themed hero), set `color-scheme: dark` on that subtree too.

## Reduced Motion

`tokens.css` also emits a global `@media (prefers-reduced-motion: reduce)` reset
that shortens animations and transitions and disables smooth scrolling. Keep
component motion modest, but do not duplicate reduced-motion overrides in each
template unless a component needs a more specific fallback.

## Testing dark mode

Run through this checklist before merging anything that touches a themed surface:

- [ ] Toggle to dark, then hard-reload — is there a white flash before the dark theme paints?
- [ ] All text legible? Focus on muted (`--text-muted` = `#A6B5CC`) and faint (`--text-faint` = `#8292AC`) shades, which are the most likely to fail contrast.
- [ ] Focus rings visible? `--focus-ring` is Sky `#81D3EB` in dark mode; tab through interactive elements and confirm.
- [ ] Form inputs and scrollbars rendered dark? If they are white, `color-scheme: dark` is missing or scoped wrong.
- [ ] Images with transparent backgrounds — do they need a light-backdrop wrapper, or do they read on navy as-is? Logos in particular often need a wrapper.
- [ ] Charts and data visualizations — do the data colors hold their meaning on navy? Light-mode chart palettes often go muddy on dark backgrounds.
- [ ] Accent buttons — Arizona Red (`#AB0520`) is replaced with `#D8112D` in dark; confirm primary CTAs render the brighter red, not the light-mode red.
- [ ] Links — confirm they render Sky (`#81D3EB`), not the light-mode link color, which is much too dim on navy.

## Server-side rendering note

For Next, Astro, Drupal Twig, and Hugo templates, the HTML lands at the browser without any `data-theme` attribute. The pre-paint script runs before the first stylesheet evaluates and writes the attribute, so the **first paint** already has the correct theme. There is no flash because no styled paint happens between HTML arrival and script execution.

Two requirements keep this working:

1. The inline `<script>` block must be the **first thing** inside `<head>` — before any `<link rel="stylesheet">`, before any framework-injected `<style>`, before any font preload.
2. `:root` (the un-attributed default) must hold **light-mode values** for every semantic token. If `:root` is blank or partial, an unresolved or failed-bootstrap page renders as broken/transparent rather than as light.

For Next App Router, the script lives in `app/layout.tsx` as a `<script dangerouslySetInnerHTML={{ __html: ... }} />` placed above `<link>` tags. For Astro, it lives in the layout's `<head>` slot as a raw `<script is:inline>`. For Drupal, it goes in `html.html.twig` directly. For Hugo, in `layouts/partials/head.html` as the first child of `<head>`. In every case, do **not** let your bundler defer it.

## Source

- Dark palette: `packages/ua-tokens/tokens.json`
- Generated CSS: `packages/ua-tokens/tokens.css` (the combined `[data-theme="dark"], [data-bs-theme="dark"]` block)
- Toggle behavior and `setTheme` helper: `templates/*/src/lib/theme.ts` (forward reference — not yet built; once shipped, every template will import the same helper)
- Brand-truth reference implementation: `bear-down-lms`

When updating the dark palette, edit `tokens.json` and re-run the token build. Never hand-edit `tokens.css`.

# Typography

Typography for University of Arizona Athletics web projects. The source of truth lives in `packages/ua-tokens/tokens.json`, which compiles to `dist/tokens.css` (CSS custom properties) and a Tailwind preset. This doc explains which fonts to use, how to load Typekit safely, the type scale, and how to apply type through semantic CSS variables and Tailwind utilities.

## Brand families

UA brand standard is **Proxima Nova** for sans and **Garamond Premier Pro** for serif. Both ship through Adobe Typekit.

- **Sans (`--font-sans`)** — Proxima Nova. Default for body copy, UI, navigation, buttons, forms, and most headlines.
- **Serif (`--font-serif`)** — Garamond Premier Pro. Editorial accents only: pull quotes, hero headlines on storytelling/long-form pages, magazine-style feature layouts.
- **Mono (`--font-mono`)** — system monospace. Code, technical readouts, score tables where tabular figures help.

The token values are full fallback stacks so pages render readably even if Typekit never loads.

```css
--font-sans:  "proxima-nova", "Proxima Nova", "Calibri", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-serif: "garamond-premier-pro", "Garamond Premier Pro", Garamond, "Times New Roman", serif;
--font-mono:  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

## Loading Typekit

UA Athletics has a shared Typekit kit ID — `emv3zbo` — currently in use by the `bear-down-lms` app.

**Do not reuse this kit ID on a new domain without clearance.** Typekit kits have a per-kit domain allowlist enforced by Adobe Fonts. Adding a new domain requires going through UA Marcom: email **web@arizona.edu** before pointing a new project at `emv3zbo`. Marcom will either add the domain to the existing kit or issue a project-specific kit ID.

Templates in this repo ship with a `// CONFIGURE_ME: Typekit kit ID` marker so the fallback stack works out of the box and you fill in the kit only once you have clearance.

Load the stylesheet in the document head:

```html
<link rel="stylesheet" href="https://use.typekit.net/{KIT_ID}.css">
```

Notes:

- Use `<link rel="stylesheet">`, not `@import` — `@import` blocks the CSSOM and is measurably slower.
- A `<link rel="preload" as="style">` on the same URL is optional and only worth it if Typekit is render-blocking your LCP.
- `font-display: swap` is already set by Typekit's generated CSS, so the fallback stack paints immediately and the web font swaps in when ready.

## Fallback strategy

The fallback stacks are picked to render close to the brand families even when Typekit is unavailable (offline, blocked, kit misconfigured, new domain not yet cleared).

- **Sans fallback** — `Calibri` is metrically close to Proxima Nova on Windows. `system-ui` covers macOS/iOS. `Roboto` covers Android. `BlinkMacSystemFont` and `Segoe UI` are belt-and-suspenders for older browsers.
- **Serif fallback** — `Garamond` is broadly available on macOS. `Times New Roman` is the safe universal fallback.

The practical effect: a page that fails to load Typekit still looks like a UA Athletics page, not like a broken default browser stylesheet.

## Type scale

| Level | Token              | Size (rem) | Size (px) | Typical use                                  |
| ----- | ------------------ | ---------- | --------- | -------------------------------------------- |
| h1    | `--font-size-h1`   | 2.25rem    | 36px      | Page title, hero headline                    |
| h2    | `--font-size-h2`   | 1.75rem    | 28px      | Major section heading                        |
| h3    | `--font-size-h3`   | 1.375rem   | 22px      | Subsection heading                           |
| h4    | `--font-size-h4`   | 1.125rem   | 18px      | Card title, minor heading                    |
| h5    | `--font-size-h5`   | 1rem       | 16px      | Inline heading, label heading                |
| h6    | `--font-size-h6`   | 0.875rem   | 14px      | Smallest heading, eyebrow text, meta heading |

Body text is `1rem` (16px) and inherits `--font-sans`.

## Weights

| Name      | Token                     | Value |
| --------- | ------------------------- | ----- |
| Regular   | `--font-weight-regular`   | 400   |
| Medium    | `--font-weight-medium`    | 500   |
| Semibold  | `--font-weight-semibold`  | 600   |
| Bold      | `--font-weight-bold`      | 700   |
| Extrabold | `--font-weight-extrabold` | 800   |

Guidance:

- Headlines use **bold (700)** or **extrabold (800)** for impact — especially hero h1s.
- Body copy uses **regular (400)**.
- UI labels (buttons, nav, form labels, tabs) use **medium (500)** or **semibold (600)**.

## Line heights

| Name    | Token                    | Value | Use                                       |
| ------- | ------------------------ | ----- | ----------------------------------------- |
| Tight   | `--line-height-tight`    | 1.15  | Display headlines, large h1/h2            |
| Snug    | `--line-height-snug`     | 1.25  | h3, h4, compact UI text                   |
| Normal  | `--line-height-normal`   | 1.5   | Body copy, default                        |
| Relaxed | `--line-height-relaxed`  | 1.6   | Long-form reading, editorial article body |

## Using type tokens

Three ways to apply the same tokens, depending on how the project is wired.

**Plain CSS (consumes `dist/tokens.css`):**

```css
h1 {
  font-family: var(--font-sans);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

**Tailwind (consumes the preset):**

```html
<h1 class="font-sans text-h1 font-bold leading-tight">Bear Down</h1>
```

The preset exposes the token names directly: `fontFamily.sans`, `fontSize.h1`–`h6`, `fontWeight.regular`/`medium`/`semibold`/`bold`/`extrabold`, `lineHeight.tight`/`snug`/`normal`/`relaxed`.

**TypeScript (consumes the JS export):**

```ts
import { tokens } from "@ua/ua-tokens";

tokens.type.scale.h1; // "2.25rem"
```

## Headings vs body — rules of thumb

- Every page has exactly one `h1`. It is the page's title, not decoration.
- Don't skip heading levels for visual sizing. If `h3` looks too big, use a smaller `h2` styling or a styled `<p>`, not `h4` masquerading as `h3`.
- Heading order in the DOM should follow document outline, regardless of visual design.
- Body text is **16px (1rem) minimum**. Do not ship 14px body copy.
- Long-form article body should use `--line-height-relaxed` (1.6) and a measure of roughly 60–80 characters.

## Editorial / serif use

`--font-serif` (Garamond Premier Pro) is for editorial moments, not chrome.

Reach for it when:

- Designing a magazine-style feature or long-form story page.
- Setting a pull quote inside an article.
- Styling a hero headline on a storytelling page that wants a literary feel.

Do **not** use serif for:

- Default UI (buttons, nav, forms, tabs, modals).
- Data tables, scores, schedules, stats.
- Body copy in standard marketing or product pages.

When in doubt, default to sans.

## Source

All values above come from `packages/ua-tokens/tokens.json`. Update tokens there and rebuild; do not hand-edit `dist/tokens.css` or the Tailwind preset.

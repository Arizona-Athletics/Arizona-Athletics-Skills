# Colors

This document is the color reference for `arizona-athletics-web-templates`. It covers which color tokens exist in the design system, when to reach for a brand token versus a semantic token, and which foreground/background pairings meet WCAG AA contrast. It is written for developers (and LLMs writing code on their behalf) who are starting a new University of Arizona Athletics web project and need to make defensible color choices without re-deriving the brand from scratch.

All tokens described here are generated from `packages/ua-tokens/tokens.json` and compiled to `dist/tokens.css`, `tokens.scss`, `tokens.ts`, and a Tailwind preset. Two CSS custom-property prefixes ship: `--ua-*` is the canonical name, and `--az-*` is an alias retained for compatibility with `az-digital/arizona-bootstrap` consumers such as `bear-down-lms`.

## Two layers: brand vs semantic

The token system has two layers, and using the right one is the single most important color decision you will make.

- **Brand tokens** (`--ua-red`, `--ua-blue`, `--ua-bloom`, etc.) are raw identity colors. Use them for one-off identity accents: a Bloom CTA button, a Sky highlight stripe, a Mesa illustration tint, a Red headline ornament. They do not change between light and dark themes.
- **Semantic tokens** (`--bg`, `--surface`, `--text`, `--text-strong`, `--border`, `--link`, `--accent`, etc.) describe a role, not a color. They resolve to different brand values in light vs dark theme. Use them for everything structural: page background, card surfaces, body text, borders, links, focus rings.

If you find yourself writing `color: var(--ua-blue)` for body copy, you actually want `color: var(--text-strong)`. If you are about to write `background: var(--ua-white)` for a card, you want `background: var(--surface)`. Reaching past the semantic layer into the brand layer is how dark mode breaks.

| Layer    | Prefix          | Theme-aware | When to use                                                       |
| -------- | --------------- | ----------- | ----------------------------------------------------------------- |
| Brand    | `--ua-*`        | No          | Identity moments: logos, marketing accents, illustrations, decor. |
| Semantic | `--bg`, `--text`, etc. | Yes  | Structural UI: backgrounds, text, borders, links, focus, states.  |

Rule of thumb: if removing the color would make the layout look broken (not just off-brand), it is structural and belongs to a semantic token.

## Brand palette

The 19 brand colors. Tokens are listed under the canonical `--ua-*` prefix; the `--az-*` aliases resolve to the same values.

| Name        | Token                | Hex       | Typical use                                                       |
| ----------- | -------------------- | --------- | ----------------------------------------------------------------- |
| Red         | `--ua-red`           | `#AB0520` | Primary mark, headline accent, primary CTA in light theme.        |
| Blue        | `--ua-blue`          | `#0C234B` | Page chrome, headlines, navigation surface in light theme.        |
| Midnight    | `--ua-midnight`      | `#001C48` | Dark-mode surface base, deep navy wash behind hero content.       |
| Azurite     | `--ua-azurite`       | `#1E5288` | Link color in light theme, mid-depth navy for tertiary surfaces.  |
| Oasis       | `--ua-oasis`         | `#378DBD` | Focus ring in light theme, info accents, secondary CTA.           |
| Chili       | `--ua-chili`         | `#8B0015` | Hover/active state for the red accent, dense red on light bg.     |
| Bloom       | `--ua-bloom`         | `#EF4056` | Bright marketing CTA, large display accents, dark-mode accent hover. |
| Sky         | `--ua-sky`           | `#81D3EB` | Dark-mode link color, light info background, illustrative accent. |
| Leaf        | `--ua-leaf`          | `#70B865` | Success states, positive data viz, ecology/wellness contexts.     |
| River       | `--ua-river`         | `#007D84` | Teal accent, info chip, secondary brand moment.                   |
| Mesa        | `--ua-mesa`          | `#A95C42` | Warm earth accent for illustration and editorial moments.         |
| Warm Gray   | `--ua-warm-gray`     | `#F4EDE5` | Light alt surface, warm neutral panel background.                 |
| Cool Gray   | `--ua-cool-gray`     | `#E2E9EB` | Default border in light theme, cool neutral divider.              |
| Silver      | `--ua-silver`        | `#9EABAE` | Disabled controls, muted iconography, faint text on dark surface. |
| Dark Silver | `--ua-dark-silver`   | `#49595E` | Secondary text on warm backgrounds, slate accent.                 |
| Ash         | `--ua-ash`           | `#403635` | Deep neutral for editorial type, very dark body text alternative. |
| Sage        | `--ua-sage`          | `#4A634E` | Muted green for editorial accents and quiet success states.       |
| White       | `--ua-white`         | `#FFFFFF` | Reverse type, surface base in light theme.                        |
| Black       | `--ua-black`         | `#000000` | Logos requiring pure black, occasional dense type.                |

## Semantic tokens — light theme

The light theme is the default and is applied when no `data-theme` attribute is set, or when `data-theme="light"` / `data-bs-theme="light"` is explicitly set.

| Token             | Hex       | Used for                                                       |
| ----------------- | --------- | -------------------------------------------------------------- |
| `--bg`            | `#FAF8F4` | Page background. Warm off-white that reads as paper, not gray. |
| `--surface`       | `#FFFFFF` | Cards, sheets, modals, primary content containers.             |
| `--surface-alt`   | `#F4EDE5` | Secondary panels, callouts, alternating row banding.           |
| `--surface-sunk`  | `#EFE9DF` | Inset surfaces, code blocks, wells, sunken regions.            |
| `--border`        | `#E2E9EB` | Default 1px dividers, card outlines, subtle separation.        |
| `--border-strong` | `#C9D2D7` | Emphasized borders, input outlines, table grid lines.          |
| `--text`          | `#1A2740` | Body text. Navy-leaning near-black for warmth.                 |
| `--text-strong`   | `#0C234B` | Headlines, key labels, anywhere needing maximum emphasis.      |
| `--text-muted`    | `#5A6577` | Secondary text, captions, meta info, helper copy.              |
| `--text-faint`    | `#657287` | Disabled labels, the quietest non-decorative text.             |
| `--link`          | `#1E5288` | Inline links and any non-button affordance.                    |
| `--link-hover`    | `#0C234B` | Hover/focus state for inline links.                            |
| `--accent`        | `#AB0520` | Primary CTA background, brand-loud emphasis fill.              |
| `--accent-hover`  | `#8B0015` | Hover/active state for the accent fill.                        |
| `--on-accent`     | `#FFFFFF` | Text and icons sitting on an accent fill.                      |
| `--focus-ring`    | `#378DBD` | Keyboard focus outline. High contrast on both red and white.   |

## Semantic tokens — dark theme

Dark theme is brand-true navy, not the GitHub-style neutral gray you may be used to. It activates via `[data-theme="dark"]` (preferred) or `[data-bs-theme="dark"]` (for Bootstrap-flavored consumers). All semantic tokens above remap to the values below; brand `--ua-*` tokens do not change.

| Token             | Hex       | Used for                                                       |
| ----------------- | --------- | -------------------------------------------------------------- |
| `--bg`            | `#04122A` | Page background. Deepest navy in the system.                   |
| `--surface`       | `#0C234B` | Cards, sheets, modals on dark theme.                           |
| `--surface-alt`   | `#122E5E` | Secondary panels and callouts on dark theme.                   |
| `--surface-sunk`  | `#061A37` | Inset surfaces, code blocks, wells on dark theme.              |
| `--border`        | `#1B3A78` | Default dividers and card outlines on dark theme.              |
| `--border-strong` | `#2A4E94` | Emphasized borders, input outlines on dark theme.              |
| `--text`          | `#E8ECF4` | Body text on dark theme.                                       |
| `--text-strong`   | `#FFFFFF` | Headlines and maximum-emphasis labels on dark theme.           |
| `--text-muted`    | `#A6B5CC` | Secondary and helper text on dark theme.                       |
| `--text-faint`    | `#8292AC` | Disabled labels and the quietest non-decorative text.          |
| `--link`          | `#81D3EB` | Inline links on dark theme. Sky reads well on navy.            |
| `--link-hover`    | `#B6E3F1` | Hover/focus state for links on dark theme.                     |
| `--accent`        | `#D8112D` | Primary CTA background. A slightly hotter red for dark surfaces. |
| `--accent-hover`  | `#DE1F3C` | Hover/active state for the accent fill. Reads as a brightening step while keeping white labels AA. |
| `--on-accent`     | `#FFFFFF` | Text and icons sitting on an accent fill.                      |
| `--focus-ring`    | `#81D3EB` | Keyboard focus outline on dark theme.                          |

## WCAG AA contrast pairs

These are the foreground/background combinations the system is designed around. Ratios are approximate (computed from the listed hex values) and are labeled with the conservative WCAG tier they reliably hit. Where a pair sits close to a tier boundary, the lower tier is reported. AA requires 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1 for normal text.

| Foreground                  | Background                  | Approx. ratio | Tier                |
| --------------------------- | --------------------------- | ------------- | ------------------- |
| `--text` `#1A2740`          | `--bg` `#FAF8F4`            | 13.1:1        | AAA (normal text)   |
| `--text-strong` `#0C234B`   | `--surface` `#FFFFFF`       | 16.0:1        | AAA (normal text)   |
| `--text-muted` `#5A6577`    | `--surface` `#FFFFFF`       | 5.4:1         | AA (normal text)    |
| `--text` `#1A2740`          | `--surface-alt` `#F4EDE5`   | 11.4:1        | AAA (normal text)   |
| `--on-accent` `#FFFFFF`     | `--accent` `#AB0520`        | 8.7:1         | AAA (normal text)   |
| `--on-accent` `#FFFFFF`     | `--accent-hover` `#8B0015`  | 10.7:1        | AAA (normal text)   |
| `--text-faint` `#657287`    | `--surface` `#FFFFFF`       | 4.9:1         | AA (normal text)    |
| `--link` `#1E5288`          | `--bg` `#FAF8F4`            | 7.2:1         | AAA (normal text)   |
| Dark `--text` `#E8ECF4`     | Dark `--bg` `#04122A`       | 14.5:1        | AAA (normal text)   |
| Dark `--link` `#81D3EB`     | Dark `--surface` `#0C234B`  | 7.9:1         | AAA (normal text)   |
| Dark `--on-accent` `#FFFFFF` | Dark `--accent-hover` `#DE1F3C` | 4.8:1     | AA (normal text)    |

Every pair above is enforced by `bun run check:contrast` (`scripts/check-contrast.ts`), which fails CI if a token change drops a pair below its tier.

Note on Bloom: `--ua-bloom` `#EF4056` on white sits at roughly 3.7:1, which **fails AA for body text**. Bloom on white is acceptable only for large display headlines (24px bold or 18.66px regular and up) or for non-text decorative accents such as rules, icons used as ornament, and illustration fills. For body-weight CTA fills, use `--accent` (red) on white instead.

## Combinations to avoid

- Red `--ua-red` text on Blue `--ua-blue` background — the two saturated primaries vibrate against each other and fail contrast for body text.
- Bloom `--ua-bloom` text on Warm Gray `--ua-warm-gray` — insufficient contrast for body copy; reserve for large display only.
- Silver `--ua-silver` or Cool Gray `--ua-cool-gray` text on white — fails AA; use `--text-muted` instead when you need quieter text.
- Any brand color placed directly on its near neighbor (Azurite on Blue, Chili on Red, Bloom on Red, Sky on Oasis) — adjacent hues blur edges and reduce legibility.
- White text on Sky `--ua-sky`, Leaf `--ua-leaf`, or Warm Gray `--ua-warm-gray` — these are light brand colors; pair them with dark text instead.
- Body text colored with `--ua-blue` directly — use `--text-strong`; it picks up the right value in dark theme.

## Code examples

Consuming a semantic token via CSS custom properties:

```css
.card {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.card a {
  color: var(--link);
}
.card a:hover {
  color: var(--link-hover);
}

/* Identity accent: brand token is fine here because it's a one-off ornament. */
.card__ribbon {
  background: var(--ua-bloom);
}
```

Consuming the same tokens through the Tailwind preset:

```jsx
export function Card({ children }) {
  return (
    <article className="bg-surface text-text border border-border rounded-lg p-6">
      <span className="inline-block bg-ua-bloom text-white px-2 py-1 text-xs">
        New
      </span>
      <div className="mt-4">{children}</div>
    </article>
  );
}
```

Consuming tokens from the compiled TypeScript export:

```ts
import { tokens } from "@ua/tokens";

const headlineColor = tokens.semantic.light.textStrong; // "#0C234B"
const brandRed = tokens.brand.red;                       // "#AB0520"

document.documentElement.style.setProperty("--accent", brandRed);
```

## Source

The authoritative source for every value above is `packages/ua-tokens/tokens.json`. If a token is not in that file, it is not part of the design system; if a value here disagrees with that file, the file wins and this doc should be updated.

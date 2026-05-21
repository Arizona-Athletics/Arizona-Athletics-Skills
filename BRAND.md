# BRAND.md

University of Arizona Athletics — palette and typography reference at a glance.

For the full rationale and consumption patterns, see [`docs/COLORS.md`](./docs/COLORS.md)
and [`docs/TYPOGRAPHY.md`](./docs/TYPOGRAPHY.md). The authoritative source is
[`packages/ua-tokens/tokens.json`](./packages/ua-tokens/tokens.json).

## Palette — brand tokens

Canonical UA Athletics colors. Use these only for one-off identity accents (a Bloom
CTA, a Sky highlight, a Mesa illustration tint). For everything structural, use
**semantic tokens** below.

Available as `--ua-<name>` (canonical) and `--az-<name>` (alias for
`az-digital/arizona-bootstrap` compatibility).

| Color | Token | Hex |
| --- | --- | --- |
| Arizona Red | `--ua-red` | `#AB0520` |
| Arizona Blue | `--ua-blue` | `#0C234B` |
| Midnight | `--ua-midnight` | `#001C48` |
| Azurite | `--ua-azurite` | `#1E5288` |
| Oasis | `--ua-oasis` | `#378DBD` |
| Chili | `--ua-chili` | `#8B0015` |
| Bloom | `--ua-bloom` | `#EF4056` |
| Sky | `--ua-sky` | `#81D3EB` |
| Leaf | `--ua-leaf` | `#70B865` |
| River | `--ua-river` | `#007D84` |
| Mesa | `--ua-mesa` | `#A95C42` |
| Warm Gray | `--ua-warm-gray` | `#F4EDE5` |
| Cool Gray | `--ua-cool-gray` | `#E2E9EB` |
| Silver | `--ua-silver` | `#9EABAE` |
| Dark Silver | `--ua-dark-silver` | `#49595E` |
| Ash | `--ua-ash` | `#403635` |
| Sage | `--ua-sage` | `#4A634E` |
| White | `--ua-white` | `#FFFFFF` |
| Black | `--ua-black` | `#000000` |

## Semantic tokens — light theme (default)

Use these for everything structural. They flip automatically in dark mode.

| Token | Hex | Used for |
| --- | --- | --- |
| `--bg` | `#FAF8F4` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels, modals |
| `--surface-alt` | `#F4EDE5` | Toolbar, secondary sections |
| `--surface-sunk` | `#EFE9DF` | Pressed/inset surfaces |
| `--border` | `#E2E9EB` | Default borders |
| `--border-strong` | `#C9D2D7` | Emphasis borders |
| `--text` | `#1A2740` | Body text |
| `--text-strong` | `#0C234B` | Headlines, labels |
| `--text-muted` | `#5A6577` | Secondary text |
| `--text-faint` | `#8895A8` | Tertiary text, helper |
| `--link` | `#1E5288` | Hyperlinks |
| `--link-hover` | `#0C234B` | Hover state |
| `--accent` | `#AB0520` | Primary CTA, brand emphasis |
| `--accent-hover` | `#8B0015` | CTA hover |
| `--focus-ring` | `#378DBD` | Focus outline |

## Semantic tokens — dark theme (brand-true navy)

Activates on `[data-theme="dark"]` or `[data-bs-theme="dark"]`.

| Token | Hex | Used for |
| --- | --- | --- |
| `--bg` | `#04122A` | Page background (deeper than Midnight) |
| `--surface` | `#0C234B` | Cards, panels (Arizona Blue) |
| `--surface-alt` | `#122E5E` | Toolbar, secondary sections |
| `--surface-sunk` | `#061A37` | Pressed/inset |
| `--border` | `#1B3A78` | Default borders |
| `--border-strong` | `#2A4E94` | Emphasis borders |
| `--text` | `#E8ECF4` | Body text |
| `--text-strong` | `#FFFFFF` | Headlines |
| `--text-muted` | `#A6B5CC` | Secondary text |
| `--text-faint` | `#7B8AA6` | Tertiary text |
| `--link` | `#81D3EB` | Hyperlinks (Sky — reads on navy) |
| `--link-hover` | `#B6E3F1` | Hover state |
| `--accent` | `#D8112D` | Primary CTA (brighter red — Arizona Red is too dark on navy) |
| `--accent-hover` | `#EF4056` | CTA hover (Bloom) |
| `--focus-ring` | `#81D3EB` | Focus outline |

## Typography

| | Family | Notes |
| --- | --- | --- |
| `--font-sans` | Proxima Nova → Calibri → system-ui | Default UI / body. Typekit `emv3zbo` — reuse requires Marcom clearance. |
| `--font-serif` | Garamond Premier Pro → Garamond → Times New Roman | Editorial accents, pull quotes, storytelling headlines. |
| `--font-mono` | ui-monospace → SF Mono → Menlo → Consolas | Code, data. |

### Type scale

| Level | Token | rem | px |
| --- | --- | --- | --- |
| h1 | `--font-size-h1` | 2.25 | 36 |
| h2 | `--font-size-h2` | 1.75 | 28 |
| h3 | `--font-size-h3` | 1.375 | 22 |
| h4 | `--font-size-h4` | 1.125 | 18 |
| h5 | `--font-size-h5` | 1 | 16 |
| h6 | `--font-size-h6` | 0.875 | 14 |

### Weights & line heights

| Weight | Token | Value |
| --- | --- | --- |
| Regular | `--font-weight-regular` | 400 |
| Medium | `--font-weight-medium` | 500 |
| Semibold | `--font-weight-semibold` | 600 |
| Bold | `--font-weight-bold` | 700 |
| Extrabold | `--font-weight-extrabold` | 800 |

| Line height | Token | Value | Use |
| --- | --- | --- | --- |
| Tight | `--line-height-tight` | 1.15 | Display headlines |
| Snug | `--line-height-snug` | 1.25 | h3/h4 |
| Normal | `--line-height-normal` | 1.5 | Body |
| Relaxed | `--line-height-relaxed` | 1.6 | Long-form reading |

## Space / radius / shadow / container

Full tables in [`docs/COLORS.md`](./docs/COLORS.md) and
[`packages/ua-tokens/tokens.json`](./packages/ua-tokens/tokens.json). Quick reference:

- **Space:** `--space-0` (0) → `--space-12` (6rem). Steps: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12.
- **Radius:** `sm` 0.25rem, `md` 0.5rem, `lg` 0.75rem, `xl` 1rem, `pill` 999px.
- **Shadow:** `sm`, `md`, `lg` — all tinted with Arizona Blue alpha, not neutral gray.
- **Container:** `narrow` 640px, `default` 1040px, `wide` 1280px.

## Sources

- [`az-digital/arizona-bootstrap`](https://github.com/az-digital/arizona-bootstrap) — official UA Marcom Bootstrap fork
- [`az-digital/az_quickstart`](https://github.com/az-digital/az_quickstart) — Arizona Quickstart 3 Drupal CMS
- [marcom.arizona.edu](https://marcom.arizona.edu/) — UA brand standards
- [`Arizona-Athletics/bear-down-lms`](https://github.com/Arizona-Athletics/bear-down-lms) — reference Node/Express app with brand-true navy dark theme

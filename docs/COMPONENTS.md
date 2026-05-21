# UA Athletics Component Contract

This document defines the **cross-template component contract** for the University of Arizona Athletics shared design system. It is **not a runtime component library**. The repo does not ship a single React (or Astro, or Twig) package that every site imports. Instead, each template under `templates/*` — React, Astro, Bootstrap-HTML, Tailwind-HTML, Drupal subtheme, Hugo, and MJML email — implements these six components in its own idiom: a React component, an Astro component, an EJS partial, Bootstrap markup, a Tailwind utility composition, a Drupal Twig template, a Hugo partial, or an MJML block. This contract pins down the names, props, slots, visual rules, tokens, and accessibility requirements so a UA Athletics page looks and behaves the same whether it is rendered by Next.js or by hand-written HTML. Every template **must** implement all six. Templates **must** consume tokens from `@ua/ua-tokens`. No hardcoded hex.

---

## The Six Components

| Component     | Purpose                                                                       | Required? |
| ------------- | ----------------------------------------------------------------------------- | --------- |
| `Header`      | Site chrome at top: brand, site title, primary nav, theme toggle, actions.    | Yes       |
| `Hero`        | Page-top banner: headline, optional subhead, optional CTA, optional image.    | Yes       |
| `Toolbar`     | Secondary action bar under hero on app/dashboard pages.                       | Yes       |
| `Card`        | Content tile: eyebrow, headline, body, optional media, optional footer.       | Yes       |
| `Footer`      | Site chrome at bottom: wordmark, link columns, social row, legal bottom bar.  | Yes       |
| `ThemeToggle` | Three-state (system / light / dark) toggle, persisted, FOUC-safe.             | Yes       |

All six are **required**. A template that omits one is not a valid UA Athletics template.

---

## Header

### Purpose

Persistent site chrome at the top of every page: brand mark, site title, primary navigation, theme toggle, and optional account/login.

### Props / slots

- `brand` (**required**) — UA wordmark **or** Block A mark. Site configures which.
- `siteTitle` (optional) — text label next to the brand (e.g. "Arizona Wildcats", "Football").
- `nav` (**required**) — array of primary nav items. Max ~6 visible; overflow collapses into a "More" menu.
- `actions` (optional) — right-side slot for the `ThemeToggle` plus optional account/login control.
- `sticky` (optional, default `false`) — when true, header stays pinned on scroll.

### Visual rules

- Header background uses `--surface`.
- Text uses `--text-strong` for the site title, `--text` for nav items.
- Active nav item underlines with `--accent`, 2px, offset 6px from baseline.
- Hover on nav items: color shifts to `--text-strong`; no background fill.
- Bottom 1px border in `--border`.
- Height: 64px desktop, 56px mobile.
- Mobile breakpoint: nav collapses to a hamburger trigger at viewport `<768px`. Hamburger opens a full-width drawer.
- Sticky variant: when `sticky` is on, add `--shadow-sm` after first scroll past 8px.

### Tokens used

`--surface`, `--text`, `--text-strong`, `--accent`, `--border`, `--shadow-sm`, `--focus-ring`, `--font-sans`, `--space-3`, `--space-4`.

### Accessibility

- Header element is a landmark: use `<header role="banner">` or rely on implicit `<header>` landmark at the page root.
- Nav is a landmark: `<nav aria-label="Primary">`.
- Hamburger button has `aria-expanded` and `aria-controls` pointing at the drawer.
- Drawer traps focus while open; Escape closes it.
- All interactive elements receive a visible 2px `--focus-ring` outline with 2px offset.
- Skip-to-content link is the first focusable element on the page (rendered by the template at the top of `<body>`, visually hidden until focused).

### Reference markup

```html
<header class="ua-header">
  <a class="ua-header__brand" href="/" aria-label="Arizona Athletics home">
    <!-- UA wordmark SVG or Block A SVG -->
  </a>
  <span class="ua-header__site-title">Arizona Wildcats</span>
  <nav class="ua-header__nav" aria-label="Primary">
    <ul>
      <li><a href="/teams" aria-current="page">Teams</a></li>
      <li><a href="/schedule">Schedule</a></li>
      <li><a href="/tickets">Tickets</a></li>
    </ul>
  </nav>
  <div class="ua-header__actions">
    <!-- ThemeToggle -->
    <!-- optional account/login -->
  </div>
</header>
```

---

## Hero

### Purpose

Page-top banner that anchors the page identity: headline, optional subhead, optional CTA, optional background image with brand-tinted overlay.

### Props / slots

- `variant` (optional, default `default`) — one of:
  - `default` — text only on `--surface` background.
  - `with-image` — background image plus brand-tinted scrim overlay.
  - `compact` — smaller padding, smaller headline, for interior pages.
- `headline` (**required**) — text or heading slot.
- `subhead` (optional) — short supporting line under the headline.
- `cta` (optional) — primary action; may include a secondary action alongside.
- `image` (optional, **required when** `variant="with-image"`) — background image URL or slot.
- `overlay` (optional) — overrides the default brand scrim; accepts a CSS gradient value.
- `align` (optional, default `start`) — `start` | `center`. Text alignment.

### Visual rules

- `default` and `compact` use `--bg` or `--surface` (template's choice) with `--text-strong` for the headline.
- `with-image` applies a brand-tinted scrim by default: `linear-gradient(135deg, rgba(12,35,75,0.85), rgba(171,5,32,0.6))`. The overlay is configurable per page.
- Headline uses `--font-sans` at extrabold weight by default. On storytelling and feature pages the template **may** switch the headline to `--font-serif` (Milo Serif) for editorial tone.
- Subhead uses `--font-sans` regular, color `--text-muted` (default variant) or `rgba(255,255,255,0.9)` (with-image variant).
- Vertical padding: `default` 96px top/bottom; `compact` 48px; `with-image` 128px minimum.
- CTA buttons inherit the global button styles; primary CTA uses `--accent` background.
- Image variant must always include `alt` text or be marked `aria-hidden="true"` if purely decorative.

### Tokens used

`--bg`, `--surface`, `--text-strong`, `--text-muted`, `--accent`, `--font-sans`, `--font-serif`, `--space-6`, `--space-8`, `--radius-md`.

### Accessibility

- Headline must be an `<h1>` on landing pages; `<h1>` or `<h2>` on interior pages — never skip heading levels.
- Background image must have an `alt` value or `aria-hidden="true"` and `role="presentation"`.
- Contrast: with-image variant must maintain a 4.5:1 ratio between headline and the overlay-tinted image. The default scrim satisfies this; custom overlays must be re-verified.
- CTAs receive a 2px `--focus-ring` outline with 2px offset.

### Reference markup

```html
<section class="ua-hero ua-hero--with-image" aria-labelledby="hero-title">
  <div class="ua-hero__media" aria-hidden="true">
    <img src="/img/mckale.jpg" alt="" />
    <div class="ua-hero__overlay"></div>
  </div>
  <div class="ua-hero__content">
    <h1 id="hero-title" class="ua-hero__headline">Bear Down. Always.</h1>
    <p class="ua-hero__subhead">The official home of Arizona Athletics.</p>
    <div class="ua-hero__cta">
      <a class="ua-btn ua-btn--primary" href="/tickets">Get Tickets</a>
      <a class="ua-btn ua-btn--ghost" href="/schedule">View Schedule</a>
    </div>
  </div>
</section>
```

---

## Toolbar

### Purpose

Secondary action bar that sits directly under the `Hero` on app/dashboard pages, or directly under the `Header` on pages with no hero. Surfaces page-scoped controls: title, filters, and CTAs.

### Props / slots

- `title` (optional) — page or section title slot.
- `filters` (optional) — filter chip slot; multiple chips allowed.
- `primaryCta` (optional) — right-aligned primary action.
- `secondaryCta` (optional) — sits next to the primary CTA.
- `sticky` (optional, default `false`) — pins under the header on scroll.

### Visual rules

- Background `--surface-alt`.
- Bottom 1px border in `--border`.
- Height: 56px desktop; wraps to two rows on mobile if content exceeds width.
- Title uses `--font-sans` semibold, color `--text-strong`.
- Filter chips use `--surface` background, 1px `--border`, `--radius-pill`. Active chip uses `--accent` background with white text.
- Spacing between slots: `--space-4`.
- When `sticky` is true, the toolbar stays under the header and gains `--shadow-sm` once scrolled.

### Tokens used

`--surface-alt`, `--surface`, `--text-strong`, `--text`, `--accent`, `--border`, `--radius-pill`, `--shadow-sm`, `--space-3`, `--space-4`.

### Accessibility

- Toolbar root may use `role="toolbar"` **only if** all controls inside are simple buttons/links. Otherwise omit the role.
- Filter chips that toggle state are `<button type="button">` with `aria-pressed`.
- Tab order proceeds left-to-right; arrow-key navigation across chips is encouraged but not required.
- Focus ring: 2px `--focus-ring`, 2px offset.

### Reference markup

```html
<div class="ua-toolbar">
  <div class="ua-toolbar__title">
    <h2>Schedule</h2>
  </div>
  <div class="ua-toolbar__filters" role="group" aria-label="Filter by sport">
    <button type="button" class="ua-chip" aria-pressed="true">All</button>
    <button type="button" class="ua-chip" aria-pressed="false">Football</button>
    <button type="button" class="ua-chip" aria-pressed="false">Basketball</button>
  </div>
  <div class="ua-toolbar__actions">
    <button type="button" class="ua-btn ua-btn--ghost">Export</button>
    <button type="button" class="ua-btn ua-btn--primary">Add Game</button>
  </div>
</div>
```

---

## Card

### Purpose

Content tile used across the system for news items, team callouts, stat panels, schedule entries, and other tile-shaped content.

### Props / slots

- `eyebrow` (optional) — small uppercase label above the headline.
- `headline` (**required**) — h3 by default; templates may render as h2/h4 based on document outline.
- `body` (optional) — body text slot.
- `media` (optional) — image or media slot; positioned `top` (default) or `left`.
- `mediaPosition` (optional, default `top`) — `top` | `left`.
- `footer` (optional) — action row at the bottom (links, buttons, meta).
- `href` (optional) — when set, the **entire card** is a single link (whole-card-clickable variant).

### Visual rules

- Background `--surface`.
- Border 1px `--border`.
- Radius `--radius-md`.
- Shadow `--shadow-sm` resting; `--shadow-md` on hover.
- Hover transform: optional 1px lift (`transform: translateY(-1px)`); never more.
- Internal padding `--space-4` (or `--space-3` on compact lists).
- Eyebrow uses `--font-sans` 12px uppercase, letter-spacing 0.04em, color `--text-muted`.
- Headline uses `--font-sans` semibold, color `--text-strong`.
- Body uses `--font-sans` regular, color `--text`.
- Media slot: object-fit cover, radius `--radius-sm` on the image inside the card.
- Footer slot: top border 1px `--border`, padding-top `--space-3`.
- Whole-card-clickable variant: outer element is `<a>` and receives the focus ring; nested links inside such a card are not allowed (avoid nested-link a11y bugs).

### Tokens used

`--surface`, `--text`, `--text-strong`, `--text-muted`, `--border`, `--radius-sm`, `--radius-md`, `--shadow-sm`, `--shadow-md`, `--focus-ring`, `--space-3`, `--space-4`, `--font-sans`.

### Accessibility

- Headline is a real heading element; do not fake it with a `<div>`.
- Media `<img>` must have `alt`; decorative images use `alt=""`.
- Whole-card-clickable variant: the link's accessible name must include the headline text. Avoid nested interactive elements.
- Focus ring: 2px `--focus-ring`, 2px offset, applied to the card when `href` is set; otherwise to the inner controls.

### Reference markup

```html
<article class="ua-card">
  <div class="ua-card__media">
    <img src="/img/news.jpg" alt="Wildcats huddle on the field" />
  </div>
  <div class="ua-card__body">
    <p class="ua-card__eyebrow">Football</p>
    <h3 class="ua-card__headline">Wildcats Take the Territorial Cup</h3>
    <p class="ua-card__text">Arizona defeats ASU 38-35 in double overtime.</p>
  </div>
  <div class="ua-card__footer">
    <a href="/news/territorial-cup">Read more</a>
    <span class="ua-card__meta">Nov 30, 2025</span>
  </div>
</article>
```

---

## Footer

### Purpose

Persistent site chrome at the bottom of every page: UA Athletics wordmark, link columns, social row, and a required legal bottom bar.

### Props / slots

- `brand` (**required**) — UA Athletics wordmark plus a brief one-sentence site description.
- `linkColumns` (**required**) — 2 to 4 columns of grouped links. Each column has a heading and a list.
- `social` (optional) — row of social icons (Twitter/X, Instagram, Facebook, YouTube, TikTok, etc.).
- `legal` (**required**) — bottom bar slot. Fixed content; not freely editable.

### Visual rules

- Background `--surface` in light theme; in dark theme uses `--surface` (resolved to Arizona Blue surface token).
- Text `--text` for link labels, `--text-muted` for column headings.
- Top 1px border in `--border`.
- Internal padding `--space-8` top/bottom desktop; `--space-6` mobile.
- Column headings use `--font-sans` uppercase, 12px, letter-spacing 0.04em.
- Link hover: color shifts to `--text-strong`; underline on hover only.
- Social icons are 24px, color `--text-muted`, hover `--text-strong`.
- Legal bottom bar separated by a 1px `--border` line; uses `--text-muted` at 14px.

### Required legal content

The bottom bar **must** contain:

- Copyright line, current year, exactly: `© <year> Arizona Board of Regents on behalf of the University of Arizona.`
- A link labelled **Privacy** to the UA privacy policy.
- A link labelled **Accessibility** to the UA accessibility statement.
- A link labelled **The University of Arizona** to `https://www.arizona.edu/`.

These four items are non-negotiable per UA Marcom standards.

### Tokens used

`--surface`, `--text`, `--text-strong`, `--text-muted`, `--border`, `--font-sans`, `--space-3`, `--space-6`, `--space-8`.

### Accessibility

- Footer element is a landmark: rely on the implicit `<footer>` landmark or set `role="contentinfo"`.
- Link columns wrap in `<nav aria-label="Footer">` with `<ul>` inside.
- Social icons are links with accessible names: `aria-label="Arizona Athletics on Instagram"` (do not rely on the icon alone).
- Focus ring: 2px `--focus-ring`, 2px offset on every link and icon.

### Reference markup

```html
<footer class="ua-footer">
  <div class="ua-footer__brand">
    <!-- UA Athletics wordmark SVG -->
    <p>The official home of Arizona Athletics.</p>
  </div>
  <nav class="ua-footer__columns" aria-label="Footer">
    <div class="ua-footer__col">
      <h4>Teams</h4>
      <ul>
        <li><a href="/football">Football</a></li>
        <li><a href="/basketball">Basketball</a></li>
      </ul>
    </div>
    <!-- additional columns -->
  </nav>
  <ul class="ua-footer__social" aria-label="Social media">
    <li><a href="https://instagram.com/arizonaathletics" aria-label="Arizona Athletics on Instagram"><!-- icon --></a></li>
  </ul>
  <div class="ua-footer__legal">
    <p>&copy; 2026 Arizona Board of Regents on behalf of the University of Arizona.</p>
    <ul>
      <li><a href="/privacy">Privacy</a></li>
      <li><a href="/accessibility">Accessibility</a></li>
      <li><a href="https://www.arizona.edu/">The University of Arizona</a></li>
    </ul>
  </div>
</footer>
```

---

## ThemeToggle

### Purpose

A three-state control that lets the user pick **system**, **light**, or **dark**. Persists choice to `localStorage` under the key `ua-theme`. Must not cause a flash of unstyled or wrong-themed content on initial paint.

### Props / slots

- `defaultMode` (optional, default `system`) — initial value when no stored preference exists.
- `storageKey` (optional, default `ua-theme`) — override only in tests; production templates must use `ua-theme`.
- `label` (optional) — accessible name for the control.

### Visual rules

- Renders as either a three-segment switch (system | light | dark) **or** a single button that cycles through the three states. The choice is up to the template; the contract is "three states, persisted, no flash."
- Active segment uses `--accent` background with white text in the segment style.
- Cycle-button style shows an icon for the active state and changes its `aria-label` to reflect the current state.
- Background `--surface-alt`; border 1px `--border`; radius `--radius-pill`.

### FOUC-safe behavior

- A small pre-paint script must run in `<head>` **before** the first style is applied. The script reads `ua-theme` from `localStorage` and sets a `data-theme` attribute on `<html>` to `light`, `dark`, or removes it for `system`. See [DARK_MODE.md](./DARK_MODE.md) for the canonical snippet.
- When mode is `system`, the page follows `prefers-color-scheme`.
- Switching modes updates `data-theme` on `<html>` immediately and writes the new value to `localStorage`.

### Tokens used

`--surface-alt`, `--text`, `--text-strong`, `--accent`, `--border`, `--radius-pill`, `--focus-ring`.

### Accessibility

- The control is reachable by tab.
- Space or Enter cycles to the next state (cycle-button style) or activates the focused segment (switch style).
- The current state is announced via `aria-label` or `aria-pressed` on each segment.
- The cycle-button announces transitions via an `aria-live="polite"` region or via its updated `aria-label`.
- Focus ring: 2px `--focus-ring`, 2px offset.
- Never set `outline: none` without an equivalent replacement.

### Reference markup

```html
<!-- segmented style -->
<div class="ua-theme-toggle" role="group" aria-label="Theme">
  <button type="button" aria-pressed="true" data-mode="system">System</button>
  <button type="button" aria-pressed="false" data-mode="light">Light</button>
  <button type="button" aria-pressed="false" data-mode="dark">Dark</button>
</div>

<!-- cycle-button style -->
<button
  type="button"
  class="ua-theme-toggle ua-theme-toggle--cycle"
  aria-label="Theme: system. Activate to switch."
>
  <!-- icon for current state -->
</button>
```

---

## Cross-Template Consistency Rules

- All six components **must** consume colors, type, spacing, radii, and shadows from `@ua/ua-tokens`. No hardcoded hex values anywhere in a template's component implementation.
- All six components **must** support both light and dark themes. Dark theme is selected via `data-theme="dark"` on `<html>` (see [DARK_MODE.md](./DARK_MODE.md)).
- Focus ring uses `--focus-ring` (Oasis in light, Sky in dark) with a 2px outline and 2px offset. **Never** apply `outline: none` without a visible replacement.
- Brand mark (Block A or UA wordmark) and the footer's required legal text and links are **non-negotiable** per UA Marcom standards. Templates may not alter the copyright string, the Privacy/Accessibility/University of Arizona links, or substitute a different brand mark.
- All interactive components must be keyboard-reachable and respond to expected keys (Enter, Space, Escape for dismissals, Arrow keys for grouped controls where reasonable).
- All components must render with semantic HTML at their root: `<header>`, `<section>`, `<article>`, `<nav>`, `<footer>`, `<button>`, `<a>`. Do not substitute `<div>` for these.
- Class names in reference markup use the `ua-` BEM prefix (`ua-header`, `ua-header__brand`, `ua-card--compact`). Templates that use utility-first CSS (Tailwind) are not required to emit these classes literally, but their rendered structure must still match the reference markup.
- Each template must document its implementation of the six components in its own `templates/<name>/README.md`, with a one-line note for each: "Header: implemented at `<path>`."

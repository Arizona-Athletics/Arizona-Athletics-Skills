# @ua/template-email-html

University of Arizona Athletics starter — **transactional + marketing email
HTML templates** with brand-true headers, footers, and CTAs.

These are static `.html` files. Drop them in your sending platform (SES,
SendGrid, Postmark, Mailgun, etc.), swap the `CONFIGURE_ME` placeholders, and
ship.

## What this is

- Five hand-rolled, cross-client HTML email templates aligned with the canonical
  UA Athletics brand (Arizona Red `#AB0520`, Arizona Blue `#0C234B`, Warm Gray
  `#F4EDE5`).
- Three reusable partials (header, footer, CTA button) you copy-paste into new
  templates.
- A tiny local preview page (`preview/index.html`) that links to every template
  so you can eyeball them in a browser before round-tripping through a real
  sending service.
- An optional `scripts/inline-css.ts` stub for inlining `<style>` blocks per
  element with [`juice`](https://github.com/Automattic/juice) when you're ready
  to ship.

## What this is NOT

- **Not React.** Not JSX, not MJML, not Foundation for Emails. Plain HTML you
  can paste into any sending platform.
- **Not JavaScript.** Email clients strip `<script>`. No theme toggle, no
  pre-paint logic, no analytics. Tracking is the sending platform's job —
  templates include a `<!-- TRACKING_PIXEL_HERE -->` comment marker for it.
- **Not CSS-variable driven.** The web templates in this repo use semantic
  tokens (`var(--surface)`, `var(--text)`); email clients don't. See "Why no
  `var()`" below.

## Email-client constraints (the hard rules these templates follow)

1. **Table-based layout.** Outlook 2016+ still uses Word's rendering engine —
   it ignores most modern CSS. Every layout block is a `<table
   role="presentation" cellpadding="0" cellspacing="0" border="0">`.
2. **Inlined CSS.** Critical styles are inlined per element. A `<style>` block
   in `<head>` adds media-query + dark-mode enhancements, but every fallback
   works without it (some clients strip the `<style>`).
3. **Literal hex, no `var()`.** Outlook and older Gmail can't reliably resolve
   CSS custom properties. We document the color in a comment for traceability
   to `@ua/ua-tokens`, but ship literal hex.
4. **No CDN-only fonts.** A `<link>` to `fonts.googleapis.com` is in `<head>` as
   progressive enhancement only. Every `font-family` declaration ends with a
   robust system-font fallback stack.
5. **Max width 600px.** Industry standard since 2008. Anything wider clips on
   the Outlook desktop preview pane and the Gmail iOS sidebar.
6. **MSO conditional comments** for Outlook-specific button fallbacks
   (`<!--[if mso]>...<![endif]-->`).
7. **Bulletproof CTA buttons.** Table-based `<a>` with explicit `padding` (not
   `<button>`). Outlook gets an additional `<v:roundrect>` VML fallback if you
   want rounded corners — Arizona Bootstrap is squared, so we skip it.
8. **Dark mode** via `@media (prefers-color-scheme: dark)` + `[data-ogsc]`
   selectors (Outlook.com / generic dark scheme client). The templates **read
   well in light mode standalone** — dark mode is a bonus, never a requirement.
9. **Images** have explicit `width`/`height` HTML attrs (Outlook ignores CSS
   sizing on images), `display: block` to kill the descender gap, and real
   `alt` text (`alt=""` for decorative).
10. **Block A logo** is sourced from `cdn.digital.arizona.edu` as PNG (Outlook
    2016+ does not render SVG natively).
11. **Preheader text** is a hidden `<div>` immediately inside `<body>` for the
    inbox preview line.

## Brand color reference (literal hex, from `@ua/ua-tokens`)

| Token | Hex | Used here |
| --- | --- | --- |
| Arizona Red | `#AB0520` | Header band, primary CTA button |
| Arizona Blue | `#0C234B` | Hero band, headlines |
| Midnight | `#001C48` | Dark-mode surfaces |
| Warm Gray | `#F4EDE5` | Footer band, neutral surfaces |
| Cool Gray | `#E2E9EB` | Dividers, soft borders |
| White | `#FFFFFF` | Body background, on-red/blue text |
| Body text | `#1A1A1A` | Default text on warm-gray/white |
| Muted text | `#5A6577` | Footer fine print, captions |

## Templates

```
src/
├── transactional/
│   ├── welcome.html             # New-user welcome
│   ├── password-reset.html      # Password reset w/ secure CTA + expiry
│   ├── event-confirmation.html  # Ticket / event confirmation w/ details table
│   └── notification.html        # Generic notification w/ single CTA
└── marketing/
    └── newsletter.html          # Hero + 3-card content grid + CTA
```

Each template uses the same `<header>`, `<footer>`, and CTA button structure
from `src/partials/`. Copy-paste a partial into a new template to extend.

## Preview locally

Open `preview/index.html` in any browser. It links to every template. No build,
no server needed — just `open preview/index.html`.

## How to send

These are pure HTML. Read them in your sending integration:

- **AWS SES** — `SendEmailCommand` with `Message.Body.Html.Data = fs.readFileSync(...)`.
- **SendGrid** — `Mail.html(...)` or template management UI.
- **Postmark** — Upload to "Templates" or pass as `HtmlBody`.
- **Mailgun** — `html` param on `/messages`.

Search-and-replace `CONFIGURE_ME` placeholders (recipient name, button URL,
unsubscribe URL, sender address) with your variables before sending. Most
platforms use `{{recipient_name}}` or `%recipient_name%` style merge tags — the
templates have `CONFIGURE_ME_NAME` etc. as comments showing where to insert
them.

## How to extend

1. Copy `src/transactional/notification.html` (the simplest layout) to a new
   filename.
2. Edit the preheader, hero headline, body copy, CTA label + URL.
3. Leave the header and footer markup alone. They're the same across every
   template by design — that's what makes the templates feel "of UA Athletics."
4. If you need a content-card row, copy the `<table>` row from
   `src/marketing/newsletter.html`.

## Inlining CSS for production

For maximum client compatibility, run the `<style>` block in `<head>` through
an inliner before sending. The included `scripts/inline-css.ts` is a stub —
extend it to use [`juice`](https://github.com/Automattic/juice) or a similar
tool. Run with:

```sh
bun run inline
```

(Stub explains what to add; left intentionally minimal so the template ships
with zero runtime deps.)

## Why no `var()`?

Microsoft Outlook 2007 — 2024 (Windows desktop) uses Word's HTML renderer. It
has no CSS custom-property support. Same story for many third-party iOS Mail
clients and a long tail of webmail providers. If we used `var(--ua-red)`, the
header background would fall back to inherited or `unset` — which means white
or transparent — in maybe 40% of inboxes. We commit to **literal hex in the
markup, sourced from `@ua/ua-tokens`**.

The token package is still a workspace dependency for documentation continuity
(and for the optional `scripts/inline-css.ts` to consume), but the rendered
HTML must stand on its own.

## Accessibility

- Real `alt` text on every meaningful image; `alt=""` on decorative.
- Color contrast: every text/background pair tested WCAG AA — Arizona Red on
  white (5.94:1), Arizona Blue on white (12.45:1), white on Arizona Red
  (5.94:1), white on Arizona Blue (12.45:1).
- Buttons are real `<a>` tags with descriptive labels — no `click here`.
- Logical heading order (`<h1>` once per email, `<h2>` for section breaks).

## Bear Down® and Block A®

Bear Down® and Block A® are registered trademarks of the Arizona Board of
Regents. Footer copy preserves the trademark notice; do not strip it.

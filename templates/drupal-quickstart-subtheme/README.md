# @ua/template-drupal-quickstart-subtheme

University of Arizona Athletics starter — a **Drupal 10/11 subtheme of `arizona_bootstrap`**, the base theme shipped with the [Arizona Quickstart](https://github.com/az-digital/az_quickstart) distribution.

Per UA Marcom: **Arizona Quickstart is the official Drupal distro for `arizona.edu` sites.** This subtheme is the most important template in the repo — it is the canonical surface for any UA Athletics property built on Drupal.

For the full design-system contract (six components, hard don'ts, token discipline) read [`/AGENTS.md`](../../AGENTS.md) before changing anything.

## Stack

- **Drupal** 10 or 11 (Drupal 9 EOL).
- **Arizona Quickstart** 3.3.6+ (provides the `arizona_bootstrap` base theme).
- **Arizona Bootstrap** 5.1.3 (rides in with the base theme — provides `--bs-red`, `--bs-blue`, `--bs-warm-gray`, `.background-wrapper.text-bg-red.bg-triangles-top-left`, etc.).
- **Twig 3** for templates.
- **Vanilla JS** + Drupal.behaviors for the theme toggle.
- **`@ua/ua-tokens`** — only when the host site layers `tokens.css` in (optional; the base theme alone covers most cases).

## Install in an Arizona Quickstart 3.x site

1. Place this folder at `web/themes/custom/ua_athletics_starter/`.
2. Enable it: `drush theme:enable ua_athletics_starter`.
3. Make it default: `drush config:set system.theme default ua_athletics_starter`.
4. Cache rebuild: `drush cr`.
5. Place blocks per region in `/admin/structure/block` (System branding into the brand band, Main menu into `primary_menu`, footer links into `footer_second…footer_fifth`, social into `footer_bottom`).
6. (Optional) Add `@ua/ua-tokens` CSS via `libraries.yml` if you want the semantic-token layer.

## File map

```
ua_athletics_starter/
├── ua_athletics_starter.info.yml          # Subtheme manifest (base theme, regions, libraries)
├── ua_athletics_starter.libraries.yml     # Global CSS + JS asset library
├── ua_athletics_starter.theme             # PHP preprocess hooks (FOUC-safe dark-mode SSR)
├── composer.json                          # Declares this as a drupal-theme package
├── package.json                           # Bun workspace metadata
├── css/style.css                          # UA overrides — zero hex values
├── js/theme.js                            # Drupal.behaviors light/dark cycle toggle
├── images/
│   ├── block-a.svg                        # Placeholder Block A on white substrate
│   └── screenshot.png                     # Drupal admin theme-list thumbnail (placeholder)
└── templates/
    ├── layout/
    │   ├── page.html.twig                 # Full canonical page composition
    │   ├── region--header.html.twig       # Secondary header band wrapper
    │   ├── region--highlighted.html.twig  # Hero — text-bg-red bg-triangles-top-left
    │   ├── region--footer-first.html.twig # Brand/address column
    │   ├── region--footer-second.html.twig
    │   ├── region--footer-third.html.twig
    │   ├── region--footer-fourth.html.twig
    │   ├── region--footer-fifth.html.twig # Newsletter column (default form)
    │   └── region--footer-bottom.html.twig # Social-icons strip
    ├── node/
    │   └── node--teaser.html.twig         # Card teaser with red small-caps eyebrow
    └── block/
        └── block--system-branding-block.html.twig  # Block A + Arizona Athletics lockup
```

## Six-component checklist (per [`/docs/COMPONENTS.md`](../../docs/COMPONENTS.md))

- **Header** — `.arizona-header.bg-red` in `page.html.twig` with CDN wordmark + mobile offcanvas.
- **Hero** — `.background-wrapper.text-bg-red.bg-triangles-top-left` in `region--highlighted.html.twig`. Bear Down. Build Up. fallback when empty.
- **Toolbar** — thin `.bg-warm-gray` band in `page.html.twig` (`featured_top` region). Site builders place a menu block here.
- **Card** — `node--teaser.html.twig` renders `.card.border-0.shadow-sm.rounded-3.h-100` with red small-caps eyebrow.
- **Footer** — 5-column grid + bottom legal strip in `page.html.twig`. Legal line is the required UA trademark string.
- **ThemeToggle** — `Drupal.behaviors.uaAthleticsThemeToggle` cycles system → light → dark → system. Server preserves choice via `ua-theme` cookie read in `ua_athletics_starter_preprocess_html()`.

## Dark mode

- Server-side: `ua_athletics_starter_preprocess_html()` reads the `ua-theme` cookie and stamps `data-bs-theme` / `data-theme` / `data-theme-mode` onto `<html>` so the first paint is correct.
- Client-side: `js/theme.js` re-resolves system preference (the server can't read that), listens for OS changes while in `system` mode, and writes both `localStorage["ua-theme"]` AND the cookie on every toggle so SSR stays in sync.
- The base theme (`arizona_bootstrap`) already handles Bootstrap 5.3's `[data-bs-theme="dark"]` flip via `--bs-body-bg` / `--bs-body-color`. Do not add component-level dark overrides here.

## Auth — UA WebAuth/NetID via SAML

UA does not run Cognito; Drupal sites federate to the central UA SAML IdP via [`drupal/simplesamlphp_auth`](https://www.drupal.org/project/simplesamlphp_auth). The pattern below goes in `settings.php` (or, better, `settings.local.php`). Real values are `CONFIGURE_ME` — fill them in via your deployment process and never commit them.

```php
// settings.php — UA SAML auth (CONFIGURE_ME values via deploy secrets, never commit)
$settings['simplesamlphp_auth.entity_id']         = 'CONFIGURE_ME_SP_ENTITY_ID';     // e.g. https://athletics.arizona.edu/shibboleth
$settings['simplesamlphp_auth.idp_entity_id']     = 'CONFIGURE_ME_UA_IDP_ENTITY_ID'; // urn:mace:incommon:arizona.edu
$settings['simplesamlphp_auth.idp_metadata_url']  = 'CONFIGURE_ME_UA_IDP_METADATA_URL';
$settings['simplesamlphp_auth.user_name_attr']    = 'eduPersonPrincipalName';
$settings['simplesamlphp_auth.mail_attr']         = 'mail';
$settings['simplesamlphp_auth.auto_login']        = FALSE;
```

See [`/docs/AUTH.md`](../../docs/AUTH.md) for the engagement process. UA UITS / Marcom owns the IdP metadata; request federation by emailing `webauth@arizona.edu`.

## `// CONFIGURE_ME` items

| Where | What |
| --- | --- |
| `images/block-a.svg` | Placeholder. Replace with the licensed Athletics Block A from UA Marcom (`brand.arizona.edu` / `web@arizona.edu`). |
| `images/screenshot.png` | 4×4 red placeholder. Replace with a 588×438 preview before submitting to a multi-site theme picker. |
| Typekit `<link>` in `html.html.twig` (override or via base theme's settings) | Requires UA Marcom clearance. Email `web@arizona.edu`. See [`/docs/TYPOGRAPHY.md`](../../docs/TYPOGRAPHY.md). |
| `settings.php` SAML block above | UA IdP metadata + service-provider entity ID. |

## Hard don'ts

- Do not hardcode hex values in `css/style.css`. Use Arizona Bootstrap CSS custom properties (`--bs-red`, `--bs-blue`, `--bs-warm-gray`, ...) or `@ua/ua-tokens` semantic tokens.
- Do not bake in Wilbur, the cat face, team lockups, or Bear Down Bold. Athletics-only, licensed per team — never in the starter.
- Do not recolor / stretch / crop the Block A, use it as a letter in a word, or place it on a colored background without its white substrate.
- Do not ship stock athlete photography or maroon/purple/gold wardrobe imagery.
- Do not use Drupal 9. Drupal 10 minimum.
- Do not bypass `arizona_bootstrap` — this is a *subtheme*, not a *fork*. Override via `templates/` and `css/style.css`, never by editing the base theme in place.
- Do not commit real Cognito / SAML / Typekit values. `// CONFIGURE_ME` only.

## Verification

This subtheme is read-only-verifiable in this repo — full validation requires a running LAMP + Drupal stack:

```bash
# Composer require this theme into a Quickstart project
composer require uarizona-athletics/ua-athletics-starter
drush theme:enable ua_athletics_starter
drush config:set system.theme default ua_athletics_starter
drush cr
# Visit /<front> — you should see the Bear Down hero, blue navbar, and 5-col footer.
```

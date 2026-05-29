---
name: ua-build-site
description: Build a new University of Arizona Athletics web site, page, app, or starter project from scratch using the UA Athletics templates, @ua/ua-tokens, UA Marcom brand guidance, Arizona Digital conventions, semantic tokens, the six shared components, and light/dark verification. Use when the user asks to create or scaffold a new UA Athletics web experience.
---

# UA Build Site

Build new UA Athletics web work from the shared template repo instead of
recreating the brand by hand.

Source repo:
`https://github.com/Arizona-Athletics/arizona-athletics-web-templates`

## First moves

1. If you are inside this repo, run `$ua-standards-check` or read
   `skills/ua-standards-check/SKILL.md` and perform that read-only audit
   before non-trivial new-site work.
2. Load `docs/LLM_GUIDE.md` first. Then load only the docs needed for the task:
   `docs/COLORS.md`, `docs/TYPOGRAPHY.md`, `docs/COMPONENTS.md`,
   `docs/DARK_MODE.md`, and `docs/AUTH.md` for auth.
3. If this repo is not local, pull only the needed template or docs from the
   source repo. Do not paste broad brand guidance into the target project.

## Pick a template

Use the user's stack if they named one. Otherwise choose the closest fit:

| Need | Template |
| --- | --- |
| React app | `react-vite-plus` |
| Next.js app | `nextjs-app-router` |
| Static/editorial site | `astro` |
| Plain HTML with Bootstrap | `html-bootstrap5` |
| Plain HTML with Tailwind | `html-tailwind` |
| API or server-rendered app | `node-express-ts` |
| Drupal subtheme | `drupal-quickstart-subtheme` |
| Hugo site | `hugo` |
| Transactional email | `email-html` |

Pull a template without cloning the full repo:

```bash
bunx giget gh:Arizona-Athletics/arizona-athletics-web-templates/templates/<slug> <target-dir>
```

Each template carries a minimal vendored `@ua/ua-tokens` package at
`vendor/ua-tokens`, so the extracted folder is self-contained and does not
need the monorepo workspace. Then run Bun, not npm/yarn/pnpm:

```bash
cd <target-dir>
bun install
bun run build
```

Some non-JS templates use a different final command:

| Template | Final command |
| --- | --- |
| `html-bootstrap5` | `bun run dev` or open the folder with a static server |
| `email-html` | `bun run check`, then open `preview/index.html` |
| `drupal-quickstart-subtheme` | move into `web/themes/custom/ua_athletics_starter`, then `bun run lint` if local PHP tooling is available |
| `hugo` | requires Hugo extended; `bun run build` after `bun install` |

## Build rules

- Consume `@ua/ua-tokens`; never hardcode UA colors.
- Use semantic tokens for structure: `--bg`, `--surface`, `--text`,
  `--text-strong`, `--text-muted`, `--border`, `--link`, `--accent`,
  `--accent-hover`, `--on-accent`.
- Use brand tokens such as `--ua-red` and `--ua-blue` only for deliberate
  identity accents.
- Build web pages from the six shared components: `Header`, `Hero`, `Toolbar`,
  `Card`, `Footer`, `ThemeToggle`. For `email-html`, follow the documented
  no-JavaScript exception and use the email-safe partials.
- Ship the FOUC-safe theme script from `docs/DARK_MODE.md`.
- Use Proxima Nova / Garamond Premier Pro / system mono only. Leave Typekit kit
  IDs as `CONFIGURE_ME` unless the human provides a cleared ID.
- Mark real-world values as `CONFIGURE_ME`: logos, social URLs, analytics,
  Cognito pool IDs, client IDs, IdP URLs, contact info.
- Do not invent UA logos, UA-specific IDs, Typekit IDs, copy voice, or contact
  details.
- Keep both `--ua-*` and `--az-*` aliases when working with Arizona Digital or
  existing Bootstrap/Quickstart consumers.

## Implementation flow

1. Identify the target platform, audience, pages, content source, auth needs,
   and deployment constraints.
2. Pull the closest template and keep its conventions. Do not rewrite
   `@ua/ua-tokens` back to `workspace:*` in a standalone project; keep
   `file:./vendor/ua-tokens` until the package is published to npm.
3. Replace placeholder content with the user's content while preserving the six
   shared component skeleton.
4. Wire tokens through the template's native path: CSS variables, Tailwind
   preset, SCSS, or TypeScript export.
5. Add only project-specific components when the six shared components do not
   cover the workflow. Put them in the template's native component/partial
   directory and keep them token-driven.
6. Run the template's build/check scripts.
7. Verify light, dark, and system theme states. For browser apps, inspect the
   rendered page at desktop and mobile widths before calling it done.

## Output standard

Finish with:

- What template or stack was used.
- What commands passed.
- Any `CONFIGURE_ME` values the human still needs to supply.
- Any source or external latest-claims you relied on.

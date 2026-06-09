---
name: ua-athletics-web
description: Portable single-file UA Athletics web skill bundle. Use when the user asks for one skill that works across Codex, Claude Code, Grok Build, ChatGPT web, or Claude web, or when focused UA Athletics skills are unavailable. Routes standards audits, new-site builds, and existing-site compliance work to the embedded workflows.
---

# UA Athletics Web Skill Bundle

This file is generated from the focused source skills in `skills/`. It is
intentionally plain Markdown with minimal YAML frontmatter so it can be used by
Codex, Claude Code, Grok Build, Claude on the web, and ChatGPT as a project or
knowledge file.

Source repo:
`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills`

## How to use this skill

Prefer the focused source skills when they are available locally. They are
smaller, easier to maintain, and should be considered the source of truth.

When local files are available, route the task like this:

| User asks for | Read and follow |
| --- | --- |
| Check whether repo standards are still current, audit drift, latest brand/framework versions | `skills/ua-standards-check/SKILL.md` |
| Build, scaffold, or create a new UA Athletics site/app/page/template | `skills/ua-build-site/SKILL.md` |
| Convert, fix, modernize, or refactor an existing site into UA Athletics compliance | `skills/ua-site-compliance/SKILL.md` |

If those files are not available, use the embedded fallback workflows below.
When this file is uploaded to a web chat surface with no filesystem access, the
embedded fallbacks are the working instructions.

## Shared non-negotiables

- Consume from `@ua/ua-tokens`. Never hardcode UA colors.
- Default to semantic tokens: `--bg`, `--surface`, `--text`,
  `--text-strong`, `--text-muted`, `--border`, `--link`, `--accent`,
  `--accent-hover`, `--on-accent`.
- Use brand tokens such as `--ua-red` and `--ua-blue` only for deliberate
  identity accents.
- Build from the six shared components: `Header`, `Hero`, `Toolbar`,
  `Card`, `Footer`, `ThemeToggle`.
- Use Proxima Nova / Garamond Premier Pro / system mono only. Leave Typekit kit
  IDs as `CONFIGURE_ME` unless the human provides a cleared ID.
- Mark real-world values as `CONFIGURE_ME`: logos, social URLs, analytics,
  Cognito pool IDs, client IDs, IdP URLs, contact info.
- Do not invent UA logos, UA-specific IDs, Typekit IDs, copy voice, or contact
  details.
- Keep both `--ua-*` and `--az-*` aliases when working with Arizona Digital
  or existing Bootstrap/Quickstart consumers.
- Use Bun for JavaScript installs and scripts in this repo. Do not switch to
  npm, yarn, or pnpm unless the user explicitly asks.

## Platform notes

- Claude web, no-upload repo-link mode: when the user gives the GitHub repo URL,
  read `CLAUDE_WEB.md` first if it is available, then read this file from
  `SKILL.md` or `skills/ua-athletics-web/SKILL.md`, and follow it in the
  current chat or Claude Project. Do not tell the user they must upload a ZIP
  just to use this repo as skill context. This is not a persistent native
  custom-skill install; it is the repo-link workflow for Claude web sessions.
- Claude web, persistent native skill mode: if the user specifically wants the
  skill permanently added to Claude.ai's custom skill list, use
  `claude-web/ua-athletics-web.zip`, or any ZIP whose root contains
  `ua-athletics-web/SKILL.md`.
- ChatGPT web: read this file from the repo, upload it as project/custom GPT
  reference material, or paste the instructions into the project/GPT
  instructions.
- Claude Code, Codex, Grok Build, and other local coding agents: install this
  folder as `ua-athletics-web/SKILL.md` in the platform skill directory. Prefer
  the focused source skills when available.
- If the web surface cannot execute shell commands or read GitHub directly, ask
  the user to attach the repo zip or the files needed for the specific workflow.

# Embedded source skill: ua-standards-check

Description: Audit this repo against the latest UA Athletics design standards. Fetches current UA Marcom brand standards, Arizona Digital releases (arizona-bootstrap, az_quickstart), and major framework versions (Bun, TypeScript, React, Next, Astro, Vite+, Tailwind, Bootstrap), then diffs them against what is documented in this repo. Surfaces drift so tokens and docs stay current. Read-only — proposes changes, never auto-edits.

Source file: `skills/ua-standards-check/SKILL.md`

# UA Standards Freshness Check

You are auditing `Arizona-Athletics-Skills` against authoritative external
sources. The repo's whole purpose is to be the canonical UA Athletics baseline —
which only works if the sources behind it are still current.

**You are read-only.** Report drift, propose updates, but never edit `tokens.json`,
docs, or `package.json` files in this run. The human reviews and decides.

## Prerequisites

Network access plus either the `gh` CLI **or** plain `curl`. Every check below
has a no-auth `curl` fallback — never skip a check just because `gh` is missing
or unauthenticated.

## What to check

Check these three groups. Use parallel WebFetch / Bash calls where possible to
keep this fast.

### 1. UA Marcom + brand standards

Fetch and skim:

- `https://marcom.arizona.edu/brand-guidelines/colors` — canonical palette
- `https://marcom.arizona.edu/brand-guidelines/typography` — canonical type
- `https://marcom.arizona.edu/applying-brand/web` — web standards (confirms
  Quickstart / Arizona Digital as the prescribed framework)
- Legacy URLs 301-redirect here (as of June 2026): `brand.arizona.edu` and
  `marcom.arizona.edu/applying-the-brand/*`. Follow redirects; flag if the
  target changes again.

Compare against:

- `packages/ua-tokens/tokens.json` — brand palette hex values
- `docs/COLORS.md` — palette table
- `docs/TYPOGRAPHY.md` — font families, Typekit kit ID convention

Flag any of:

- Hex value drift on a named brand color
- New official brand color added
- Removed or renamed color
- Type-family change (e.g. if Marcom switches off Proxima Nova)
- Updated logo / wordmark guidance

### 2. Arizona Digital projects

Use the `gh` CLI, or the public GitHub API via `curl` if `gh` is unavailable:

```bash
gh release list --repo az-digital/arizona-bootstrap --limit 5
gh release list --repo az-digital/az_quickstart --limit 5

# No gh? Same data, no auth needed:
curl -s "https://api.github.com/repos/az-digital/arizona-bootstrap/releases?per_page=5"
curl -s "https://api.github.com/repos/az-digital/az_quickstart/releases?per_page=5"
```

Compare to the versions cited in `PLAN.md` and `README.md` (currently AZ Digital
Bootstrap 5.1.3 and Arizona Quickstart 3).

Flag any major-version bump or any release in the last 90 days the repo hasn't
acknowledged.

### 3. Major framework versions

For each of these, find the latest stable release and compare to what the repo
declares. Run in parallel:

```bash
bun pm view react version             # also: react-dom, next, astro, tailwindcss, bootstrap
gh release list --repo oven-sh/bun --limit 3
gh release list --repo vitejs/vite-plus --limit 3   # Vite+ is in preview; check VoidZero's channel if not on GitHub
gh release list --repo microsoft/TypeScript --limit 3
```

No `gh` or no `bun pm view`? Use the npm registry and GitHub API directly:

```bash
curl -s "https://registry.npmjs.org/react/latest"   # .version; also next, astro, tailwindcss, bootstrap, typescript
curl -s "https://registry.npmjs.org/-/package/next/dist-tags"   # when "latest" looks like a preview, check the stable line
curl -s "https://api.github.com/repos/oven-sh/bun/releases?per_page=3"
curl -s "https://api.github.com/repos/microsoft/TypeScript/releases?per_page=3"
```

Frameworks to check:

- Bun (currently 1.3.14 per `package.json`)
- TypeScript (currently 5.7 per `tsconfig.base.json` + `package.json`)
- React (target 19.2)
- Next.js (target 16.2)
- Astro (target 6)
- Vite+ (in preview — note status, not just version)
- Tailwind (target 4.3 Oxide)
- Bootstrap (target 5.3)

## Output format

A single markdown report with two parts.

### Part 1 — drift table

| Source | This repo says | Latest available | Drift | Where it's documented |
| --- | --- | --- | --- | --- |
| Arizona Red `#AB0520` | `#AB0520` | `#AB0520` (per marcom.arizona.edu/brand-guidelines/colors) | none | `tokens.json`, `BRAND.md` |
| arizona-bootstrap | 5.1.3 | 5.2.0 | minor | `PLAN.md`, `README.md` |
| React | 19.2 | 19.4 | minor | `PLAN.md` |
| Vite+ | preview | preview / GA | varies | `README.md` |

Use one row per item checked. Drift values: `none`, `minor`, `major`, or
`unreachable` (with a one-word reason — `404`, `auth-required`, `timeout`).

### Part 2 — action list

A short bulleted list of proposed changes, one bullet per file to edit:

- `packages/ua-tokens/tokens.json` — bump `brand.<name>` from `#OLD` to `#NEW`
- `PLAN.md` — update Bootstrap 5.3 → 5.4
- `docs/TYPOGRAPHY.md` — note new Marcom guidance on serif use

Then ask the human: "Apply these changes?" and stop. Do not edit anything in
this run.

## What you must NOT do

- **Don't edit any file.** This is a diff/report skill, not an apply skill.
- **Don't fetch UA-internal URLs.** No `*.arizona.edu` admin / SSO / intranet endpoints.
- **Don't include secrets or auth values** in the report. If a fetch needs auth, mark it `auth-required` and move on.
- **Don't claim "the latest"** without a citation — every "latest" value in the table needs a source (GitHub release URL, npm registry, marcom.arizona.edu page).
- **Don't run more than ~15 fetches.** Batch in parallel where possible. If a source is unreachable, report it and move on; don't retry.
- **Don't second-guess intentional choices.** Vite+ is in preview *on purpose*; flag the status, don't propose downgrading to vanilla Vite.

## When to invoke this

- Before starting a new template PR — confirm the foundation hasn't shifted.
- Before publishing a new `@ua/ua-tokens` version.
- Quarterly, as a hygiene check.
- Whenever the human asks "is this still current?"

---

# Embedded source skill: ua-build-site

Description: Build a new University of Arizona Athletics web site, page, app, or starter project from scratch using the UA Athletics templates, @ua/ua-tokens, UA Marcom brand guidance, Arizona Digital conventions, semantic tokens, the six shared components, and light/dark verification. Use when the user asks to create or scaffold a new UA Athletics web experience.

Source file: `skills/ua-build-site/SKILL.md`

# UA Build Site

Build new UA Athletics web work from the shared template repo instead of
recreating the brand by hand.

Source repo:
`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills`

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
bunx giget gh:Arizona-Athletics/Arizona-Athletics-Skills/templates/<slug> <target-dir>
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

---

# Embedded source skill: ua-site-compliance

Description: Audit and refactor an existing web site, app, template, or page so it complies with University of Arizona Athletics design standards, UA Marcom brand guidance, Arizona Digital conventions, @ua/ua-tokens, semantic color tokens, the six shared components, dark mode behavior, accessibility expectations, and safe auth placeholders. Use when the user asks to redo, modernize, fix, convert, or bring a site into UA Athletics compliance.

Source file: `skills/ua-site-compliance/SKILL.md`

# UA Site Compliance

Bring an existing site into the UA Athletics system without rewriting unrelated
behavior.

Source repo:
`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills`

## First moves

1. Identify the stack, package manager, build commands, styling system, and
   rendered entry points.
2. If the work is non-trivial, run `$ua-standards-check` or read
   `skills/ua-standards-check/SKILL.md` and perform that read-only audit.
3. Load `docs/LLM_GUIDE.md`, then only the focused docs needed:
   `docs/COLORS.md`, `docs/TYPOGRAPHY.md`, `docs/COMPONENTS.md`,
   `docs/DARK_MODE.md`, and `docs/AUTH.md` if auth exists.
4. Preserve content, URLs, behavior, analytics hooks, form semantics, and CMS
   integration unless the user asks to change them.

## Audit checklist

Search for:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(" .
rg -n "bg-(gray|slate|zinc|neutral)|text-(gray|slate|zinc|neutral)|border-(gray|slate|zinc|neutral)" .
rg -n "font-family|Inter|Roboto|Open Sans|Helvetica" .
rg -n "dark:|prefers-color-scheme|data-theme|data-bs-theme" .
rg -n "COGNITO_CLIENT_SECRET|AWS_SECRET|client_secret|poolId|userPoolId|identityProvider" .
```

Also inspect:

- Whether `@ua/ua-tokens` or generated `tokens.css` is loaded.
- Whether the page has `Header`, `Hero`, `Toolbar`, `Card`, `Footer`, and
  `ThemeToggle` equivalents.
- Whether body text, surfaces, links, borders, focus rings, and buttons use
  semantic tokens.
- Whether any UA logo, wordmark, Typekit kit ID, Cognito ID, social URL, or
  contact value was guessed instead of provided.
- Whether light/dark first paint is safe and does not require JS after render to
  correct colors.

## Refactor rules

- Replace raw UA colors and generic grays with semantic tokens.
- Keep brand tokens only for isolated identity accents.
- Do not write manual dark-mode color overrides; fix token usage instead.
- Use the existing framework's idioms. Do not migrate stacks just to comply.
- Add `@ua/ua-tokens` through the target stack's normal package path when the
  project can consume packages. If it cannot, copy or reference the compiled
  token CSS in the least surprising existing asset pipeline.
- For email templates, literal hex output is acceptable only when sourced from
  `@ua/ua-tokens`; document that source in comments or build scripts.
- Keep `--az-*` aliases in Arizona Digital / Bootstrap / Quickstart projects.
- Replace guessed UA-specific values with `CONFIGURE_ME` markers.
- Never commit client-side secrets or Cognito client secrets.

## Implementation flow

1. Run the app or inspect screenshots before changing styles, when feasible.
2. Make a small compliance map: token loading, typography, components, theme,
   assets, auth/secrets, and verification gaps.
3. Patch the narrowest files that correct those gaps.
4. Run tests, build, lint/typecheck, and any existing formatting command.
5. For browser apps, verify at least one representative page in light and dark
   mode at desktop and mobile widths.
6. Report any remaining non-compliance that needs a human-supplied asset, ID, or
   business decision.

## Output standard

Finish with:

- Main compliance changes made.
- Commands and visual checks that passed.
- Remaining `CONFIGURE_ME` items or human decisions.
- Any deliberate exceptions, especially email hex output or legacy `--az-*`
  compatibility.

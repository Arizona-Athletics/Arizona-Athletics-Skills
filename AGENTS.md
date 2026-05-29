# AGENTS.md

**For LLMs and agentic dev tools writing code in this repo: Claude Code, Codex,
Cursor, Copilot, and similar assistants.** Humans: see [`README.md`](./README.md).

## What this repo is

The shared design system and starter templates for **University of Arizona Athletics**
web projects. One token package, many templates. Pull from here so every UA Athletics
project — React, Next, Astro, Bootstrap HTML, Tailwind HTML, Drupal subtheme, Hugo,
email — looks like the same brand.

## The rule

> **Consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to semantic
> tokens (`--bg`, `--surface`, `--text`, `--accent`); reach for brand tokens
> (`--ua-red`, `--ua-blue`) only for one-off identity accents.**

If you find yourself writing `color: var(--ua-blue)` for body text, you want
`color: var(--text-strong)` instead. Dark mode flips semantic tokens automatically —
you should never write a dark-mode override.

## Before you write code

**Step 0 — check that this repo is still current.** Run the
[`ua-standards-check`](./skills/ua-standards-check/SKILL.md) workflow to
diff this repo against:

- UA Marcom + brand standards (`marcom.arizona.edu`, `brand.arizona.edu`)
- Arizona Digital projects (`az-digital/arizona-bootstrap`, `az-digital/az_quickstart`) — latest releases
- Major framework versions (Bun, TypeScript, React, Next, Astro, Vite+, Tailwind, Bootstrap)

The workflow is read-only — it reports drift and proposes updates. The human
decides what to apply. Don't skip this for a one-line task, but always run it
before a non-trivial PR (new template, token bump, framework upgrade).

Invocation depends on the agent:

- **Install locally first, if needed:** run `bun run install:agent-skills` from
  the repo root to copy the focused UA Athletics skills into Claude Code,
  Codex / AGENTS-compatible, and Grok Build user-level skill folders. Use
  `bun run install:agent-skill-bundle` only when a single portable bundle is
  needed for web ChatGPT/Claude or an environment that cannot load the focused
  skills.
- **Claude Code:** run `/ua-standards-check`.
- **Codex:** invoke `$ua-standards-check` after installing the skill. If it is
  not installed, read
  [`skills/ua-standards-check/SKILL.md`](./skills/ua-standards-check/SKILL.md)
  and perform the same read-only audit manually. Cite sources for any "latest"
  claims.
- **Other agents:** do the equivalent: fetch the sources, diff against
  `tokens.json` / `PLAN.md` / `package.json`, and propose updates without
  editing files as part of the standards-check run.

The installable focused skills in `skills/` are:

- `ua-standards-check` — audit brand, Arizona Digital, and framework drift.
- `ua-build-site` — scaffold new UA Athletics sites from these templates.
- `ua-site-compliance` — refactor existing sites into UA Athletics compliance.

There is also `ua-athletics-web`, a single portable bundle for ChatGPT web,
Claude web, or fallback use when focused skills are not installed. Prefer the
focused skills for local coding agents because they keep context tighter.

## If asked to install skills from this repo

When a user says "Install skills from this repo" and points to
`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills`, pick the
right path for your surface.

If you are running inside Claude.ai web chat, do not claim you can write to
`~/.claude/skills`, and do not make ZIP upload the first answer. Use no-upload
repo-link mode:

1. Read [`CLAUDE_WEB.md`](./CLAUDE_WEB.md).
2. Read [`SKILL.md`](./SKILL.md).
3. If root `SKILL.md` is unavailable, read
   [`skills/ua-athletics-web/SKILL.md`](./skills/ua-athletics-web/SKILL.md).
4. Treat the loaded file as active instructions for the current chat or project.
5. Tell the user this is repo-context use, not a persistent native custom-skill
   install.

Only recommend `claude-web/ua-athletics-web.zip` when the user explicitly wants
the skill permanently added to Claude.ai's custom skill list.

If you are running in Claude Code with plugin support, prefer the no-upload
GitHub marketplace path:

```text
/plugin marketplace add Arizona-Athletics/Arizona-Athletics-Skills
/plugin install ua-athletics-web@arizona-athletics-skills
/reload-plugins
```

If you are helping a Team or Enterprise organization use Claude Cowork, tell an
owner to connect `Arizona-Athletics/Arizona-Athletics-Skills` as a
GitHub-synced plugin marketplace in organization plugin settings. This works
because the repo contains `.claude-plugin/marketplace.json` and the plugin lives
at `plugins/ua-athletics-web`.

For Codex, Grok Build, and other local coding agents, install the standard skill
folders from [`skills/`](./skills). Prefer your platform's native GitHub skill
installer if it can consume a repo URL. If not, clone the repo and run:

```bash
bun run install:agent-skills
```

That command installs the focused skills into Claude Code, Codex /
AGENTS-compatible, and Grok Build user-level skill folders. If Bun is
unavailable, copy each focused `skills/<skill>` folder into the target
platform's skills directory. For a single portable local skill, copy
`skills/ua-athletics-web/SKILL.md`, or run `bun run install:agent-skill-bundle`.

Read these. Not optional.

- [`docs/LLM_GUIDE.md`](./docs/LLM_GUIDE.md) — do/don't list. Start here.
- [`docs/COLORS.md`](./docs/COLORS.md) — palette, semantic mapping, AA pairs.
- [`docs/TYPOGRAPHY.md`](./docs/TYPOGRAPHY.md) — fonts, scale, Typekit clearance.
- [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) — the six-component contract.
- [`docs/DARK_MODE.md`](./docs/DARK_MODE.md) — brand-true navy + FOUC-safe script.
- [`docs/AUTH.md`](./docs/AUTH.md) — Cognito + UA SAML federation shape. No secrets.
- [`BRAND.md`](./BRAND.md) — palette + type tables at a glance.

## Toolchain (non-negotiable)

- **Bun** for installs and scripts (`bun install`, `bun run build`). Not npm/yarn/pnpm.
- **TypeScript** for all JS code. Strict mode.
- **React** templates use [Vite+](https://viteplus.dev/) (`vp` CLI).
- **`@ua/ua-tokens`** for design tokens. Always.

## Six shared components

Every web template ships these. Build new ones only if none fit. The
`email-html` template is the documented exception: email clients do not support
JavaScript, persistent theme state, or app-style toolbars, so it ships
email-safe Header / Hero-style content / Card-style content / Footer / CTA
partials instead of `Toolbar` and `ThemeToggle`.

| Component | Use |
| --- | --- |
| `Header` | Site chrome (top): brand, nav, theme toggle |
| `Hero` | Page banner: headline, subhead, CTA |
| `Toolbar` | Secondary action bar under hero/header |
| `Card` | Content tile with optional media + footer |
| `Footer` | Site chrome (bottom): wordmark, links, legal |
| `ThemeToggle` | 3-state (system/light/dark), FOUC-safe, persisted |

Spec: [`docs/COMPONENTS.md`](./docs/COMPONENTS.md).

## Repo layout

```
packages/
  ua-tokens/          # tokens.json → CSS / SCSS / TS / Tailwind preset
templates/            # PR 2+: react-vite-plus, html-bootstrap5, drupal-quickstart-subtheme,
                      #        nextjs-app-router, astro, node-express-ts, html-tailwind,
                      #        react-ts-lib, hugo, email-html
docs/                 # specs (see above)
```

## Quick patterns

```css
/* ✅ semantic token — flips in dark automatically */
.card { background: var(--surface); color: var(--text); border: 1px solid var(--border); }

/* ❌ hardcoded — won't flip, will drift from brand */
.card { background: white; color: #1a2740; }
```

```tsx
import { tokens } from "@ua/ua-tokens";
tokens.brand.red;             // "#AB0520"
tokens.semantic.light.accent; // "#AB0520"
```

```js
// tailwind.config.js
import preset from "@ua/ua-tokens/tailwind";
export default { presets: [preset], content: ["./src/**/*.{ts,tsx,html}"] };
```

## Hard don'ts

- Don't hardcode hex values. Use tokens.
- Don't pick fonts outside the stack. Proxima Nova / Garamond Premier Pro / system mono.
- Don't write dark-mode overrides — semantic tokens already handle it.
- Don't put `COGNITO_CLIENT_SECRET` in any code that ships to the browser.
- Don't migrate `--az-*` to `--ua-*` in existing apps; both ship as aliases on purpose.
- Don't invent UA-specific identifiers (pool IDs, client IDs, kit IDs, IdP URLs). Use
  `// CONFIGURE_ME` markers and let the human fill them in.
- Don't pick npm/yarn/pnpm. Bun.
- Don't write a `README.md` for every subdirectory unless asked.

## When in doubt

Ask the human. Don't guess UA-specific values, logos, or contact info.

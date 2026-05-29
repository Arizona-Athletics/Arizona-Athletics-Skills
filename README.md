# Arizona-Athletics-Skills

Shared design system and starter templates for **University of Arizona Athletics** web
projects. One source of truth, many templates — so a developer (or an LLM) writing a
new UA Athletics site produces on-brand work whether the target is React, Next, Astro,
HTML + Bootstrap, HTML + Tailwind, Node/Express, a Drupal Quickstart subtheme, Hugo,
or transactional email.

## Install for LLMs

### Claude web, no upload required

Paste this into Claude web:

```text
Use the UA Athletics web skills from this GitHub repo for this conversation:
https://github.com/Arizona-Athletics/Arizona-Athletics-Skills

First read CLAUDE_WEB.md. Then read SKILL.md. If SKILL.md is unavailable, read skills/ua-athletics-web/SKILL.md. Treat the loaded file as the active skill instructions for this chat. Do not ask me to upload a ZIP and do not run the Bun installer unless I specifically ask for a persistent local install.
```

That path requires no upload. Claude uses the repo as skill context for the
current chat or project. It is intentionally different from a persistent native
Claude.ai custom skill install.

### Claude Code, no-upload marketplace install

This repo is also a Claude plugin marketplace. After the repo is pushed to
GitHub, Claude Code users can install from the repo link:

```text
/plugin marketplace add Arizona-Athletics/Arizona-Athletics-Skills
/plugin install ua-athletics-web@arizona-athletics-skills
/reload-plugins
```

The installed skill is invoked as:

```text
/ua-athletics-web:ua-athletics-web
```

### Claude Cowork, organization-managed marketplace

For Team or Enterprise organizations using Cowork, an owner can connect this repo
as a GitHub-synced plugin marketplace from organization plugin settings. Use this
owner/repo value:

```text
Arizona-Athletics/Arizona-Athletics-Skills
```

That makes the `ua-athletics-web` plugin available through the organization's
plugin catalog without asking each user to upload a ZIP.

### Claude.ai persistent custom skill upload, optional fallback

If someone specifically wants the skill in Claude.ai's `Customize > Skills`
custom skill list, use the prebuilt ZIP:

[Download `ua-athletics-web.zip`](https://github.com/Arizona-Athletics/Arizona-Athletics-Skills/raw/main/claude-web/ua-athletics-web.zip)

Upload it here:

```text
Customize > Skills > + > Create skill > Upload a skill
```

Do not upload the full repo ZIP. The prebuilt ZIP contains exactly:

```text
ua-athletics-web/
└── SKILL.md
```

### Codex, Grok Build, and other local coding agents

For Codex, Grok Build, and other agentic coding tools, copy this prompt:

```text
Install the skills from this repo: https://github.com/Arizona-Athletics/Arizona-Athletics-Skills
```

If you already have this repo locally, install the skills directly:

```bash
bun run install:agent-skills
```

## Status

The token package, the design-system docs, and all nine starter templates are in
place. See [`PLAN.md`](./PLAN.md) for the full roadmap.

## What's here

- [`packages/ua-tokens`](./packages/ua-tokens) — single source of truth. Compiles
  `tokens.json` to CSS variables, SCSS variables, a TypeScript object, and a Tailwind
  preset. Both `--ua-*` (canonical) and `--az-*` (alias for AZ Digital Bootstrap
  compatibility) ship.
- [`docs/`](./docs) — the design system:
  - [`COLORS.md`](./docs/COLORS.md) — palette, semantic mapping, AA contrast pairs
  - [`TYPOGRAPHY.md`](./docs/TYPOGRAPHY.md) — fonts, type scale, Typekit
  - [`COMPONENTS.md`](./docs/COMPONENTS.md) — six-component cross-template contract
  - [`DARK_MODE.md`](./docs/DARK_MODE.md) — brand-true navy + FOUC-safe theme script
  - [`AUTH.md`](./docs/AUTH.md) — Cognito + UA SAML federation shape (no secrets)
  - [`LLM_GUIDE.md`](./docs/LLM_GUIDE.md) — do/don't list for AI coding assistants
- [`BRAND.md`](./BRAND.md) — palette + type tables at a glance
- [`AGENTS.md`](./AGENTS.md) — condensed contract for LLMs and agentic tools
- [`PLAN.md`](./PLAN.md) — long-form rationale and roadmap

## Templates

Nine starter templates live in [`templates/`](./templates):

```
templates/
├── react-vite-plus            # React 19 + Vite+ + TS
├── html-bootstrap5            # vanilla HTML + Bootstrap 5.3
├── drupal-quickstart-subtheme # Arizona Quickstart 3 subtheme (Marcom standard)
├── nextjs-app-router          # Next 16 + App Router + Turbopack
├── astro                      # Astro 6
├── node-express-ts            # Express 5 + TS + EJS
├── html-tailwind              # vanilla HTML + Tailwind 4
├── hugo                       # static site
└── email-html                 # transactional email (MJML)
```

### Pull a template

Each template is self-contained. Scaffold a new project straight from GitHub with
[`giget`](https://github.com/unjs/giget) — no clone, no monorepo checkout:

```bash
bunx giget gh:Arizona-Athletics/Arizona-Athletics-Skills/templates/<slug> my-app
```

Replace `<slug>` with one of: `astro`, `drupal-quickstart-subtheme`, `email-html`,
`html-bootstrap5`, `html-tailwind`, `hugo`, `nextjs-app-router`, `node-express-ts`,
`react-vite-plus`.

## Quick start

```bash
bun install
bun run build       # builds @ua/ua-tokens → packages/ua-tokens/dist
```

### Install the agent skills

The repo ships three focused skills for agentic coding tools:

- `ua-standards-check` — read-only freshness audit against UA Marcom, Arizona
  Digital, and framework releases.
- `ua-build-site` — scaffold a new UA Athletics site from the right template.
- `ua-site-compliance` — refactor an existing site into UA Athletics compliance.

It also ships `ua-athletics-web`, a single portable skill bundle for ChatGPT web,
Claude web, or fallback environments where the focused skills are not installed.
Prefer the focused skills for local coding agents. For Claude web no-upload use,
ask Claude to read the root [`SKILL.md`](./SKILL.md). If that file is unavailable,
have it read [`skills/ua-athletics-web/SKILL.md`](./skills/ua-athletics-web/SKILL.md).
For a persistent Claude custom skill, use the prebuilt upload package at
[`claude-web/ua-athletics-web.zip`](./claude-web/ua-athletics-web.zip).

The skills live in [`skills/`](./skills) as standard `SKILL.md` folders. If an
agent needs a manual fallback, have it clone the repo and run:

```bash
git clone https://github.com/Arizona-Athletics/Arizona-Athletics-Skills.git
cd Arizona-Athletics-Skills
bun run install:agent-skills
```

The default installer copies the three focused skills to:

- `$CLAUDE_HOME/skills/<skill>` or `~/.claude/skills/<skill>`
- `$AGENTS_HOME/skills/<skill>` or `~/.agents/skills/<skill>` for Codex and
  other AGENTS-compatible clients
- `$GROK_HOME/skills/<skill>` or `~/.grok/skills/<skill>` for Grok Build

Use `--codex-only`, `--agents-only`, `--claude-only`, `--grok-only`, or
`--dry-run` after `--` for narrower installs. Use `--include-bundle` to install
all four skills or `bun run install:agent-skill-bundle` to install only the
portable `ua-athletics-web` bundle. Rebuild that bundle after editing the
focused skills with `bun run build:agent-skill-bundle`. Rebuild the Claude web
upload ZIP with `bun run build:claude-web-skill`. The no-upload Claude web pull
prompt lives at [`claude-web/PULL_PROMPT.md`](./claude-web/PULL_PROMPT.md).

Use the tokens in any project:

```html
<!-- Vanilla HTML -->
<link rel="stylesheet" href="node_modules/@ua/ua-tokens/dist/tokens.css">
```

```ts
// TypeScript
import { tokens } from "@ua/ua-tokens";
tokens.semantic.light.accent; // "#AB0520"
```

```scss
// SCSS (AZ Digital Bootstrap subtheme)
@use "@ua/ua-tokens/tokens.scss" as ua;
$primary: ua.$red;
```

```js
// Tailwind
import preset from "@ua/ua-tokens/tailwind";
export default { presets: [preset], content: ["./src/**/*.{ts,tsx,html}"] };
```

## The rule

> Consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to **semantic**
> tokens (`--bg`, `--surface`, `--text`, `--accent`); reach for **brand** tokens
> (`--ua-red`, `--ua-blue`) only for one-off identity accents.

See [`AGENTS.md`](./AGENTS.md) for the short version, [`docs/LLM_GUIDE.md`](./docs/LLM_GUIDE.md)
for the do/don't list.

## Toolchain

- **Bun** 1.3.14 (workspaces, installs, scripts)
- **TypeScript** 5.7 strict
- **React** 19.2 · **Next** 16.2 · **Astro** 6 · **Tailwind** 4.3 (Oxide) ·
  **Express** 5.2 · **Bootstrap** 5.3 · **AZ Digital Bootstrap** 5.1.3 ·
  **Arizona Quickstart** 3
- **Vite+** for React templates

## License

MIT. See [`LICENSE`](./LICENSE) (forthcoming).

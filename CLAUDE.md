# CLAUDE.md

This file is loaded automatically by Claude Code in this repo. It points to the
canonical instructions; keep this file thin and update [`AGENTS.md`](./AGENTS.md)
instead.

## You are working in `Arizona-Athletics-Skills`

The shared design system + starter templates for **University of Arizona Athletics**
web projects. Read [`AGENTS.md`](./AGENTS.md) for the full contract — what to do,
what to never do, and the sibling docs to consult.

## Step 0 — verify the standards are current

Before any non-trivial task, run the freshness audit:

```
/ua-standards-check
```

If the command is not installed in your user-level Claude Code skills, run
`bun run install:agent-skills` from the repo root. That installs the focused skill bundle:

- `ua-standards-check` for read-only freshness audits.
- `ua-build-site` for starting new UA Athletics sites from templates.
- `ua-site-compliance` for refactoring existing sites into compliance.

Use `bun run install:agent-skill-bundle` only when you need the single portable
`ua-athletics-web` skill for local fallback use. For Claude web no-upload use,
read the root `SKILL.md`; upload `claude-web/ua-athletics-web.zip` only when the
user wants a persistent native custom skill.

That skill ([`./skills/ua-standards-check/SKILL.md`](./skills/ua-standards-check/SKILL.md))
fetches UA Marcom + brand standards, Arizona Digital release feeds, and major
framework versions, then reports drift against this repo. **It is read-only** —
it proposes changes, never applies them. The human reviews and decides.

Skip it for a one-line typo fix. Always run it for:

- A new template PR
- A `@ua/ua-tokens` version bump
- A framework upgrade
- Any task that touches `tokens.json`, `PLAN.md`, or `package.json` versions

## The one-line rule (from [`AGENTS.md`](./AGENTS.md))

> Consume from `@ua/ua-tokens`. Never hardcode UA colors. Default to semantic
> tokens (`--bg`, `--surface`, `--text`, `--accent`); reach for brand tokens
> (`--ua-red`, `--ua-blue`) only for one-off identity accents.

## Toolchain

Bun · TypeScript strict · React via Vite+ · `@ua/ua-tokens` for tokens. Not npm/yarn/pnpm.

## Where to look

| Question | Doc |
| --- | --- |
| Full LLM contract | [`AGENTS.md`](./AGENTS.md) |
| Do / don't list | [`docs/LLM_GUIDE.md`](./docs/LLM_GUIDE.md) |
| Colors | [`docs/COLORS.md`](./docs/COLORS.md) |
| Type | [`docs/TYPOGRAPHY.md`](./docs/TYPOGRAPHY.md) |
| Components | [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) |
| Dark mode | [`docs/DARK_MODE.md`](./docs/DARK_MODE.md) |
| Auth (no secrets) | [`docs/AUTH.md`](./docs/AUTH.md) |
| Brand at a glance | [`BRAND.md`](./BRAND.md) |
| Long-form rationale | [`PLAN.md`](./PLAN.md) |

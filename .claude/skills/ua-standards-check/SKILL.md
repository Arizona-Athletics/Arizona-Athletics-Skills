---
name: ua-standards-check
description: Audit this repo against the latest UA Athletics design standards. Fetches current UA Marcom brand standards, Arizona Digital releases (arizona-bootstrap, az_quickstart), and major framework versions (Bun, TypeScript, React, Next, Astro, Vite+, Tailwind, Bootstrap), then diffs them against what is documented in this repo. Surfaces drift so tokens and docs stay current. Read-only — proposes changes, never auto-edits.
---

# UA Standards Freshness Check

You are auditing `arizona-athletics-web-templates` against authoritative external
sources. The repo's whole purpose is to be the canonical UA Athletics baseline —
which only works if the sources behind it are still current.

**You are read-only.** Report drift, propose updates, but never edit `tokens.json`,
docs, or `package.json` files in this run. The human reviews and decides.

## What to check

Check these three groups. Use parallel WebFetch / Bash calls where possible to
keep this fast.

### 1. UA Marcom + brand standards

Fetch and skim:

- `https://marcom.arizona.edu/`
- `https://brand.arizona.edu/` (if reachable)
- `https://brand.arizona.edu/colors` and `/typography` (or the equivalent landing pages)

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

Use the `gh` CLI:

```bash
gh release list --repo az-digital/arizona-bootstrap --limit 5
gh release list --repo az-digital/az_quickstart --limit 5
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
| Arizona Red `#AB0520` | `#AB0520` | `#AB0520` (per brand.arizona.edu) | none | `tokens.json`, `BRAND.md` |
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
- **Don't claim "the latest"** without a citation — every "latest" value in the table needs a source (GitHub release URL, npm registry, brand.arizona.edu page).
- **Don't run more than ~15 fetches.** Batch in parallel where possible. If a source is unreachable, report it and move on; don't retry.
- **Don't second-guess intentional choices.** Vite+ is in preview *on purpose*; flag the status, don't propose downgrading to vanilla Vite.

## When to invoke this

- Before starting a new template PR — confirm the foundation hasn't shifted.
- Before publishing a new `@ua/ua-tokens` version.
- Quarterly, as a hygiene check.
- Whenever the human asks "is this still current?"

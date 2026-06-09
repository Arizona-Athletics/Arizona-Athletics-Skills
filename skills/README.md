# UA Athletics Agent Skills

These folders use the `SKILL.md` agent skills format. Coding agents can install
them locally, and web chat tools can use the portable bundle.

## Zero-install inside this repo (Claude Code)

The three focused skills are checked in under `.claude/skills/` and load
automatically when Claude Code opens this repo — `/ua-standards-check` works on
a fresh clone with no install step. Those copies are generated; this `skills/`
directory is the source of truth. After editing any skill, regenerate them:

```bash
bun run sync:project-skills
```

CI (`bun run check:skills`) fails if the project copies or the generated
bundle drift from this directory.

## Claude Code plugin install (no clone needed)

```
/plugin marketplace add Arizona-Athletics/arizona-athletics-web-templates
/plugin install ua-athletics-web@ua-athletics
```

## Recommended local install for other tools

Install the focused skills from a local clone:

```bash
bun run install:agent-skills
```

Remove them again with `bun run install:agent-skills -- --uninstall`.

Default install mode copies these focused skills only:

- `ua-standards-check`: read-only standards freshness audit.
- `ua-build-site`: build new UA Athletics sites from templates.
- `ua-site-compliance`: refactor existing sites into UA Athletics compliance.

The installer writes to:

- Claude Code: `~/.claude/skills/`
- Codex / AGENTS-compatible tools: `~/.agents/skills/`
- Grok Build: `~/.grok/skills/`

## Single portable bundle

Use `ua-athletics-web` when you need one skill file for ChatGPT web, Claude web,
or an agent environment where the focused skills are not installed. It is
generated from the focused source skills, so rebuild it after editing any of
those source files:

```bash
bun run build:agent-skill-bundle
```

Install only the bundle locally:

```bash
bun run install:agent-skill-bundle
```

Or include it alongside the focused skills:

```bash
bun run install:agent-skills -- --include-bundle
```

For Claude web custom skills, zip the `ua-athletics-web/` folder so the zip root
contains the folder, not loose files. For ChatGPT Projects or custom GPTs, upload
`ua-athletics-web/SKILL.md` as reference material or paste its instructions into
the project/GPT instructions.

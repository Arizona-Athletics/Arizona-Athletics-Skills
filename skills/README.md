# UA Athletics Agent Skills

These folders use the `SKILL.md` agent skills format. Coding agents can install
them locally, and web chat tools can use the portable bundle.

## Recommended local install

Install the focused skills from a local clone:

```bash
bun run install:agent-skills
```

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

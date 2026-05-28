# UA Athletics Agent Skills

These folders use the `SKILL.md` agent skills format. Coding agents can install them locally, Claude web can pull the portable bundle from GitHub as chat or project context, and Claude plugin surfaces can install the repo as a marketplace.

## Claude web no-upload pull

Claude web can pull these instructions from the repo as chat or project context. Use the copy-paste prompt in [`../CLAUDE_WEB.md`](../CLAUDE_WEB.md), or tell Claude to read these files in order:

```text
CLAUDE_WEB.md
SKILL.md
skills/ua-athletics-web/SKILL.md
```

That loads the portable bundle for the current chat. It is not a persistent custom skill install.

## Claude plugin marketplace

The repo root contains `.claude-plugin/marketplace.json`. The installable plugin lives at `../plugins/ua-athletics-web`.

Claude Code install:

```text
/plugin marketplace add Arizona-Athletics/arizona-athletics-web-templates
/plugin install ua-athletics-web@ua-athletics-web-templates
/reload-plugins
```

Claude Cowork users can add the same repo as a personal GitHub marketplace and install `ua-athletics-web`.

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

## Claude web persistent upload

For a persistent Claude custom skill, use the prebuilt ZIP:

```text
../claude-web/ua-athletics-web.zip
```

Upload it in Claude.ai at:

```text
Customize > Skills > + > Create skill > Upload a skill
```

The ZIP is intentionally tiny and contains only:

```text
ua-athletics-web/
└── SKILL.md
```

Rebuild it after editing the focused skills:

```bash
bun run build:claude-web-skill
```

## Single portable bundle

Use `ua-athletics-web` when you need one skill file for ChatGPT web, Claude web, or an agent environment where the focused skills are not installed. It is generated from the focused source skills, so rebuild it after editing any of those source files:

```bash
bun run build:agent-skill-bundle
```

That command updates all three generated copies:

```text
SKILL.md
skills/ua-athletics-web/SKILL.md
plugins/ua-athletics-web/skills/ua-athletics-web/SKILL.md
```

Install only the bundle locally:

```bash
bun run install:agent-skill-bundle
```

Or include it alongside the focused skills:

```bash
bun run install:agent-skills -- --include-bundle
```

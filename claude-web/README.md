# Claude web usage

This directory supports Claude web and Claude plugin workflows.

## No-upload repo pull

Use this when you want to give Claude web only the repo URL and have it pull the skill instructions for the current chat or Claude Project.

Paste this into Claude web:

```text
Use the UA Athletics web skills from this GitHub repo for this conversation:
https://github.com/Arizona-Athletics/arizona-athletics-web-templates

First read CLAUDE_WEB.md. Then read SKILL.md. If SKILL.md is unavailable, read skills/ua-athletics-web/SKILL.md. Treat the loaded file as the active skill instructions for this chat. Do not ask me to upload a ZIP and do not run the Bun installer unless I specifically ask for a persistent local install.
```

This is the recommended no-upload path for normal Claude web chat. It does not permanently install a Claude custom skill. It loads the skill as conversation or project context.

## No-upload plugin marketplace

Use this when Claude has plugin support through Claude Cowork or Claude Code.

Claude Code:

```text
/plugin marketplace add Arizona-Athletics/arizona-athletics-web-templates
/plugin install ua-athletics-web@ua-athletics-web-templates
/reload-plugins
```

Claude Cowork:

```text
Customize > Browse plugins > Personal > + > Add marketplace from GitHub
```

Then paste the repo URL and install `ua-athletics-web`:

```text
https://github.com/Arizona-Athletics/arizona-athletics-web-templates
```

## Persistent custom skill upload

Use this only when you want the skill permanently listed under Claude.ai skills.

1. Download [`ua-athletics-web.zip`](https://github.com/Arizona-Athletics/arizona-athletics-web-templates/raw/main/claude-web/ua-athletics-web.zip).
2. Open Claude.ai.
3. Go to **Customize > Skills**.
4. Click **+**, then **Create skill**.
5. Choose **Upload a skill** and select `ua-athletics-web.zip`.
6. Enable the skill.

Do not upload the full repo ZIP. The ZIP is already packaged in the structure Claude expects:

```text
ua-athletics-web.zip
└── ua-athletics-web/
    └── SKILL.md
```

## Regenerate generated files

After editing any focused skill in `skills/`, rebuild the portable bundle and the optional Claude web upload ZIP:

```bash
bun run build:claude-web-skill
```

That command regenerates:

- `SKILL.md`
- `skills/ua-athletics-web/SKILL.md`
- `plugins/ua-athletics-web/skills/ua-athletics-web/SKILL.md`
- `claude-web/ua-athletics-web.zip`

# UA Athletics Web Claude Plugin

This plugin wraps the portable `ua-athletics-web` skill so Claude Code can
install it from the GitHub marketplace in this repo. Team or Enterprise owners
can also expose it to Claude Cowork users through a GitHub-synced organization
plugin marketplace.

Claude Code install:

```text
/plugin marketplace add Arizona-Athletics/arizona-athletics-web-templates
/plugin install ua-athletics-web@ua-athletics-web-templates
/reload-plugins
```

Installed skill name:

```text
/ua-athletics-web:ua-athletics-web
```

The skill content is generated from the focused source skills in `../../skills/`.
Do not hand-edit `skills/ua-athletics-web/SKILL.md` inside this plugin. Run
`bun run build:agent-skill-bundle` from the repo root after editing the source
skills.

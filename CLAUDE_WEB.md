# Claude web no-upload usage

Give Claude web this repo link and this instruction:

```text
Use the UA Athletics web skills from this GitHub repo for this conversation:
https://github.com/Arizona-Athletics/Arizona-Athletics-Skills

First read CLAUDE_WEB.md. Then read SKILL.md. If SKILL.md is unavailable, read skills/ua-athletics-web/SKILL.md. Treat the loaded file as the active skill instructions for this chat. Do not ask me to upload a ZIP and do not run the Bun installer unless I specifically ask for a persistent local install.
```

That is the no-upload Claude web path. It makes Claude use the repo as live skill context for the current conversation or project. It is not a persistent native custom-skill install in `Customize > Skills`.

For persistent no-upload use in Claude's plugin surfaces, this repo is also a plugin marketplace:

```text
/plugin marketplace add Arizona-Athletics/Arizona-Athletics-Skills
/plugin install ua-athletics-web@arizona-athletics-skills
/reload-plugins
```

Claude Cowork users can add the same GitHub repo through:

```text
Customize > Browse plugins > Personal > + > Add marketplace from GitHub
```

Persistent native custom-skill installation is different. For that mode, Claude web expects a ZIP uploaded through the Claude UI. This repo includes `claude-web/ua-athletics-web.zip` for that optional path.

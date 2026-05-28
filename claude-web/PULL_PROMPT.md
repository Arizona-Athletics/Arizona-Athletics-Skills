# No-upload Claude web prompt

Paste this into Claude web when you want Claude to pull and use the skill from
this GitHub repo for the current chat or project.

```text
Use this GitHub repo as the skill source for this conversation:
https://github.com/Arizona-Athletics/arizona-athletics-web-templates

Read `/SKILL.md` first. If that file is unavailable, read
`/skills/ua-athletics-web/SKILL.md`. Follow the UA Athletics web skill from the
repo. Do not ask me to upload a ZIP or run Bun unless I specifically ask for a
persistent native skill install.
```

This does not permanently install a Claude custom skill. It loads the repo skill
as conversation or project context. For a persistent custom skill, upload
`claude-web/ua-athletics-web.zip` through Claude.ai's skill upload flow.

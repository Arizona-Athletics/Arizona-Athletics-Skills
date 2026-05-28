#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const outputSkillDir = join(repoRoot, "skills", "ua-athletics-web");
const outputSkillFile = join(outputSkillDir, "SKILL.md");

const sourceSkills = [
  {
    name: "ua-standards-check",
    trigger: "Check whether repo standards are still current, audit drift, latest brand/framework versions",
  },
  {
    name: "ua-build-site",
    trigger: "Build, scaffold, or create a new UA Athletics site/app/page/template",
  },
  {
    name: "ua-site-compliance",
    trigger: "Convert, fix, modernize, or refactor an existing site into UA Athletics compliance",
  },
];

const parsedSkills = [];

for (const skill of sourceSkills) {
  const skillFile = join(repoRoot, "skills", skill.name, "SKILL.md");
  const raw = await readFile(skillFile, "utf8");
  const parsed = parseSkill(raw, skillFile);
  parsedSkills.push({ ...skill, ...parsed, skillFile });
}

const generated = renderBundle(parsedSkills);
await mkdir(outputSkillDir, { recursive: true });
await writeFile(outputSkillFile, generated);
console.log(`Wrote ${outputSkillFile}`);

function parseSkill(raw, skillFile) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    throw new Error(`Missing YAML frontmatter in ${skillFile}`);
  }

  const frontmatter = match[1];
  const body = match[2].trim();
  const name = readFrontmatter(frontmatter, "name");
  const description = readFrontmatter(frontmatter, "description");

  if (!name || !description) {
    throw new Error(`Expected name and description frontmatter in ${skillFile}`);
  }

  return { name, description, body };
}

function readFrontmatter(frontmatter, key) {
  const pattern = new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m");
  const match = pattern.exec(frontmatter);
  return match?.[1]?.trim() || "";
}

function renderBundle(skills) {
  const routingRows = skills
    .map((skill) => `| ${skill.trigger} | \`${skill.skillFile.replace(`${repoRoot}/`, "")}\` |`)
    .join("\n");

  const embedded = skills
    .map(
      (skill) => `# Embedded source skill: ${skill.name}\n\nDescription: ${skill.description}\n\nSource file: \`${skill.skillFile.replace(`${repoRoot}/`, "")}\`\n\n${skill.body}`,
    )
    .join("\n\n---\n\n");

  return `---
name: ua-athletics-web
description: Portable single-file UA Athletics web skill bundle. Use when the user asks for one skill that works across Codex, Claude Code, Grok Build, ChatGPT web, or Claude web, or when focused UA Athletics skills are unavailable. Routes standards audits, new-site builds, and existing-site compliance work to the embedded workflows.
---

# UA Athletics Web Skill Bundle

This file is generated from the focused source skills in \`skills/\`. It is
intentionally plain Markdown with minimal YAML frontmatter so it can be used by
Codex, Claude Code, Grok Build, Claude on the web, and ChatGPT as a project or
knowledge file.

Source repo:
\`https://github.com/Arizona-Athletics/arizona-athletics-web-templates\`

## How to use this skill

Prefer the focused source skills when they are available locally. They are
smaller, easier to maintain, and should be considered the source of truth.

When local files are available, route the task like this:

| User asks for | Read and follow |
| --- | --- |
${routingRows}

If those files are not available, use the embedded fallback workflows below.
When this file is uploaded to a web chat surface with no filesystem access, the
embedded fallbacks are the working instructions.

## Shared non-negotiables

- Consume from \`@ua/ua-tokens\`. Never hardcode UA colors.
- Default to semantic tokens: \`--bg\`, \`--surface\`, \`--text\`,
  \`--text-strong\`, \`--text-muted\`, \`--border\`, \`--link\`, \`--accent\`,
  \`--accent-hover\`, \`--on-accent\`.
- Use brand tokens such as \`--ua-red\` and \`--ua-blue\` only for deliberate
  identity accents.
- Build from the six shared components: \`Header\`, \`Hero\`, \`Toolbar\`,
  \`Card\`, \`Footer\`, \`ThemeToggle\`.
- Use Proxima Nova / Garamond Premier Pro / system mono only. Leave Typekit kit
  IDs as \`CONFIGURE_ME\` unless the human provides a cleared ID.
- Mark real-world values as \`CONFIGURE_ME\`: logos, social URLs, analytics,
  Cognito pool IDs, client IDs, IdP URLs, contact info.
- Do not invent UA logos, UA-specific IDs, Typekit IDs, copy voice, or contact
  details.
- Keep both \`--ua-*\` and \`--az-*\` aliases when working with Arizona Digital
  or existing Bootstrap/Quickstart consumers.
- Use Bun for JavaScript installs and scripts in this repo. Do not switch to
  npm, yarn, or pnpm unless the user explicitly asks.

## Platform notes

For coding agents, install this folder as \`ua-athletics-web/SKILL.md\` in the
platform skill directory. For web chat, upload this file or a zip containing the
\`ua-athletics-web/\` folder. If the web surface cannot execute shell commands or
read GitHub directly, ask the user to attach the repo zip or the files needed for
the specific workflow.

${embedded}
`;
}

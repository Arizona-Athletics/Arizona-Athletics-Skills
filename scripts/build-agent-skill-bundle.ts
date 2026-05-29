#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const outputSkillDir = join(repoRoot, "skills", "ua-athletics-web");
const outputSkillFile = join(outputSkillDir, "SKILL.md");
const repoEntrySkillFile = join(repoRoot, "SKILL.md");
const pluginDir = join(repoRoot, "plugins", "ua-athletics-web");
const pluginSkillDir = join(pluginDir, "skills", "ua-athletics-web");
const pluginSkillFile = join(pluginSkillDir, "SKILL.md");
const pluginManifestDir = join(pluginDir, ".claude-plugin");
const pluginManifestFile = join(pluginManifestDir, "plugin.json");
const marketplaceDir = join(repoRoot, ".claude-plugin");
const marketplaceFile = join(marketplaceDir, "marketplace.json");

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
await mkdir(pluginSkillDir, { recursive: true });
await mkdir(pluginManifestDir, { recursive: true });
await mkdir(marketplaceDir, { recursive: true });
await writeFile(outputSkillFile, generated);
await writeFile(repoEntrySkillFile, generated);
await writeFile(pluginSkillFile, generated);
await writeFile(pluginManifestFile, renderPluginManifest());
await writeFile(marketplaceFile, renderMarketplace());
console.log(`Wrote ${outputSkillFile}`);
console.log(`Wrote ${repoEntrySkillFile}`);
console.log(`Wrote ${pluginSkillFile}`);
console.log(`Wrote ${pluginManifestFile}`);
console.log(`Wrote ${marketplaceFile}`);

function renderMarketplace() {
  return `${JSON.stringify(
    {
      $schema: "https://json.schemastore.org/claude-code-plugin-marketplace.json",
      name: "arizona-athletics-skills",
      description: "UA Athletics web design-system skills and starter-template workflows.",
      owner: {
        name: "Arizona Athletics",
      },
      plugins: [
        {
          name: "ua-athletics-web",
          displayName: "UA Athletics Web",
          description:
            "Installs the UA Athletics web skill for standards checks, new-site scaffolds, and existing-site compliance work.",
          source: "./plugins/ua-athletics-web",
          category: "development",
          tags: ["ua", "arizona", "athletics", "design-system", "templates"],
        },
      ],
    },
    null,
    2,
  )}\n`;
}

function renderPluginManifest() {
  return `${JSON.stringify(
    {
      $schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
      name: "ua-athletics-web",
      displayName: "UA Athletics Web",
      description:
        "Adds a UA Athletics web skill for brand standards checks, template scaffolding, and compliance refactors.",
      author: {
        name: "Arizona Athletics",
      },
      homepage: "https://github.com/Arizona-Athletics/Arizona-Athletics-Skills",
      repository: "https://github.com/Arizona-Athletics/Arizona-Athletics-Skills",
      license: "MIT",
      keywords: ["ua", "arizona", "athletics", "design-system", "templates"],
    },
    null,
    2,
  )}\n`;
}

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
\`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills\`

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

- Claude web, no-upload repo-link mode: when the user gives the GitHub repo URL,
  read \`CLAUDE_WEB.md\` first if it is available, then read this file from
  \`SKILL.md\` or \`skills/ua-athletics-web/SKILL.md\`, and follow it in the
  current chat or Claude Project. Do not tell the user they must upload a ZIP
  just to use this repo as skill context. This is not a persistent native
  custom-skill install; it is the repo-link workflow for Claude web sessions.
- Claude web, persistent native skill mode: if the user specifically wants the
  skill permanently added to Claude.ai's custom skill list, use
  \`claude-web/ua-athletics-web.zip\`, or any ZIP whose root contains
  \`ua-athletics-web/SKILL.md\`.
- ChatGPT web: read this file from the repo, upload it as project/custom GPT
  reference material, or paste the instructions into the project/GPT
  instructions.
- Claude Code, Codex, Grok Build, and other local coding agents: install this
  folder as \`ua-athletics-web/SKILL.md\` in the platform skill directory. Prefer
  the focused source skills when available.
- If the web surface cannot execute shell commands or read GitHub directly, ask
  the user to attach the repo zip or the files needed for the specific workflow.

${embedded}
`;
}

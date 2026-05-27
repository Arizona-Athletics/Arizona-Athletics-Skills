#!/usr/bin/env bun

import { constants } from "node:fs";
import { access, cp, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const validArgs = new Set([
  "--help",
  "-h",
  "--dry-run",
  "--claude-only",
  "--codex-only",
  "--grok-only",
]);
const args = process.argv.slice(2);
const unknownArgs = args.filter((arg) => !validArgs.has(arg));

if (unknownArgs.length > 0) {
  console.error(`Unknown option: ${unknownArgs.join(", ")}`);
  printHelp();
  process.exit(1);
}

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

const onlyFlags = ["--claude-only", "--codex-only", "--grok-only"].filter((arg) =>
  args.includes(arg),
);
const dryRun = args.includes("--dry-run");

if (onlyFlags.length > 1) {
  console.error(`Choose only one platform filter: ${onlyFlags.join(", ")}`);
  process.exit(1);
}

const repoRoot = resolve(import.meta.dir, "..");
const sourceSkillsDir = join(repoRoot, "skills");
const home = homedir();

const targets = [
  {
    name: "Claude Code",
    enabled: shouldInstall("--claude-only"),
    skillsDir: join(process.env.CLAUDE_HOME || join(home, ".claude"), "skills"),
  },
  {
    name: "Codex",
    enabled: shouldInstall("--codex-only"),
    skillsDir: join(process.env.CODEX_HOME || join(home, ".codex"), "skills"),
  },
  {
    name: "Grok / AGENTS",
    enabled: shouldInstall("--grok-only"),
    skillsDir: join(process.env.AGENTS_HOME || join(home, ".agents"), "skills"),
  },
].filter((target) => target.enabled);

const skills = await loadSkills();

console.log(`Installing ${skills.length} UA Athletics skills from ${sourceSkillsDir}`);

for (const target of targets) {
  await installTarget(target);
}

if (!dryRun) {
  console.log("Restart Claude Code, Codex, or Grok if the skill list does not refresh automatically.");
}

function shouldInstall(onlyFlag: string): boolean {
  return onlyFlags.length === 0 || onlyFlags[0] === onlyFlag;
}

async function loadSkills(): Promise<Array<{ name: string; sourceDir: string }>> {
  let entries;
  try {
    entries = await readdir(sourceSkillsDir, { withFileTypes: true });
  } catch {
    console.error(`Missing skills directory: ${sourceSkillsDir}`);
    process.exit(1);
  }

  const skills = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      sourceDir: join(sourceSkillsDir, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (skills.length === 0) {
    console.error(`No skills found in ${sourceSkillsDir}`);
    process.exit(1);
  }

  for (const skill of skills) {
    await assertReadableSource(skill);
  }

  return skills;
}

async function assertReadableSource(skill: { name: string; sourceDir: string }): Promise<void> {
  const skillFile = join(skill.sourceDir, "SKILL.md");

  try {
    await access(skillFile, constants.R_OK);
  } catch {
    console.error(`Missing readable skill file: ${skillFile}`);
    process.exit(1);
  }

  const skillMd = await readFile(skillFile, "utf8");
  if (!/^---\n[\s\S]*?\n---/.test(skillMd)) {
    console.error(`Invalid skill frontmatter: ${skillFile}`);
    process.exit(1);
  }

  const namePattern = new RegExp(`^name:\\s*${escapeRegExp(skill.name)}\\s*$`, "m");
  if (!namePattern.test(skillMd)) {
    console.error(`Unexpected skill name in ${skillFile}`);
    process.exit(1);
  }
}

async function installTarget(target: { name: string; skillsDir: string }): Promise<void> {
  if (dryRun) {
    for (const skill of skills) {
      console.log(`[dry-run] ${target.name} -> ${join(target.skillsDir, skill.name)}`);
    }
    return;
  }

  await mkdir(target.skillsDir, { recursive: true });

  for (const skill of skills) {
    const destination = join(target.skillsDir, basename(skill.sourceDir));
    await mkdir(dirname(destination), { recursive: true });
    await cp(skill.sourceDir, destination, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });

    console.log(`[ok] ${target.name} -> ${destination}`);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printHelp(): void {
  console.log(`Install UA Athletics agent skills for Claude Code, Codex, and Grok.

Usage:
  # From a local clone of https://github.com/Arizona-Athletics/arizona-athletics-web-templates
  bun run install:agent-skills
  bun run install:agent-skills -- --codex-only
  bun run install:agent-skills -- --claude-only
  bun run install:agent-skills -- --grok-only
  bun run install:agent-skills -- --dry-run

Skills:
  ua-standards-check
  ua-build-site
  ua-site-compliance

Destinations:
  Claude Code: $CLAUDE_HOME/skills/<skill> or ~/.claude/skills/<skill>
  Codex:       $CODEX_HOME/skills/<skill> or ~/.codex/skills/<skill>
  Grok:        $AGENTS_HOME/skills/<skill> or ~/.agents/skills/<skill>
`);
}

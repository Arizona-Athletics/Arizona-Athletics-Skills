#!/usr/bin/env bun

import { constants } from "node:fs";
import { access, cp, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const validArgs = new Set([
  "--help",
  "-h",
  "--dry-run",
  "--claude-only",
  "--codex-only",
  "--agents-only",
  "--grok-only",
  "--focused-only",
  "--include-bundle",
  "--bundle-only",
]);
const platformFilterArgs = new Set(["--claude-only", "--codex-only", "--agents-only", "--grok-only"]);
const skillModeArgs = new Set(["--focused-only", "--include-bundle", "--bundle-only"]);
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

const platformFilters = args.filter((arg) => platformFilterArgs.has(arg));
const skillModes = args.filter((arg) => skillModeArgs.has(arg));
const dryRun = args.includes("--dry-run");
const bundleSkillName = "ua-athletics-web";

if (platformFilters.length > 1) {
  console.error(`Choose only one platform filter: ${platformFilters.join(", ")}`);
  process.exit(1);
}

if (skillModes.length > 1) {
  console.error(`Choose only one skill mode: ${skillModes.join(", ")}`);
  process.exit(1);
}

const selectedPlatformFilter = platformFilters[0];
const selectedSkillMode = skillModes[0] || "--focused-only";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourceSkillsDir = join(repoRoot, "skills");
const home = homedir();

const targets = [
  {
    name: "Claude Code",
    flags: new Set(["--claude-only"]),
    skillsDir: join(process.env.CLAUDE_HOME || join(home, ".claude"), "skills"),
  },
  {
    name: "Codex / AGENTS-compatible",
    flags: new Set(["--codex-only", "--agents-only"]),
    skillsDir: join(process.env.AGENTS_HOME || join(home, ".agents"), "skills"),
  },
  {
    name: "Grok Build",
    flags: new Set(["--grok-only"]),
    skillsDir: join(process.env.GROK_HOME || join(home, ".grok"), "skills"),
  },
].filter((target) => shouldInstallTarget(target.flags));

const skills = await loadSkills();

console.log(`Installing ${skills.length} UA Athletics skill(s) from ${sourceSkillsDir}`);
console.log(`Skill mode: ${selectedSkillMode.replace(/^--/, "")}`);

for (const target of targets) {
  await installTarget(target);
}

if (!dryRun) {
  console.log("Restart or refresh your agent if the skill list does not update automatically.");
}

function shouldInstallTarget(flags: Set<string>): boolean {
  return selectedPlatformFilter === undefined || flags.has(selectedPlatformFilter);
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
    .filter((skill) => shouldInstallSkill(skill.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (skills.length === 0) {
    console.error(`No skills selected from ${sourceSkillsDir}`);
    process.exit(1);
  }

  for (const skill of skills) {
    await assertReadableSource(skill);
  }

  return skills;
}

function shouldInstallSkill(name: string): boolean {
  if (selectedSkillMode === "--bundle-only") {
    return name === bundleSkillName;
  }

  if (selectedSkillMode === "--include-bundle") {
    return true;
  }

  return name !== bundleSkillName;
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
  console.log(`Install UA Athletics agent skills for Claude Code, Codex, and Grok Build.

Usage:
  # From a local clone of https://github.com/Arizona-Athletics/Arizona-Athletics-Skills
  bun run install:agent-skills
  bun run install:agent-skills -- --codex-only
  bun run install:agent-skills -- --claude-only
  bun run install:agent-skills -- --grok-only
  bun run install:agent-skills -- --include-bundle
  bun run install:agent-skills -- --bundle-only
  bun run install:agent-skills -- --dry-run

Skill modes:
  --focused-only     Install the three focused skills only. Default.
  --include-bundle   Install the focused skills plus the single portable bundle.
  --bundle-only      Install only the single portable bundle for web-style use.

Skills:
  ua-standards-check   Read-only standards freshness audit.
  ua-build-site        Build new UA Athletics sites from templates.
  ua-site-compliance   Refactor existing sites into UA Athletics compliance.
  ua-athletics-web     Single portable bundle for web ChatGPT/Claude or fallback use.

Destinations:
  Claude Code: $CLAUDE_HOME/skills/<skill> or ~/.claude/skills/<skill>
  Codex:       $AGENTS_HOME/skills/<skill> or ~/.agents/skills/<skill>
  Grok Build:  $GROK_HOME/skills/<skill> or ~/.grok/skills/<skill>
`);
}

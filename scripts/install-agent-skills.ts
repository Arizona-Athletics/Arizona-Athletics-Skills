#!/usr/bin/env bun

import { constants } from "node:fs";
import { access, cp, mkdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const validArgs = new Set(["--help", "-h", "--dry-run", "--claude-only", "--codex-only"]);
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

const claudeOnly = args.includes("--claude-only");
const codexOnly = args.includes("--codex-only");
const dryRun = args.includes("--dry-run");

if (claudeOnly && codexOnly) {
  console.error("Choose either --claude-only or --codex-only, not both.");
  process.exit(1);
}

const repoRoot = resolve(import.meta.dir, "..");
const sourceSkillDir = join(repoRoot, ".claude", "skills", "ua-standards-check");
const skillName = basename(sourceSkillDir);
const home = homedir();

const targets = [
  {
    name: "Claude Code",
    enabled: !codexOnly,
    skillDir: join(process.env.CLAUDE_HOME || join(home, ".claude"), "skills", skillName),
  },
  {
    name: "Codex",
    enabled: !claudeOnly,
    skillDir: join(process.env.CODEX_HOME || join(home, ".codex"), "skills", skillName),
  },
].filter((target) => target.enabled);

await assertReadableSource();

console.log(`Installing ${skillName} from ${sourceSkillDir}`);

for (const target of targets) {
  if (dryRun) {
    console.log(`[dry-run] ${target.name} -> ${target.skillDir}`);
    continue;
  }

  await mkdir(dirname(target.skillDir), { recursive: true });
  await cp(sourceSkillDir, target.skillDir, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });

  console.log(`[ok] ${target.name} -> ${target.skillDir}`);
}

if (!dryRun) {
  console.log("Restart Claude Code or Codex if the skill list does not refresh automatically.");
}

async function assertReadableSource(): Promise<void> {
  const skillFile = join(sourceSkillDir, "SKILL.md");

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

  if (!/^name:\s*ua-standards-check\s*$/m.test(skillMd)) {
    console.error(`Unexpected skill name in ${skillFile}`);
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`Install UA Athletics agent skills for Claude Code and Codex.

Usage:
  bun run install:agent-skills
  bun run install:agent-skills -- --codex-only
  bun run install:agent-skills -- --claude-only
  bun run install:agent-skills -- --dry-run

Destinations:
  Claude Code: $CLAUDE_HOME/skills/ua-standards-check or ~/.claude/skills/ua-standards-check
  Codex:       $CODEX_HOME/skills/ua-standards-check or ~/.codex/skills/ua-standards-check
`);
}

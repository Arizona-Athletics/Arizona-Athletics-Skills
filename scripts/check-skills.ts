#!/usr/bin/env bun
// Validates the agent skills stay internally consistent:
//   1. every skills/<name>/SKILL.md has valid frontmatter with a matching name
//   2. the checked-in project copies (.claude/skills/) match skills/ exactly
//   3. the generated ua-athletics-web bundle is fresh (regenerating it
//      produces no diff)
//
// Usage: bun scripts/check-skills.ts [--bundle-only]

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "..");
const SOURCE = join(ROOT, "skills");
const PROJECT = join(ROOT, ".claude", "skills");
const BUNDLE = join(SOURCE, "ua-athletics-web", "SKILL.md");
const FOCUSED = ["ua-build-site", "ua-site-compliance", "ua-standards-check"];

const bundleOnly = process.argv.includes("--bundle-only");
const errors: string[] = [];

function listFiles(dir: string, base = dir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...listFiles(path, base));
    else files.push(relative(base, path));
  }
  return files.sort();
}

// 1. Frontmatter validation (same contract as install-agent-skills.ts).
function checkFrontmatter() {
  for (const entry of readdirSync(SOURCE)) {
    const skillDir = join(SOURCE, entry);
    if (!statSync(skillDir).isDirectory()) continue;
    const skillFile = join(skillDir, "SKILL.md");

    let raw: string;
    try {
      raw = readFileSync(skillFile, "utf8");
    } catch {
      errors.push(`missing SKILL.md: skills/${entry}/`);
      continue;
    }

    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(raw)?.[1];
    if (!frontmatter) {
      errors.push(`invalid frontmatter: skills/${entry}/SKILL.md`);
      continue;
    }
    if (!new RegExp(`^name:\\s*${entry}\\s*$`, "m").test(frontmatter)) {
      errors.push(`frontmatter name does not match directory: skills/${entry}/SKILL.md`);
    }
    if (!/^description:\s*\S+/m.test(frontmatter)) {
      errors.push(`missing description: skills/${entry}/SKILL.md`);
    }
  }
}

// 2. Project copies in sync with source.
function checkProjectCopies() {
  for (const name of FOCUSED) {
    const sourceDir = join(SOURCE, name);
    const projectDir = join(PROJECT, name);

    let projectFiles: string[];
    try {
      projectFiles = listFiles(projectDir);
    } catch {
      errors.push(`missing project copy: .claude/skills/${name} — run \`bun run sync:project-skills\``);
      continue;
    }

    const sourceFiles = listFiles(sourceDir);
    if (JSON.stringify(sourceFiles) !== JSON.stringify(projectFiles)) {
      errors.push(`file list differs: .claude/skills/${name} vs skills/${name} — run \`bun run sync:project-skills\``);
      continue;
    }
    for (const file of sourceFiles) {
      if (readFileSync(join(sourceDir, file), "utf8") !== readFileSync(join(projectDir, file), "utf8")) {
        errors.push(`stale project copy: .claude/skills/${name}/${file} — run \`bun run sync:project-skills\``);
      }
    }
  }
}

// 3. Bundle freshness: regenerate, compare, restore.
function checkBundleFreshness() {
  const original = readFileSync(BUNDLE, "utf8");
  const result = Bun.spawnSync(["bun", join(ROOT, "scripts", "build-agent-skill-bundle.ts")], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) {
    errors.push(`bundle generator failed: ${result.stderr.toString().trim()}`);
    return;
  }
  const regenerated = readFileSync(BUNDLE, "utf8");
  if (regenerated !== original) {
    writeFileSync(BUNDLE, original);
    errors.push("stale bundle: skills/ua-athletics-web/SKILL.md — run `bun run build:agent-skill-bundle`");
  }
}

if (!bundleOnly) {
  checkFrontmatter();
  checkProjectCopies();
}
checkBundleFreshness();

if (errors.length > 0) {
  console.error(`${errors.length} skill check(s) failed:\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`✓ skills pass${bundleOnly ? " (bundle only)" : ""}: frontmatter, project copies, bundle freshness`);

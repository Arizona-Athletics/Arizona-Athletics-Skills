#!/usr/bin/env bun

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const tempRoot = mkdtempSync(join(tmpdir(), "ua-standalone-templates-"));

const templates: Array<{ slug: string; command?: string[]; optionalBinary?: string }> = [
  { slug: "astro", command: ["bun", "run", "build"] },
  { slug: "react-vite-plus", command: ["bun", "run", "build"] },
  { slug: "nextjs-app-router", command: ["bun", "run", "build"] },
  { slug: "node-express-ts", command: ["bun", "run", "build"] },
  { slug: "html-tailwind", command: ["bun", "run", "build"] },
  { slug: "html-bootstrap5" },
  { slug: "email-html", command: ["bun", "run", "check"] },
  { slug: "drupal-quickstart-subtheme", command: ["bun", "run", "lint"] },
  { slug: "hugo", command: ["bun", "run", "build"], optionalBinary: "hugo" },
];

try {
  for (const template of templates) {
    if (template.optionalBinary && !hasBinary(template.optionalBinary)) {
      console.log(`Skipping ${template.slug}: ${template.optionalBinary} is not installed`);
      continue;
    }

    const source = join(repoRoot, "templates", template.slug);
    const target = join(tempRoot, template.slug);
    cpSync(source, target, {
      recursive: true,
      filter: (path) => !path.includes("node_modules") && !path.includes(`${template.slug}/dist`),
    });

    run(template.slug, ["bun", "install"], target);
    if (template.command) run(template.slug, template.command, target);
  }

  console.log("Standalone template install/build checks passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function run(label: string, command: string[], cwd: string): void {
  console.log(`[${label}] ${command.join(" ")}`);
  execFileSync(command[0] ?? "", command.slice(1), { cwd, stdio: "inherit" });
}

function hasBinary(binary: string): boolean {
  try {
    execFileSync("which", [binary], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

#!/usr/bin/env bun

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const sourceDir = join(repoRoot, "packages", "ua-tokens");
const sourceDist = join(sourceDir, "dist");
const tempRoot = mkdtempSync(join(tmpdir(), "ua-token-dist-"));

try {
  const tempPackage = join(tempRoot, "ua-tokens");
  cpSync(join(sourceDir, "build.ts"), join(tempPackage, "build.ts"), { recursive: true });
  cpSync(join(sourceDir, "tokens.json"), join(tempPackage, "tokens.json"), { recursive: true });

  execFileSync("bun", [join(tempPackage, "build.ts")], { stdio: "ignore" });

  const expectedDist = join(tempPackage, "dist");
  const expectedFiles = listFiles(expectedDist);
  const actualFiles = listFiles(sourceDist);

  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));
  const changed = expectedFiles.filter((file) => {
    const expectedPath = join(expectedDist, file);
    const actualPath = join(sourceDist, file);
    return existsSync(actualPath) && readFileSync(expectedPath, "utf8") !== readFileSync(actualPath, "utf8");
  });

  if (missing.length || extra.length || changed.length) {
    printDrift("missing", missing);
    printDrift("extra", extra);
    printDrift("changed", changed);
    throw new Error("packages/ua-tokens/dist is out of date. Run `bun run --filter @ua/ua-tokens build`.");
  }

  console.log("packages/ua-tokens/dist matches tokens.json");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

function printDrift(label: string, files: string[]): void {
  if (!files.length) return;
  console.error(`${label}:`);
  for (const file of files) {
    console.error(`  - ${basename(file) === file ? file : file}`);
  }
}

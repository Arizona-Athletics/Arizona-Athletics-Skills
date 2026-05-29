#!/usr/bin/env bun

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const templatesDir = join(repoRoot, "templates");
const sourcePackageDir = join(repoRoot, "packages", "ua-tokens");
const checkOnly = process.argv.includes("--check");

const sourcePackage = JSON.parse(
  readFileSync(join(sourcePackageDir, "package.json"), "utf8"),
) as {
  name: string;
  version: string;
  description: string;
  license: string;
  type: string;
  main: string;
  module: string;
  types: string;
  exports: Record<string, unknown>;
};

const vendorPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  description: sourcePackage.description,
  license: sourcePackage.license,
  type: sourcePackage.type,
  private: true,
  files: ["dist/", "tokens.json", "tokens.schema.json", "README.md"],
  main: sourcePackage.main,
  module: sourcePackage.module,
  types: sourcePackage.types,
  exports: sourcePackage.exports,
};

const generatedFiles = new Map<string, string>();
generatedFiles.set("package.json", `${JSON.stringify(vendorPackage, null, 2)}\n`);
for (const file of ["tokens.json", "tokens.schema.json", "README.md"]) {
  generatedFiles.set(file, readFileSync(join(sourcePackageDir, file), "utf8"));
}

const templateNames = readdirSync(templatesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(templatesDir, name, "package.json")))
  .sort();

const drift: string[] = [];

for (const templateName of templateNames) {
  const vendorDir = join(templatesDir, templateName, "vendor", "ua-tokens");
  const distDir = join(vendorDir, "dist");

  for (const [relativePath, content] of generatedFiles) {
    const target = join(vendorDir, relativePath);
    if (checkOnly) {
      if (!existsSync(target) || readFileSync(target, "utf8") !== content) {
        drift.push(relative(repoRoot, target));
      }
    } else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }

  if (checkOnly) {
    compareDirectory(join(sourcePackageDir, "dist"), distDir, drift);
  } else {
    rmSync(distDir, { recursive: true, force: true });
    cpSync(join(sourcePackageDir, "dist"), distDir, { recursive: true });
  }

  if (templateName === "hugo") {
    const hugoTokensCss = join(templatesDir, templateName, "static", "css", "tokens.css");
    const sourceTokensCss = join(sourcePackageDir, "dist", "tokens.css");
    if (checkOnly) {
      if (!existsSync(hugoTokensCss) || readFileSync(hugoTokensCss, "utf8") !== readFileSync(sourceTokensCss, "utf8")) {
        drift.push(relative(repoRoot, hugoTokensCss));
      }
    } else {
      mkdirSync(dirname(hugoTokensCss), { recursive: true });
      writeFileSync(hugoTokensCss, readFileSync(sourceTokensCss, "utf8"));
    }
  }
}

if (checkOnly && drift.length) {
  console.error("Template token vendors are out of date:");
  for (const file of drift) {
    console.error(`  - ${file}`);
  }
  console.error("Run `bun run sync:template-token-vendors`.");
  process.exit(1);
}

console.log(
  checkOnly
    ? "Template token vendors are current"
    : `Synced @ua/ua-tokens into ${templateNames.length} template vendor directories`,
);

function compareDirectory(sourceDir: string, targetDir: string, changed: string[]): void {
  const expected = readdirSync(sourceDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(sourceDir, join(entry.parentPath, entry.name)))
    .sort();

  for (const file of expected) {
    const source = join(sourceDir, file);
    const target = join(targetDir, file);
    if (!existsSync(target) || readFileSync(source, "utf8") !== readFileSync(target, "utf8")) {
      changed.push(relative(repoRoot, target));
    }
  }
}

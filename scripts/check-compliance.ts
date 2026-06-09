#!/usr/bin/env bun
// Brand-compliance lint for templates/ — the automated slice of the
// ua-site-compliance audit checklist. Fails on:
//   1. raw hex colors outside email-html (emails may inline hex sourced from
//      @ua/ua-tokens — documented exception in AGENTS.md)
//   2. off-brand font families outside email-html fallback stacks
//   3. manual @media (prefers-color-scheme) CSS overrides (semantic tokens
//      already flip; see docs/DARK_MODE.md)
//   4. secret-shaped values that should be CONFIGURE_ME markers

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "..");
const TEMPLATES = join(ROOT, "templates");

const SOURCE_EXTENSIONS = new Set([
  ".css", ".scss", ".html", ".tsx", ".ts", ".js", ".astro", ".ejs", ".twig", ".theme",
]);
const SKIP_DIRS = new Set(["node_modules", "dist", "vendor", "public", "resources"]);
const isSkippableDir = (name: string) => SKIP_DIRS.has(name) || name.startsWith(".");
// Generated token copies (tokens:sync scripts) legitimately contain hex.
const SKIP_FILES = [/tokens\.css$/];
// Whole-template exception: email clients need inline hex + broad font stacks.
const EXEMPT_TEMPLATES = new Set(["email-html"]);

const HEX = /#[0-9A-Fa-f]{3,8}\b/;
const OFF_BRAND_FONTS = /font-family[^;]*\b(Inter|Open Sans|Montserrat|Lato|Poppins|Raleway|Nunito)\b/i;
const DARK_OVERRIDE = /@media\s*\(\s*prefers-color-scheme/;
const SECRET_SHAPED = /(client_secret|poolId|userPoolId|COGNITO_CLIENT_SECRET)\s*[:=]\s*["'][^"']{8,}["']/i;
const COMMENT_LINE = /^\s*(\/\/|\/?\*|<!--|#)/;

type Finding = { file: string; line: number; rule: string; text: string };
const findings: Finding[] = [];

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (!isSkippableDir(entry)) yield* walk(path);
      continue;
    }
    const ext = entry.slice(entry.lastIndexOf("."));
    if (SOURCE_EXTENSIONS.has(ext) && !SKIP_FILES.some((p) => p.test(entry))) yield path;
  }
}

for (const template of readdirSync(TEMPLATES)) {
  const templateDir = join(TEMPLATES, template);
  if (!statSync(templateDir).isDirectory()) continue;
  const exempt = EXEMPT_TEMPLATES.has(template);

  for (const file of walk(templateDir)) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((text, i) => {
      const line = i + 1;
      const isComment = COMMENT_LINE.test(text);

      if (!exempt && !isComment && HEX.test(text)) {
        findings.push({ file: rel, line, rule: "raw-hex", text: text.trim() });
      }
      if (!exempt && OFF_BRAND_FONTS.test(text)) {
        findings.push({ file: rel, line, rule: "off-brand-font", text: text.trim() });
      }
      if (!exempt && !isComment && DARK_OVERRIDE.test(text)) {
        findings.push({ file: rel, line, rule: "manual-dark-override", text: text.trim() });
      }
      if (SECRET_SHAPED.test(text) && !text.includes("CONFIGURE_ME")) {
        findings.push({ file: rel, line, rule: "secret-shaped-value", text: text.trim() });
      }
    });
  }
}

if (findings.length > 0) {
  console.error(`${findings.length} compliance finding(s) in templates/:\n`);
  for (const f of findings) {
    console.error(`  [${f.rule}] ${f.file}:${f.line}`);
    console.error(`      ${f.text.slice(0, 120)}`);
  }
  console.error("\nUse semantic tokens from @ua/ua-tokens — see docs/LLM_GUIDE.md.");
  process.exit(1);
}

console.log("✓ templates/ pass brand compliance checks");

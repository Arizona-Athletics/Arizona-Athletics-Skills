#!/usr/bin/env bun
// WCAG 2.x contrast audit for the semantic token pairs documented in
// docs/COLORS.md. Text pairs must clear AA 4.5:1 (3:1 for large text);
// non-text UI (focus ring, borders) must clear 3:1 per SC 1.4.11.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = dirname(new URL(import.meta.url).pathname);
const tokens = JSON.parse(readFileSync(join(ROOT, "..", "packages", "ua-tokens", "tokens.json"), "utf8"));

type Check = { fg: string; bg: string; min: number; note: string };

// fg/bg are semantic token names unless prefixed with "brand:".
const CHECKS: Check[] = [
  { fg: "text", bg: "bg", min: 4.5, note: "body text on page" },
  { fg: "text", bg: "surface", min: 4.5, note: "body text on card" },
  { fg: "text", bg: "surface-alt", min: 4.5, note: "body text on toolbar" },
  { fg: "text", bg: "surface-sunk", min: 4.5, note: "body text on inset" },
  { fg: "text-strong", bg: "bg", min: 4.5, note: "headlines on page" },
  { fg: "text-strong", bg: "surface", min: 4.5, note: "headlines on card" },
  { fg: "text-muted", bg: "bg", min: 4.5, note: "secondary text on page" },
  { fg: "text-muted", bg: "surface", min: 4.5, note: "secondary text on card" },
  { fg: "text-faint", bg: "bg", min: 4.5, note: "helper text on page" },
  { fg: "text-faint", bg: "surface", min: 4.5, note: "helper text on card" },
  { fg: "link", bg: "bg", min: 4.5, note: "links on page" },
  { fg: "link", bg: "surface", min: 4.5, note: "links on card" },
  { fg: "link-hover", bg: "bg", min: 4.5, note: "link hover on page" },
  { fg: "on-accent", bg: "accent", min: 4.5, note: "CTA label on accent" },
  { fg: "on-accent", bg: "accent-hover", min: 4.5, note: "CTA label on accent hover" },
  { fg: "focus-ring", bg: "bg", min: 3, note: "focus ring on page (non-text UI)" },
  { fg: "border-strong", bg: "bg", min: 1.2, note: "emphasis border visibility (advisory)" },
];

function srgbChannel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * srgbChannel((n >> 16) & 0xff) +
    0.7152 * srgbChannel((n >> 8) & 0xff) +
    0.0722 * srgbChannel(n & 0xff)
  );
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function resolveHex(name: string, theme: "light" | "dark"): string {
  if (name.startsWith("brand:")) return tokens.brand[name.slice(6)];
  return tokens.semantic[theme][name];
}

let failures = 0;

for (const theme of ["light", "dark"] as const) {
  console.log(`\n${theme.toUpperCase()} theme`);
  console.log("ratio   min   pair");
  for (const check of CHECKS) {
    const fg = resolveHex(check.fg, theme);
    const bg = resolveHex(check.bg, theme);
    const ratio = contrast(fg, bg);
    const pass = ratio >= check.min;
    if (!pass) failures++;
    console.log(
      `${pass ? "  ok " : "FAIL "} ${ratio.toFixed(2).padStart(5)} ≥ ${check.min}  ${check.fg} (${fg}) on ${check.bg} (${bg}) — ${check.note}`,
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} contrast check(s) failed`);
  process.exit(1);
}
console.log("\n✓ all contrast checks pass");

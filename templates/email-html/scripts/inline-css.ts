#!/usr/bin/env bun
/**
 * inline-css.ts — stub for inlining <style> blocks into email templates.
 *
 * Why this exists
 * ----------------
 * Some email clients (Gmail web with Promotions tab, Outlook Web,
 * Yahoo, AOL, and most third-party iOS mail clients) strip the
 * <style> block in <head>. Critical layout styles in this repo are
 * ALREADY inlined per element — that is the load-bearing fallback.
 * The <style> block adds only:
 *
 *   1. Mobile media queries (.container-600, .px-mobile, .card-col)
 *   2. Dark-mode (prefers-color-scheme + [data-ogsc])
 *   3. A few resets
 *
 * For maximum belt-and-suspenders compatibility you can run every
 * media-query-eligible rule through an inliner that walks the DOM
 * and merges matching rules into element style="" attributes.
 *
 * Status
 * ------
 * INTENTIONAL STUB. Ships with zero runtime dependencies. Extend it
 * when you're ready to ship. The shortest path is to add `juice`:
 *
 *   bun add -d juice
 *
 * then replace `runStub` below with:
 *
 *   import juice from "juice";
 *   import { readFileSync, writeFileSync } from "node:fs";
 *   import { globSync } from "node:fs";
 *
 *   for (const src of globSync("src/(transactional|marketing)/*.html")) {
 *     const html = readFileSync(src, "utf8");
 *     const inlined = juice(html, {
 *       preserveMediaQueries: true,   // keep @media for dark mode + responsive
 *       preserveFontFaces: true,
 *       removeStyleTags: false,        // keep the <style> block as the source of media queries
 *     });
 *     const dest = src.replace(/\.html$/, ".inlined.html");
 *     writeFileSync(dest, inlined);
 *     console.log(`wrote ${dest}`);
 *   }
 *
 * Tokens
 * ------
 * If you want the inliner to be aware of @ua/ua-tokens, import the
 * JSON directly and assert that every email-body hex matches:
 *
 *   import tokens from "@ua/ua-tokens/tokens.json" with { type: "json" };
 *   const required = [tokens.brand.red, tokens.brand.blue, tokens.brand["warm-gray"]];
 *
 * That way you fail fast if anyone snuck a non-token hex into a template.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC_DIRS = ["src/transactional", "src/marketing", "src/partials"];

function listHtml(dir: string): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(abs, f))
    .filter((p) => statSync(p).isFile());
}

function runStub(): void {
  console.log("@ua/template-email-html — inline-css.ts (stub)\n");
  console.log("This is a stub. It lists every template and confirms the file");
  console.log("structure is intact, but does NOT inline CSS.\n");
  console.log("To enable real inlining, install `juice` and extend this script.");
  console.log("See the top-of-file comment for the 12-line implementation.\n");

  let count = 0;
  for (const dir of SRC_DIRS) {
    const files = listHtml(dir);
    if (files.length === 0) continue;
    console.log(`${dir}/`);
    for (const f of files) {
      console.log(`  - ${relative(ROOT, f)}`);
      count++;
    }
  }
  console.log(`\n${count} HTML file(s) found.`);
  console.log("\nReminder: critical layout CSS is already inlined per element");
  console.log("in every template. The <style> block adds only mobile media");
  console.log("queries + dark-mode enhancements. The templates work without");
  console.log("any inlining step — this script is for belt-and-suspenders.");
}

runStub();

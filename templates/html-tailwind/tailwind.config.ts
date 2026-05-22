import type { Config } from "tailwindcss";
// The UA preset ships as a CommonJS module produced by @ua/ua-tokens's build.
// It is the single source of truth for UA Athletics colors, type, spacing,
// radii, and shadows. Tailwind 4 still honors `presets` from JS configs, so
// we wire the workspace preset rather than hand-rolling `theme.extend.colors`.
//
// Brand utilities exposed by the preset:
//   bg-ua-red, bg-ua-blue, text-ua-warm-gray, …
//
// Semantic utilities (resolve through CSS variables, so dark mode flips for free):
//   bg-semantic-bg, bg-semantic-surface, text-semantic-text,
//   text-semantic-text-strong, border-semantic-border, …
//
// Default to the semantic utilities. Reach for the brand ones only for one-off
// identity accents — see /AGENTS.md and /docs/COLORS.md.
import uaPreset from "@ua/ua-tokens/tailwind";

const config: Config = {
  presets: [uaPreset as Config],
  content: [
    "./index.html",
    "./src/**/*.{css,html,js,ts}",
  ],
};

export default config;

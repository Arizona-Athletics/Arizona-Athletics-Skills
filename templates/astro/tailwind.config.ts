import type { Config } from "tailwindcss";
// The UA preset ships as a CommonJS module produced by @ua/ua-tokens's build.
// It is the single source of truth for UA Athletics colors, type, spacing,
// radii, and shadows. Tailwind 4 still honors `presets` from JS configs.
import uaPreset from "@ua/ua-tokens/tailwind";

const config: Config = {
  presets: [uaPreset as Config],
  content: ["./src/**/*.{astro,ts,tsx,html}"],
};

export default config;

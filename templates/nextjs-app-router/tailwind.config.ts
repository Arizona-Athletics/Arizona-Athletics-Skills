import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import uaPreset from "@ua/ua-tokens/tailwind";

/**
 * Tailwind 4 config that consumes the @ua/ua-tokens preset.
 *
 * The preset wires the UA brand palette (`bg-ua-red`, `text-ua-blue`) and the
 * semantic token utilities (`bg-semantic-bg`, `text-semantic-text-strong`, etc.)
 * that map to CSS variables and flip automatically in dark mode. Templates
 * should default to the semantic utilities and reach for brand utilities only
 * for one-off identity accents.
 */
const config: Config = {
  presets: [uaPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
};

export default config;

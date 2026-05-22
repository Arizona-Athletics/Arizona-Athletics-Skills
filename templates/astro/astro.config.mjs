// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Output: "static" — the PKCE callback runs entirely in the browser, so this
// template ships as static HTML/CSS/JS. If a future project needs server-side
// auth (Authorization Code with client secret), swap `output: "static"` for
// `output: "server"` and add an adapter (e.g. `@astrojs/node`). See docs/AUTH.md.
//
// Tailwind 4 note: we wire Tailwind via `@tailwindcss/vite` rather than
// `@astrojs/tailwind`. The legacy `@astrojs/tailwind` integration is pinned to
// Tailwind 3 and Astro ≤5. Astro 6 + Tailwind 4 uses the Vite plugin directly,
// which matches the react-vite-plus template in this repo.
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});

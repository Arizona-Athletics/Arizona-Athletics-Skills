import type { NextConfig } from "next";

/**
 * Next.js 16 config for the UA Athletics App Router template.
 *
 * - React Compiler is enabled for automatic memoization (Next 16 ships it stable).
 * - Turbopack is the default dev bundler in Next 16; the `dev` script opts in
 *   explicitly with `--turbopack`. Build uses the default (currently webpack
 *   in Next 16; Turbopack builds are still flagged in some Next 16.x releases).
 * - Strict React mode stays on; it catches double-render bugs early.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
};

export default nextConfig;

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  // CONFIGURE_ME: replace with the site title and description for this project.
  title: "Arizona Athletics",
  description: "University of Arizona Athletics.",
};

/**
 * FOUC-safe pre-paint theme script.
 *
 * Inlined in <head> via dangerouslySetInnerHTML so it parses and runs BEFORE
 * any stylesheet evaluates. The script reads `ua-theme` from localStorage,
 * resolves `system` to `light | dark` against `prefers-color-scheme`, and
 * writes `data-theme` / `data-bs-theme` / `data-theme-mode` to <html>. Without
 * this, dark-mode visitors see a white flash on every navigation.
 *
 * Source of truth: docs/DARK_MODE.md. Do not "modernize" the ES5 / var idiom —
 * the script must parse on every browser without a transpile step.
 */
const themeBootstrap = `(function () {
  try {
    var stored = localStorage.getItem("ua-theme");
    var mode = stored || "system";
    var resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    var html = document.documentElement;
    html.dataset.theme = resolved;
    html.dataset.bsTheme = resolved;
    html.dataset.themeMode = mode;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* MUST be the first thing inside <head>, before any stylesheet link. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-semantic-bg text-semantic-text">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

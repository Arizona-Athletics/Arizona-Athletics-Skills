/**
 * Canonical theme helpers for the UA Athletics Astro template.
 *
 * The inline bootstrap in BaseLayout.astro already set
 *   document.documentElement.dataset.theme       // resolved: "light" | "dark"
 *   document.documentElement.dataset.bsTheme     // mirror for Bootstrap
 *   document.documentElement.dataset.themeMode   // raw: "system" | "light" | "dark"
 *
 * Everything below assumes those attributes exist on first paint. See
 * docs/DARK_MODE.md for the full rationale.
 */

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "ua-theme";

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Set the theme from the toggle. Writes both the resolved attribute and the
 * mode itself, then persists the mode (not the resolved value — we want
 * `system` to keep following the OS across visits).
 */
export function setTheme(mode: ThemeMode): void {
  const resolved = resolve(mode);
  const html = document.documentElement;
  html.dataset.theme = resolved;
  html.dataset.bsTheme = resolved;
  html.dataset.themeMode = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private-mode browsers may throw on write; ignore — DOM state is the
    // source of truth for the current session.
  }
}

/**
 * Subscribe to OS-level dark-mode changes. Only flips the page if the user
 * is still in `system` mode; explicit `light` / `dark` choices are honored
 * until the user switches back to `system`.
 *
 * Returns a teardown function. Idempotent — safe to call from multiple
 * components on the same page.
 */
let watching = false;
export function watchSystemTheme(): () => void {
  if (watching || typeof window === "undefined") {
    return () => {};
  }
  watching = true;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent): void => {
    if (document.documentElement.dataset.themeMode !== "system") return;
    const resolved: ResolvedTheme = e.matches ? "dark" : "light";
    const html = document.documentElement;
    html.dataset.theme = resolved;
    html.dataset.bsTheme = resolved;
  };
  mq.addEventListener("change", handler);
  return () => {
    mq.removeEventListener("change", handler);
    watching = false;
  };
}

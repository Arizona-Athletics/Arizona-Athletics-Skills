/**
 * Client-side theme helpers for the UA Athletics design system.
 *
 * The pre-paint script in `app/layout.tsx` runs before this module loads and
 * is the single source of truth for the *first paint*. Everything here only
 * matters once the React tree has mounted — toggling via the ThemeToggle and
 * reacting to OS-level changes.
 *
 * Canonical reference: docs/DARK_MODE.md.
 */

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "ua-theme";

const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Resolve a `system` mode to a concrete `light | dark` value by asking the OS.
 * Forced modes pass through unchanged.
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    if (!isBrowser()) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Read the current mode from the DOM dataset attribute set by the pre-paint
 * script. Returns `system` if the attribute is missing or invalid.
 */
export function getThemeMode(): ThemeMode {
  if (!isBrowser()) return "system";
  const value = document.documentElement.dataset["themeMode"];
  return value === "light" || value === "dark" || value === "system"
    ? value
    : "system";
}

/**
 * Canonical setter. Updates DOM dataset attributes and localStorage so the
 * toggle, the system-change listener, and the next page load all agree.
 *
 * - We persist `mode`, not `resolved`. A user who picks `system` should stay
 *   on `system` on the next visit, not on whatever it happened to resolve to.
 * - All three dataset attributes are written every time, so consumers
 *   (Bootstrap-aware components, token-aware components) never disagree.
 */
export function setTheme(mode: ThemeMode): void {
  if (!isBrowser()) return;
  const resolved = resolveTheme(mode);
  const html = document.documentElement;
  html.dataset["theme"] = resolved;
  html.dataset["bsTheme"] = resolved;
  html.dataset["themeMode"] = mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* private mode / blocked storage — DOM state is enough for this tab. */
  }
}

/**
 * Subscribe to OS-level color-scheme changes. Only acts when the user is in
 * `system` mode; otherwise the explicit choice wins.
 *
 * Returns an unsubscribe function suitable for a React effect cleanup.
 */
export function subscribeToSystemTheme(): () => void {
  if (!isBrowser()) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent): void => {
    if (getThemeMode() !== "system") return;
    const resolved: ResolvedTheme = e.matches ? "dark" : "light";
    document.documentElement.dataset["theme"] = resolved;
    document.documentElement.dataset["bsTheme"] = resolved;
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/** Cycle order for the single-button ThemeToggle: system → light → dark → system. */
export function nextMode(current: ThemeMode): ThemeMode {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

/**
 * UA Athletics theme helper.
 *
 * The contract (see docs/DARK_MODE.md):
 *   - User-facing modes:        "system" | "light" | "dark"
 *   - Persistence:              localStorage key `ua-theme`, value = the *mode*
 *   - DOM state on `<html>`:    data-theme       — resolved value ("light" | "dark")
 *                               data-bs-theme    — same, kept in sync for AZ Digital
 *                                                  Bootstrap consumers
 *                               data-theme-mode  — the chosen *mode* (so the toggle
 *                                                  UI can render the active state)
 *
 * The FOUC-safe pre-paint script in `index.html` already sets these three
 * datasets before the first style is applied; this module is what the
 * `ThemeToggle` calls at runtime.
 */
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "ua-theme" as const;

function prefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return prefersDark() ? "dark" : "light";
  return mode;
}

/**
 * Read the persisted mode. Falls back to "system" when nothing is stored or
 * when localStorage access throws (private-mode browsers).
 */
export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
  } catch {
    return "system";
  }
}

/**
 * Apply a theme mode: update the three `<html>` datasets and persist the mode
 * (not the resolved value) so the user's next visit also follows `system` if
 * that is what they picked.
 */
export function setTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const resolved = resolve(mode);
  const html = document.documentElement;
  html.dataset["theme"] = resolved;
  html.dataset["bsTheme"] = resolved;
  html.dataset["themeMode"] = mode;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Private-mode browsers can throw on write. The DOM datasets are already
    // updated, so the page still reflects the choice for this session.
  }
}

/**
 * Subscribe to OS-level dark-mode changes. The callback fires only when the
 * user is currently in `system` mode — explicit `light` / `dark` choices
 * are honored as user overrides per the spec in docs/DARK_MODE.md.
 *
 * Returns an unsubscribe function for use with React's useEffect cleanup.
 */
export function listenForSystemChanges(
  onChange: (resolved: ResolvedTheme) => void,
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (event: MediaQueryListEvent): void => {
    if (document.documentElement.dataset["themeMode"] !== "system") return;
    const resolved: ResolvedTheme = event.matches ? "dark" : "light";
    document.documentElement.dataset["theme"] = resolved;
    document.documentElement.dataset["bsTheme"] = resolved;
    onChange(resolved);
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/** Cycle order for the single-button ThemeToggle variant. */
export const THEME_CYCLE: readonly ThemeMode[] = ["system", "light", "dark"] as const;

/** Return the next mode in the cycle (system → light → dark → system). */
export function nextThemeMode(current: ThemeMode): ThemeMode {
  const idx = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
  // `next` is non-undefined because the modulo is bounded by THEME_CYCLE.length,
  // but `noUncheckedIndexedAccess` widens to `T | undefined`, so narrow here.
  return next ?? "system";
}

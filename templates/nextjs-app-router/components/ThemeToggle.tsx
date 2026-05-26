"use client";

import { useEffect, useState } from "react";
import {
  type ThemeMode,
  getThemeMode,
  nextMode,
  setTheme,
  subscribeToSystemTheme,
} from "@/lib/theme";

/**
 * Three-state theme toggle (system / light / dark) rendered as a single
 * cycle button. Persists to localStorage under `ua-theme`.
 *
 * Hydration: on the server we don't know the user's persisted choice, so we
 * render with `defaultMode` (default: "system") and update once after mount
 * by reading the dataset attribute the pre-paint script wrote. This avoids
 * any mismatch between server HTML and the post-mount paint.
 */
export function ThemeToggle({
  defaultMode = "system",
  label = "Theme",
}: {
  defaultMode?: ThemeMode;
  label?: string;
}): React.ReactElement {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(getThemeMode());
    setMounted(true);
    return subscribeToSystemTheme();
  }, []);

  function handleClick(): void {
    const next = nextMode(mode);
    setMode(next);
    setTheme(next);
  }

  // Per-state icon and label. Icons are inline SVGs that inherit currentColor
  // so they automatically pick up `text-semantic-text-strong` in both themes.
  const states: Record<ThemeMode, { icon: React.ReactElement; verb: string }> =
    {
      system: { icon: <SystemIcon />, verb: "System" },
      light: { icon: <SunIcon />, verb: "Light" },
      dark: { icon: <MoonIcon />, verb: "Dark" },
    };
  const current = states[mode];

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${label}: ${current.verb.toLowerCase()}. Activate to switch.`}
      // Visibility-only fix: until we've read the persisted value, show "system"
      // styling. Once mounted we may swap; suppressHydrationWarning would be
      // wrong because no DOM attribute changes between server and first client
      // paint (only the icon does, after the useEffect).
      aria-live="polite"
      className="
        inline-flex h-9 w-9 items-center justify-center
        rounded-pill border border-semantic-border
        bg-semantic-surface-alt
        text-semantic-text-strong
        transition-colors
        hover:bg-semantic-surface
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
      "
    >
      {/* Render with a stable wrapper so React reconciles cleanly on mode change. */}
      <span aria-hidden="true" className="block h-4 w-4">
        {mounted ? current.icon : states[defaultMode].icon}
      </span>
    </button>
  );
}

function SunIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

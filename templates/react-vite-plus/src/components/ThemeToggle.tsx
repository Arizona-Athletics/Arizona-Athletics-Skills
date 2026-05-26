import { useEffect, useState } from "react";
import {
  type ThemeMode,
  getTheme,
  listenForSystemChanges,
  nextThemeMode,
  setTheme,
} from "../lib/theme";

const ICONS: Record<ThemeMode, string> = {
  system: "desktop_windows",
  light: "light_mode",
  dark: "dark_mode",
};

const LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(getTheme());
    setMounted(true);
    return listenForSystemChanges(() => {});
  }, []);

  const handleClick = () => {
    const next = nextThemeMode(mode);
    setMode(next);
    setTheme(next);
  };

  const current = mounted ? mode : "system";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-arizona-header"
      aria-label={`Theme: ${LABELS[current].toLowerCase()}. Activate to switch.`}
    >
      <span aria-hidden="true" className="icon material-symbols-rounded">
        {ICONS[current]}
      </span>
      <span className="icon-text">{LABELS[current]}</span>
    </button>
  );
}

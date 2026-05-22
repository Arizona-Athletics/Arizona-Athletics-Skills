import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ua-theme";

function resolveInitial(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-bs-theme");
  if (attr === "light" || attr === "dark") return attr;
  return "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(resolveInitial);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-bs-theme", theme);
    html.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-arizona-header"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      <span aria-hidden="true" className="icon material-symbols-rounded">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      <span className="icon-text">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

/*
 * @ua/template-html-tailwind · theme.js
 *
 * Runtime theme controller for the UA Athletics design system.
 *
 * Pairs with the pre-paint bootstrap script in index.html <head>, which
 * already set:
 *   document.documentElement.dataset.theme      = "light" | "dark"  (resolved)
 *   document.documentElement.dataset.bsTheme    = "light" | "dark"  (AZ Bootstrap mirror)
 *   document.documentElement.dataset.themeMode  = "system" | "light" | "dark"
 *
 * Responsibilities of this file:
 *   1. Provide the canonical setTheme(mode) helper from /docs/DARK_MODE.md.
 *   2. Listen for OS-level prefers-color-scheme changes while mode is "system".
 *   3. Wire up the #ua-theme-toggle button to cycle: system -> light -> dark -> system.
 *   4. Reflect the current mode in the toggle's label, icon, and aria-label.
 *
 * Vanilla JS, no bundler. Plain <script> tag (deferred from index.html).
 */

(function () {
  "use strict";

  var STORAGE_KEY = "ua-theme";
  var MODES = ["system", "light", "dark"];

  // -------------------------------------------------------------
  // Canonical setTheme — must match /docs/DARK_MODE.md.
  // Side-effect heavy; state lives on <html> and in localStorage.
  // -------------------------------------------------------------
  function setTheme(mode) {
    var resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    var html = document.documentElement;
    html.dataset.theme = resolved;
    html.dataset.bsTheme = resolved;
    html.dataset.themeMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // Private-mode / disabled storage — DOM state still applied.
    }
  }

  // Expose for debugging / external callers (optional).
  window.UA = window.UA || {};
  window.UA.setTheme = setTheme;

  // -------------------------------------------------------------
  // System-preference listener.
  // Honor OS-level changes ONLY when the user is in "system" mode.
  // -------------------------------------------------------------
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange(e) {
    if (document.documentElement.dataset.themeMode !== "system") return;
    var resolved = e.matches ? "dark" : "light";
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.bsTheme = resolved;
  }
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onSystemChange);
  } else if (typeof mq.addListener === "function") {
    // Safari < 14
    mq.addListener(onSystemChange);
  }

  // -------------------------------------------------------------
  // Toggle UI: cycle-button using Material Symbols Rounded icons.
  // -------------------------------------------------------------
  var ICONS = {
    system: "contrast",
    light: "light_mode",
    dark: "dark_mode"
  };
  var LABELS = {
    system: "System",
    light: "Light",
    dark: "Dark"
  };

  function nextMode(current) {
    var i = MODES.indexOf(current);
    if (i === -1) return "light";
    return MODES[(i + 1) % MODES.length];
  }

  function reflect(button) {
    var mode = document.documentElement.dataset.themeMode || "system";
    var iconEl = button.querySelector(".ua-theme-toggle__icon");
    var labelEl = button.querySelector(".ua-theme-toggle__label");
    if (iconEl) iconEl.textContent = ICONS[mode];
    if (labelEl) labelEl.textContent = LABELS[mode];
    button.setAttribute(
      "aria-label",
      "Theme: " + LABELS[mode].toLowerCase() + ". Activate to switch."
    );
    button.dataset.themeMode = mode;
  }

  function wireToggle() {
    var btn = document.getElementById("ua-theme-toggle");
    if (!btn) return;
    reflect(btn);
    btn.addEventListener("click", function () {
      var current = document.documentElement.dataset.themeMode || "system";
      setTheme(nextMode(current));
      reflect(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggle);
  } else {
    wireToggle();
  }

  // -------------------------------------------------------------
  // Stamp the current year into the footer copyright line.
  // -------------------------------------------------------------
  function stampYear() {
    var el = document.getElementById("ua-footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stampYear);
  } else {
    stampYear();
  }
})();

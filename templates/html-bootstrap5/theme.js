/*
 * @ua/template-html-bootstrap5 · theme.js
 *
 * Runtime theme controller for the UA Athletics design system.
 *
 * Pairs with the pre-paint bootstrap script in <head> of index.html, which has
 * already set on <html>:
 *   data-theme       = "light" | "dark"            (resolved palette)
 *   data-bs-theme    = "light" | "dark"            (Arizona Bootstrap mirror)
 *   data-theme-mode  = "system" | "light" | "dark" (user-selected mode)
 *
 * This file:
 *   1. Provides the canonical setTheme(mode) helper from /docs/DARK_MODE.md.
 *   2. Listens for OS prefers-color-scheme changes while the user is in "system".
 *   3. Cycles every [data-ua-theme-toggle] button through system → light → dark.
 *   4. Reflects the current mode in the toggle's icon, label, and aria-label.
 *   5. Stamps the current year into any [data-ua-year] element.
 *
 * Plain script tag, no bundler. ES5-style to keep parity with the FOUC bootstrap.
 */

(function () {
  "use strict";

  var STORAGE_KEY = "ua-theme";
  var MODES = ["system", "light", "dark"];

  // Material Symbols Rounded glyph names for each mode (loaded via the
  // Material Symbols Rounded stylesheet in <head>).
  var ICONS = {
    system: "brightness_auto",
    light: "light_mode",
    dark: "dark_mode"
  };
  var LABELS = {
    system: "System",
    light: "Light",
    dark: "Dark"
  };

  // -------------------------------------------------------------
  // Canonical setTheme — see /docs/DARK_MODE.md.
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

  // Expose for external callers / debugging.
  window.UA = window.UA || {};
  window.UA.setTheme = setTheme;

  // -------------------------------------------------------------
  // OS-level prefers-color-scheme listener.
  // Honor system changes ONLY while the user is in "system" mode.
  // -------------------------------------------------------------
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function onSystemChange(e) {
    if (document.documentElement.dataset.themeMode !== "system") return;
    var resolved = e.matches ? "dark" : "light";
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.bsTheme = resolved;
    reflectAll();
  }
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onSystemChange);
  } else if (typeof mq.addListener === "function") {
    // Safari < 14
    mq.addListener(onSystemChange);
  }

  // -------------------------------------------------------------
  // Toggle wiring
  // -------------------------------------------------------------
  function nextMode(current) {
    var i = MODES.indexOf(current);
    if (i === -1) return "light";
    return MODES[(i + 1) % MODES.length];
  }

  function reflect(button) {
    var mode = document.documentElement.dataset.themeMode || "system";
    var iconEl = button.querySelector("[data-ua-theme-icon]");
    var labelEl = button.querySelector("[data-ua-theme-label]");
    if (iconEl) iconEl.textContent = ICONS[mode];
    if (labelEl) labelEl.textContent = LABELS[mode];
    button.setAttribute(
      "aria-label",
      "Theme: " + LABELS[mode].toLowerCase() + ". Activate to switch."
    );
    button.dataset.themeMode = mode;
  }

  function reflectAll() {
    var buttons = document.querySelectorAll("[data-ua-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) reflect(buttons[i]);
  }

  function wireToggles() {
    var buttons = document.querySelectorAll("[data-ua-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        reflect(btn);
        btn.addEventListener("click", function () {
          var current = document.documentElement.dataset.themeMode || "system";
          setTheme(nextMode(current));
          reflectAll();
        });
      })(buttons[i]);
    }
  }

  // -------------------------------------------------------------
  // Year stamp — any element with [data-ua-year] gets the current year.
  // -------------------------------------------------------------
  function stampYear() {
    var nodes = document.querySelectorAll("[data-ua-year]");
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = year;
  }

  function init() {
    wireToggles();
    stampYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

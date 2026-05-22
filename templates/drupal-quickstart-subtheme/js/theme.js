/**
 * @file
 * UA Athletics light/dark theme controller — Drupal behavior wrapper.
 *
 * Pairs with the FOUC-safe pre-paint server stamp in
 * ua_athletics_starter.theme :: ua_athletics_starter_preprocess_html(), which
 * reads the `ua-theme` cookie and writes data-bs-theme / data-theme onto
 * <html> before the first paint.
 *
 * Responsibilities:
 *   1. Override the server-stamped theme with the actual stored preference on
 *      first paint (the server can't read system preference, only the cookie).
 *   2. Listen for OS-level prefers-color-scheme changes while mode is "system".
 *   3. Wire #ua-theme-toggle to cycle system → light → dark → system.
 *   4. Persist the choice in both localStorage AND a cookie (so SSR can see it).
 *
 * Uses Drupal.behaviors so it survives Drupal AJAX refreshes (BigPipe,
 * Views auto-refresh, comment posting, etc.).
 *
 * Canonical mode contract — see /docs/DARK_MODE.md at the repo root.
 */

(function (Drupal, once) {
  'use strict';

  var STORAGE_KEY = 'ua-theme';
  var COOKIE_KEY = 'ua-theme';
  var MODES = ['system', 'light', 'dark'];
  var ICONS = { system: 'A', light: 'L', dark: 'D' };
  var LABELS = { system: 'System', light: 'Light', dark: 'Dark' };

  function readStoredMode() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && MODES.indexOf(stored) !== -1) return stored;
    } catch (e) {
      // localStorage disabled — fall through to cookie.
    }
    var match = document.cookie.match(/(?:^|;\s*)ua-theme=([^;]+)/);
    if (match && MODES.indexOf(match[1]) !== -1) return match[1];
    return 'system';
  }

  function persistMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
    // Cookie: 1 year, root path, SameSite=Lax. Not Secure so it works on
    // local non-HTTPS dev; promote to Secure in your settings.php / nginx layer.
    var maxAge = 60 * 60 * 24 * 365;
    document.cookie = COOKIE_KEY + '=' + encodeURIComponent(mode) +
      ';path=/;max-age=' + maxAge + ';SameSite=Lax';
  }

  function resolve(mode) {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }

  function setTheme(mode) {
    var resolved = resolve(mode);
    var html = document.documentElement;
    html.dataset.theme = resolved;
    html.dataset.bsTheme = resolved;
    html.dataset.themeMode = mode;
    persistMode(mode);
  }

  // Expose for external callers / debugging.
  window.UA = window.UA || {};
  window.UA.setTheme = setTheme;

  // Sync the server-stamped attribute set with the actual stored mode.
  // The SSR layer only sees the cookie; it can't read OS preference, so on
  // first paint we re-resolve here.
  setTheme(readStoredMode());

  // System-preference listener — only honored while in "system" mode.
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function onSystemChange(event) {
    if (document.documentElement.dataset.themeMode !== 'system') return;
    var resolved = event.matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.bsTheme = resolved;
  }
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onSystemChange);
  } else if (typeof mq.addListener === 'function') {
    // Safari < 14
    mq.addListener(onSystemChange);
  }

  function nextMode(current) {
    var i = MODES.indexOf(current);
    if (i === -1) return 'light';
    return MODES[(i + 1) % MODES.length];
  }

  function reflect(button) {
    var mode = document.documentElement.dataset.themeMode || 'system';
    var iconEl = button.querySelector('.ua-theme-toggle__icon');
    var labelEl = button.querySelector('.ua-theme-toggle__label');
    if (iconEl) iconEl.textContent = ICONS[mode];
    if (labelEl) labelEl.textContent = LABELS[mode];
    button.setAttribute(
      'aria-label',
      'Theme: ' + LABELS[mode].toLowerCase() + '. Activate to switch.'
    );
    button.dataset.themeMode = mode;
  }

  Drupal.behaviors.uaAthleticsThemeToggle = {
    attach: function (context) {
      var buttons = once('ua-theme-toggle', '#ua-theme-toggle, .ua-theme-toggle', context);
      buttons.forEach(function (btn) {
        reflect(btn);
        btn.addEventListener('click', function () {
          var current = document.documentElement.dataset.themeMode || 'system';
          setTheme(nextMode(current));
          reflect(btn);
        });
      });
    }
  };

  // Stamp current year into the footer if a placeholder exists.
  Drupal.behaviors.uaAthleticsFooterYear = {
    attach: function (context) {
      var nodes = once('ua-footer-year', '#ua-footer-year', context);
      nodes.forEach(function (el) {
        el.textContent = String(new Date().getFullYear());
      });
    }
  };
})(Drupal, once);

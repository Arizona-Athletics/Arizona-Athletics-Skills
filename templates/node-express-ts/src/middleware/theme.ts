/**
 * Theme middleware — reads the `ua-theme` cookie and exposes the resolved
 * mode to views as `res.locals.theme` ("light" | "dark") and the requested
 * mode as `res.locals.themeMode` ("system" | "light" | "dark").
 *
 * The browser-side toggle (see partials/theme-toggle.ejs + the FOUC-safe
 * pre-paint snippet in layouts/base.ejs) is the authoritative writer for
 * this cookie. The server only reads it so SSR markup matches the client's
 * resolved mode and there is NO flash of unstyled / wrong-theme content.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

function normalize(value: string | undefined): ThemeMode {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function themeMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const mode = normalize(req.cookies?.["ua-theme"]);
    // On the server we cannot read `prefers-color-scheme`, so "system" defaults
    // to "light". The pre-paint script in the browser swaps to dark when
    // appropriate BEFORE first paint. SSR-rendered HTML is fine either way
    // because every UA color is a CSS variable that flips automatically.
    const resolved: ResolvedTheme = mode === "dark" ? "dark" : "light";
    res.locals.themeMode = mode;
    res.locals.theme = resolved;
    next();
  };
}

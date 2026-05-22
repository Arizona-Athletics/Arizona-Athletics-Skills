/**
 * Security headers via Helmet, with a CSP that allows the assets the UA
 * Athletics templates rely on:
 *
 *   - Arizona Bootstrap CSS + JS from cdn.digital.arizona.edu.
 *   - Wordmark + Block A from cdn.digital.arizona.edu/logos/.
 *   - Material Symbols Rounded from fonts.googleapis.com / fonts.gstatic.com.
 *   - Adobe Typekit (Proxima Nova) from use.typekit.net.
 *
 * The CSP is intentionally tight — no inline scripts beyond the FOUC-safe
 * pre-paint, which we mark with a nonce per request.
 */

import crypto from "node:crypto";

import helmet from "helmet";
import type { Request, Response, NextFunction, RequestHandler } from "express";

export function securityMiddleware(): RequestHandler[] {
  const nonceMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  };

  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          // The inline pre-paint script in <head> uses a per-request nonce.
          // Helmet calls this with the raw Node req/res; cast to Express's
          // Response so TypeScript lets us read res.locals.cspNonce.
          (_req, res) => {
            const nonce = (res as unknown as Response).locals?.cspNonce ?? "";
            return `'nonce-${nonce}'`;
          },
          "https://cdn.digital.arizona.edu",
        ],
        styleSrc: [
          "'self'",
          // Bootstrap & Material Symbols inject inline styles — must allow.
          "'unsafe-inline'",
          "https://cdn.digital.arizona.edu",
          "https://fonts.googleapis.com",
          "https://use.typekit.net",
          "https://p.typekit.net",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://cdn.digital.arizona.edu",
          "https://p.typekit.net",
        ],
        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",
          "https://use.typekit.net",
          "https://cdn.digital.arizona.edu",
        ],
        connectSrc: [
          "'self'",
          "https://use.typekit.net",
          "https://p.typekit.net",
        ],
        // Cognito Hosted UI lives on a Cognito domain. The browser navigates
        // away (not an XHR) so connectSrc doesn't need it; formAction does.
        formAction: ["'self'", "https://*.amazoncognito.com"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    // HSTS only makes sense behind HTTPS. Helmet defaults are fine in prod;
    // disable in dev so the browser doesn't pin localhost.
    strictTransportSecurity: process.env.NODE_ENV === "production"
      ? { maxAge: 15552000, includeSubDomains: true }
      : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // allow CDN fonts/images
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  return [nonceMiddleware, helmetMiddleware];
}

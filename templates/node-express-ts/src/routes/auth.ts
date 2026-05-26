/**
 * Auth routes — login, callback, logout.
 *
 * Stubs only. The real Cognito/UA SAML wiring lands once the project has its
 * AWS app client configured. See /docs/AUTH.md for the full flow.
 *
 * NO real Cognito pool IDs, client IDs, secrets, or internal URLs live in
 * this file or anywhere else in this template. Every UA-specific value is a
 * CONFIGURE_ME placeholder in `.env.example`.
 */

import crypto from "node:crypto";

import { Router, type Request, type Response } from "express";

import { buildAuthorizeUrl, buildLogoutUrl, exchangeCodeForUser } from "../auth/cognito.js";

const router = Router();

/**
 * GET /auth/login
 *
 * Mint a `state` value, stash it on the session, and bounce the browser to
 * Cognito Hosted UI. Cognito then forwards the user to the UA SAML IdP for
 * NetID authentication (WebAuth + MFA per UA policy).
 */
router.get("/login", (req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString("base64url");
  if (req.session) {
    req.session.oauthState = state;
  }
  res.redirect(buildAuthorizeUrl(state));
});

/**
 * GET /auth/callback
 *
 * Cognito redirects here with `?code=...&state=...`. We validate state,
 * exchange code for tokens server-side (HTTP Basic with the client secret),
 * verify the ID token, and persist a slim user record on the session.
 */
router.get("/callback", async (req: Request, res: Response) => {
  const code = typeof req.query.code === "string" ? req.query.code : undefined;
  const returnedState = typeof req.query.state === "string" ? req.query.state : undefined;
  const expectedState = req.session?.oauthState;
  const returnTo = req.session?.returnTo ?? "/";

  // Always clear the one-time values, success or not.
  if (req.session) {
    delete req.session.oauthState;
    delete req.session.returnTo;
  }

  if (!code || !returnedState || returnedState !== expectedState) {
    res.status(400).render("pages/500", {
      title: "Sign-in failed",
      message:
        "Your sign-in attempt didn't complete. Head back to the homepage and try again.",
      status: 400,
    });
    return;
  }

  const user = await exchangeCodeForUser(code);
  if (!user) {
    // Stub: until exchangeCodeForUser is implemented, surface a clear message
    // rather than silently succeeding. See src/auth/cognito.ts.
    res.status(501).render("pages/500", {
      title: "Sign-in not configured",
      message:
        "Sign-in works once the project's Cognito app client is wired up. See docs/AUTH.md for the shape of the flow.",
      status: 501,
    });
    return;
  }

  if (req.session) {
    req.session.user = user;
  }
  res.redirect(returnTo);
});

/**
 * GET /auth/logout
 *
 * Two-phase: clear our local session first, then bounce the browser to
 * Cognito's `/logout` so the Cognito-side session is cleared too. Cognito
 * does NOT sign the user out of the UA SAML IdP — that is SSO-by-design.
 */
router.get("/logout", (req: Request, res: Response) => {
  const finishLogout = () => {
    res.clearCookie(req.app.locals.sessionCookieName ?? "ua.sid");
    res.redirect(buildLogoutUrl());
  };

  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error("[auth] session destroy failed", err);
      }
      finishLogout();
    });
  } else {
    finishLogout();
  }
});

export default router;

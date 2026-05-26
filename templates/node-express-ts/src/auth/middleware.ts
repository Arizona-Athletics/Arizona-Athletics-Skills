/**
 * Auth middleware — attach the user, require the user, require a group.
 *
 * `attachUser()` runs on every request and just copies `req.session.user`
 * onto `req.user` + `res.locals.user` so views and downstream handlers can
 * read it without touching the session directly.
 *
 * `requireAuth()` gates a route — unauthenticated requests are redirected to
 * /auth/login with a `returnTo` set so the user lands back on the page they
 * tried to visit.
 *
 * `requireGroup(name)` gates a route on Cognito group membership. The group
 * NAME is passed in by the consuming app — never hardcoded here.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import type { CognitoUser } from "./cognito.js";
import { hasGroup } from "./cognito.js";

// Add `req.user` to Express's Request type.
declare module "express-serve-static-core" {
  interface Request {
    user?: CognitoUser;
  }
}

export function attachUser(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.user) {
      req.user = req.session.user;
      res.locals.user = req.session.user;
      res.locals.isAuthenticated = true;
    } else {
      res.locals.isAuthenticated = false;
    }
    next();
  };
}

export function requireAuth(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      next();
      return;
    }
    if (req.session) {
      req.session.returnTo = req.originalUrl;
    }
    res.redirect("/auth/login");
  };
}

export function requireGroup(group: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      if (req.session) {
        req.session.returnTo = req.originalUrl;
      }
      res.redirect("/auth/login");
      return;
    }
    if (!hasGroup(req.user, group)) {
      res.status(403).render("pages/500", {
        title: "Not authorized",
        message: "Your account is signed in, but you don't have access to this section.",
        status: 403,
      });
      return;
    }
    next();
  };
}

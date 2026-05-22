/**
 * Express session configuration.
 *
 * The session cookie is the only piece of auth state the browser sees. Tokens
 * (access / refresh / ID) live server-side, indexed by the session ID.
 *
 * Production deployments should swap the default in-memory store for a
 * persistent store (Redis, Postgres, DynamoDB) — see the comment in
 * `sessionMiddleware()` below.
 */

import session, { type SessionOptions } from "express-session";

import { env, isProd } from "../env.js";
import type { CognitoUser } from "./cognito.js";

/**
 * Augment express-session's `SessionData` so `req.session.user`,
 * `req.session.oauthState`, and `req.session.returnTo` are typed.
 */
declare module "express-session" {
  interface SessionData {
    user?: CognitoUser;
    oauthState?: string;
    returnTo?: string;
  }
}

export function sessionMiddleware() {
  const opts: SessionOptions = {
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      // Secure cookies require HTTPS. `false` in local dev only.
      secure: isProd && env.SESSION_COOKIE_SECURE,
      sameSite: "lax",
      // 8 hours — matches typical UA SSO session length. Adjust to your
      // project's policy.
      maxAge: 8 * 60 * 60 * 1000,
    },
    // CONFIGURE_ME: in production, replace the default MemoryStore with a
    // persistent store. Examples:
    //   - Redis:  connect-redis    (bun add connect-redis ioredis)
    //   - Postgres: connect-pg-simple (bun add connect-pg-simple pg)
    //   - DynamoDB: connect-dynamodb
    // store: new RedisStore({ client: redis }),
  };
  return session(opts);
}

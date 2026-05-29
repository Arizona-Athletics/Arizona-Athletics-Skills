/**
 * UA Athletics — Node + Express 5 + EJS server.
 *
 * Entry point. Wires up the HTTP server, view engine, security middleware,
 * static assets, and routes. Modeled on bear-down-lms but pruned to the
 * starter surface (no DB, no LMS-specific routes).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

import express, { type Application, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env, isProd } from "./env.js";
import { sessionMiddleware } from "./auth/session.js";
import { attachUser } from "./auth/middleware.js";
import { securityMiddleware } from "./middleware/security.js";
import { themeMiddleware } from "./middleware/theme.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import healthRoutes from "./routes/healthz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uaTokensDist = path.dirname(fileURLToPath(import.meta.resolve("@ua/ua-tokens/tokens.css")));

function buildApp(): Application {
  const app = express();

  // Trust the first proxy hop in production (ALB, Cloudflare, etc.) so
  // Secure cookies and req.ip work correctly.
  if (isProd) {
    app.set("trust proxy", 1);
  }

  // View engine
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("view cache", isProd);

  // Locals exposed to every render
  app.locals.appName = "Arizona Athletics";
  app.locals.appTagline = "Bear Down. Build Up.";
  app.locals.year = new Date().getFullYear();
  app.locals.typekitKitId = env.TYPEKIT_KIT_ID;
  app.locals.isProd = isProd;

  // Security headers + CSP. Must come BEFORE static so even static responses
  // carry the headers.
  app.use(securityMiddleware());

  // Standard middleware
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));

  // Sessions (must come before any route that reads/writes the session)
  app.use(sessionMiddleware());

  // Read theme cookie and expose to views
  app.use(themeMiddleware());

  // Attach req.user (no-op if unauthenticated). Cheap on every request so
  // views can render the auth chrome without per-route checks.
  app.use(attachUser());

  // Static assets — served under /static so they don't collide with routes.
  // app.css and any future images live in /public/.
  const staticOpts = {
    maxAge: isProd ? "30d" : 0,
    etag: true,
    immutable: isProd,
  } as const;

  app.use("/static", express.static(path.join(__dirname, "..", "public"), staticOpts));

  // Mount @ua/ua-tokens emitted dist files directly. EJS / Express has no
  // bundler — the browser fetches tokens.css over HTTP, not via an import
  // resolver, so we expose the package's dist folder verbatim.
  app.use(
    "/static/ua-tokens",
    express.static(uaTokensDist, staticOpts),
  );

  // Routes
  app.use("/healthz", healthRoutes);
  app.use("/auth", authRoutes);
  app.use("/", indexRoutes);

  // 404 + error handlers must come last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function startServer(): void {
  const app = buildApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] UA Athletics listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown — Node 22 + Express 5 handle async errors better, but
  // we still need to drain in-flight requests on SIGTERM (containers).
  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[server] received ${signal}, shutting down...`);
    server.close((err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error("[server] error during shutdown", err);
        process.exit(1);
      }
      process.exit(0);
    });
    // Force-exit if drain takes > 10s.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    // eslint-disable-next-line no-console
    console.error("[server] unhandledRejection", reason);
  });
}

// Express 5 surfaces async errors automatically — we keep this fallback for
// synchronous boot-time issues only.
function bootGuard(fn: () => void) {
  try {
    fn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] boot failed", err);
    process.exit(1);
  }
}

bootGuard(startServer);

// Re-export for tests
export { buildApp };
// `Request`, `Response`, `NextFunction` are re-exported so consuming routes
// can import from a single module if desired.
export type { Request, Response, NextFunction };

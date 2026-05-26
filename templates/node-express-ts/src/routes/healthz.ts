/**
 * /healthz — lightweight JSON probe. Used by container orchestrators,
 * load balancers, uptime checks.
 *
 * Keep this fast and free of dependencies — no DB calls, no upstream HTTP.
 * If a downstream check is needed, expose a separate /readyz that gates on it.
 */

import { Router, type Request, type Response } from "express";

const startedAt = new Date();

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "@ua/template-node-express-ts",
    startedAt: startedAt.toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    node: process.version,
  });
});

export default router;

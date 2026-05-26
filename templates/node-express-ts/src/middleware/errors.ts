/**
 * 404 + 500 handlers. Both render branded EJS pages so even the failure modes
 * carry UA chrome.
 */

import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";

import { isProd } from "../env.js";

export const notFoundHandler: RequestHandler = (req: Request, res: Response) => {
  res.status(404).render("pages/404", {
    title: "Page not found",
    path: req.originalUrl,
  });
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // eslint-disable-next-line no-console
  console.error("[error]", err);

  const status =
    typeof err === "object" && err && "status" in err && typeof (err as { status: unknown }).status === "number"
      ? ((err as { status: number }).status)
      : 500;

  const message =
    !isProd && err instanceof Error
      ? err.message
      : "Something didn't connect. Try again, or head back to the homepage.";

  res.status(status).render("pages/500", {
    title: "Something went sideways",
    message,
    status,
  });
};

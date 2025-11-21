import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { httpRequestDuration } from "../utils/metrics";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on("finish", () => {
    const [s, ns] = process.hrtime(start);
    const durationSeconds = s + ns / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(durationSeconds);

    logger.info({
      msg: "HTTP request",
      method: req.method,
      path: req.path,
      route,
      status: res.statusCode,
      duration_seconds: durationSeconds
    });
  });

  next();
}

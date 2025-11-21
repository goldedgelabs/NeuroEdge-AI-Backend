import express from "express";
import cors from "cors";
import CodeEngine from "./core/engine";
import logger from "./utils/logger";
import { initTelemetry } from "./utils/telemetry";
import metricsClient, { jobQueueLength } from "./utils/metrics";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";

import executeRoute from "./routes/execute.route";
import refactorRoute from "./routes/refactor.route";
import embedRoute from "./routes/embed.route";
import searchRoute from "./routes/search.route";
import jobsRoute from "./routes/jobs.route";

const app = express();

// Core middlewares
app.use(cors());
app.use(express.json());

// Observability middleware
app.use(requestLogger);

// Main routes
app.use("/execute", executeRoute);
app.use("/refactor", refactorRoute);
app.use("/embed", embedRoute);
app.use("/search", searchRoute);
app.use("/jobs", jobsRoute);

// Healthcheck
app.get("/health", (req, res) =>
  res.json({ status: "ok", engine: "CodeEngine" })
);

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsClient.register.contentType);
  res.end(await metricsClient.register.metrics());
});

// Error handler (must be last)
app.use(errorHandler);

async function bootstrap() {
  try {
    // Initialize telemetry (non-blocking)
    await initTelemetry();

    // Start engine core services (DB, workers, events)
    await CodeEngine.start();

    const port = process.env.PORT || 7002;

    app.listen(port, () => {
      logger.info(`🔥 Code Engine running on port ${port}`);
    });

    // Periodically update job queue size metric
    const { getRedis } = await import("./db/redis");
    const redis = getRedis();

    setInterval(async () => {
      try {
        const len = await redis.lLen("code_jobs");
        jobQueueLength.set(len);
      } catch (err) {
        logger.warn("Failed to update job queue length:", err);
      }
    }, 5000);

  } catch (err) {
    logger.error("Bootstrap failed:", err);
    process.exit(1);
  }
}

bootstrap();

export default app;

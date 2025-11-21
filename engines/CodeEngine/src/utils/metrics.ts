import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;

// collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({
  timeout: 10000
});

// custom metrics
export const httpRequestDuration = new client.Histogram({
  name: "code_engine_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

export const jobQueueLength = new client.Gauge({
  name: "code_engine_job_queue_length",
  help: "Length of job queue in Redis"
});

export const sandboxExecutionCount = new client.Counter({
  name: "code_engine_sandbox_executions_total",
  help: "Total number of sandbox executions"
});

export default client;

import pino from "pino";

const level = process.env.LOG_LEVEL || "info";

const logger = pino({
  level,
  prettyPrint: process.env.NODE_ENV !== "production" ? { colorize: true } : false,
  base: {
    service: "code-engine",
    pid: false
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;

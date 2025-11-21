import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import logger from "./logger";

let sdk: NodeSDK | null = null;

export async function initTelemetry() {
  try {
    const otlpUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || process.env.OTLP_URL;

    const traceExporter = new OTLPTraceExporter({
      url: otlpUrl
    });

    sdk = new NodeSDK({
      traceExporter,
      instrumentations: [getNodeAutoInstrumentations()]
    });

    await sdk.start();
    logger.info("🔍 OpenTelemetry initialized.");
  } catch (err) {
    logger.error("Failed to initialize OpenTelemetry:", err);
  }
}

export async function shutdownTelemetry() {
  if (sdk) {
    await sdk.shutdown();
  }
}

// src/agents/MonitoringAgent.ts
import { engineManager } from "../core/engineManager";
import { logger } from "../utils/logger";

export class MonitoringAgent {
  name = "MonitoringAgent";

  constructor() {
    logger.log(`${this.name} initialized`);
  }

  /**
   * Collect system metrics from MonitoringEngine
   * @param options Optional filtering or monitoring parameters
   */
  async collectMetrics(options?: any) {
    const monitoringEngine = engineManager["MonitoringEngine"];
    if (!monitoringEngine) {
      logger.warn(`[${this.name}] MonitoringEngine not found`);
      return { error: "MonitoringEngine not found" };
    }

    try {
      const metrics = await monitoringEngine.run({ action: "collect", options });
      logger.info(`[${this.name}] Metrics collected`);
      return metrics;
    } catch (err) {
      logger.error(`[${this.name}] Metrics collection failed:`, err);
      return { error: "Metrics collection failed", details: err };
    }
  }

  /**
   * Alert based on thresholds or anomalies
   * @param alertData Data to trigger alerts
   */
  async alert(alertData: any) {
    const monitoringEngine = engineManager["MonitoringEngine"];
    if (!monitoringEngine) {
      logger.warn(`[${this.name}] MonitoringEngine not found`);
      return { error: "MonitoringEngine not found" };
    }

    try {
      const response = await monitoringEngine.run({ action: "alert", alertData });
      logger.info(`[${this.name}] Alert executed`);
      return response;
    } catch (err) {
      logger.error(`[${this.name}] Alert execution failed:`, err);
      return { error: "Alert execution failed", details: err };
    }
  }
}

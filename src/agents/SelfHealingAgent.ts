// src/agents/SelfHealingAgent.ts
import { engineManager } from "../core/engineManager";
import { logger } from "../utils/logger";

export class SelfHealingAgent {
  name = "SelfHealingAgent";

  constructor() {
    logger.log(`${this.name} initialized`);
  }

  // Trigger self-healing for a specific engine
  async healEngine(engineName: string, error?: any) {
    const engine = engineManager[engineName];
    if (!engine) {
      logger.warn(`[${this.name}] Engine not found: ${engineName}`);
      return { error: "Engine not found" };
    }

    logger.info(`[${this.name}] Healing engine: ${engineName}`);
    try {
      if (typeof engine.recover === "function") {
        await engine.recover(error);
        logger.info(`[${this.name}] Engine ${engineName} healed successfully`);
        return { success: true };
      } else {
        logger.warn(`[${this.name}] Engine ${engineName} has no recover method`);
        return { success: false, message: "No recover method" };
      }
    } catch (err) {
      logger.error(`[${this.name}] Failed to heal engine ${engineName}:`, err);
      return { success: false, error: err };
    }
  }

  // Monitor engines and trigger healing automatically
  async monitorAndHeal(engineName: string, data?: any) {
    const engine = engineManager[engineName];
    if (!engine) return { error: "Engine not found" };

    try {
      await engine.run(data || {});
      return { status: "healthy" };
    } catch (err) {
      logger.warn(`[${this.name}] Detected failure in engine ${engineName}, initiating healing...`);
      return await this.healEngine(engineName, err);
    }
  }
}

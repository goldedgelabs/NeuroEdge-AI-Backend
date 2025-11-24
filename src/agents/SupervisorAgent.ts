// src/agents/SupervisorAgent.ts
import { engineManager } from "../core/engineManager";
import { logger } from "../utils/logger";

export class SupervisorAgent {
  name = "SupervisorAgent";

  constructor() {
    logger.log(`${this.name} initialized`);
  }

  async monitor(engineName: string, data?: any) {
    if (!engineManager[engineName]) {
      logger.warn(`[${this.name}] Engine not found: ${engineName}`);
      return { error: "Engine not found" };
    }

    logger.info(`[${this.name}] Monitoring engine: ${engineName}`);
    try {
      const result = await engineManager[engineName].run(data || {});
      return { success: true, data: result };
    } catch (err) {
      logger.error(`[${this.name}] Error monitoring ${engineName}:`, err);
      return { success: false, error: err };
    }
  }

  async recover(engineName: string, error: any) {
    logger.warn(`[${this.name}] Attempting recovery for ${engineName}`);
    if (engineManager[engineName] && typeof engineManager[engineName].recover === "function") {
      await engineManager[engineName].recover(error);
    }
    return { recovered: true };
  }
}

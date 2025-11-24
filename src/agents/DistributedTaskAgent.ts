// src/agents/DistributedTaskAgent.ts
import { logger } from "../utils/logger";
import { engineManager } from "../core/engineManager";

export class DistributedTaskAgent {
  name = "DistributedTaskAgent";

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Run a task distributed across multiple engines or nodes
  async runDistributedTask(taskName: string, payload: any, engines: string[]) {
    try {
      logger.log(`[DistributedTaskAgent] Running task '${taskName}' on engines: ${engines.join(", ")}`);
      const results: Record<string, any> = {};

      for (const engineName of engines) {
        const engine = engineManager[engineName];
        if (!engine) {
          logger.warn(`[DistributedTaskAgent] Engine not found: ${engineName}`);
          results[engineName] = { error: "Engine not found" };
          continue;
        }

        if (typeof engine.run === "function") {
          results[engineName] = await engine.run(payload);
        } else {
          results[engineName] = { error: "Engine cannot run task" };
        }
      }

      return results;
    } catch (err) {
      logger.error(`[DistributedTaskAgent] Failed to run distributed task:`, err);
      await this.recover(err);
      return { error: err };
    }
  }

  async recover(err: any) {
    logger.warn(`[DistributedTaskAgent] Recovering from error:`, err);
    return { recovered: true };
  }
    }

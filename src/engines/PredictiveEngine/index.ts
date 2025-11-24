import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";
import { survivalCheck } from "./survival_check";

export class PredictiveEngine extends EngineBase {
  name = "PredictiveEngine";

  constructor() {
    super();

    try {
      const status = (typeof survivalCheck === "function") ? survivalCheck() : { online: true };

      // If survivalCheck returns a promise
      if (status && typeof status.then === "function") {
        status
          .then((s: any) => {
            if (!s?.online) logger.warn(`[${this.name}] Offline mode activated`);
          })
          .catch((e: any) => {
            logger.warn(`[${this.name}] survivalCheck error`, e);
          });
      } else {
        if (!status?.online) logger.warn(`[${this.name}] Offline mode activated`);
      }
    } catch (err) {
      logger.warn(`[${this.name}] survival check failed`, err);
    }

    logger.log(`[${this.name}] Initialized`);
  }

  // talkTo uses a global engineManager set by core/engineManager
  async talkTo(engineName: string, method: string, payload: any) {
    const mgr = (globalThis as any).__NE_ENGINE_MANAGER;
    if (!mgr) throw new Error("engineManager not initialized");

    const engine = mgr[engineName];
    if (!engine) throw new Error(`Engine ${engineName} not found`);
    if (typeof engine[method] !== "function")
      throw new Error(`Method ${method} not found in ${engineName}`);

    return await engine[method](payload);
  }

  async run(input: any) {
    logger.info(`[${this.name}] run called`);
    // Example: just echo input, could integrate predictive logic here
    return { engine: this.name, input };
  }
}

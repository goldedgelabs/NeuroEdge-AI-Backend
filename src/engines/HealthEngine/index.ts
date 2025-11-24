import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class HealthEngine extends EngineBase {
  constructor() {
    super();
    this.name = "HealthEngine";
    this.survivalCheck();
  }

  // Ensure dependencies and environment are healthy
  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Example: check DB connectivity, medicine data sources
    return true;
  }

  // Main run method
  async run(input: any) {
    logger.info(`[${this.name}] Running with input:`, input);

    // Example: manage medicine data
    const medicineRecord = {
      id: input?.id || Date.now(),
      name: input?.name || "Unknown Medicine",
      dosage: input?.dosage || "Unknown",
      manufacturer: input?.manufacturer || "Unknown",
      timestamp: new Date().toISOString(),
    };

    // Write to DB and trigger agents
    if ((globalThis as any).__NE_DB_MANAGER) {
      const db = (globalThis as any).__NE_DB_MANAGER;
      await db.set("medicine", medicineRecord.id, medicineRecord, "edge");

      // Publish event to notify subscribed agents
      if ((globalThis as any).__NE_ENGINE_MANAGER?.eventBus) {
        (globalThis as any).__NE_ENGINE_MANAGER.eventBus.publish("db:update", {
          collection: "medicine",
          key: medicineRecord.id,
          value: medicineRecord,
        });
      }
    }

    return { status: "success", medicine: medicineRecord };
  }

  // Self-healing if errors occur
  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "Fallback health routine executed" };
  }

  // Talk to another engine
  async talkTo(engineName: string, method: string, payload: any) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine[method] === "function") {
      return engine[method](payload);
    }
    return null;
  }
}

// Optional: register immediately in engineManager
// registerEngine("HealthEngine", new HealthEngine());

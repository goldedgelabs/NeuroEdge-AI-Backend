import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class MedicineManagementEngine extends EngineBase {
  constructor() {
    super();
    this.name = "MedicineManagementEngine";
    this.survivalCheck();
  }

  // Check engine environment
  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Example: verify medicine DB connection, API availability
    return true;
  }

  // Main engine logic
  async run(input: any) {
    logger.info(`[${this.name}] Running with input:`, input);

    const medicineData = {
      id: input?.id || Date.now(),
      name: input?.name || "Unknown Medicine",
      dosage: input?.dosage || "",
      manufacturer: input?.manufacturer || "",
      subscription: input?.subscription || false,
      timestamp: new Date().toISOString(),
    };

    // Write to edge DB
    if ((globalThis as any).__NE_DB_MANAGER) {
      const db = (globalThis as any).__NE_DB_MANAGER;
      await db.set("medicine", medicineData.id, medicineData, "edge");

      // Notify agents via eventBus
      if ((globalThis as any).__NE_ENGINE_MANAGER?.eventBus) {
        (globalThis as any).__NE_ENGINE_MANAGER.eventBus.publish("db:update", {
          collection: "medicine",
          key: medicineData.id,
          value: medicineData,
        });
      }
    }

    return { status: "success", medicineData };
  }

  // Self-healing
  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "Fallback medicine routine executed" };
  }

  // Communicate with other engines
  async talkTo(engineName: string, method: string, payload: any) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine[method] === "function") {
      return engine[method](payload);
    }
    return null;
  }
}

// Optional: register immediately
// registerEngine("MedicineManagementEngine", new MedicineManagementEngine());

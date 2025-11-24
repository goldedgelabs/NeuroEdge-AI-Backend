import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";
import { db } from "../../db/dbManager";

export class HealthEngine extends EngineBase {
  constructor() {
    super();
    this.survivalCheck();
  }

  // Simple alive check
  async survivalCheck() {
    logger.log("[HealthEngine] Alive and monitoring systems...");
  }

  // Main run method
  async run(input: any) {
    try {
      logger.log("[HealthEngine] Processing input:", input);

      // Save medicine info to edge DB
      const medicine = {
        id: input.id,
        name: input.name,
        dosage: input.dosage,
        manufacturer: input.manufacturer,
      };

      await db.set("medicine", medicine.id, medicine, "edge");
      logger.log("[HealthEngine] Medicine saved:", medicine);

      // Trigger MedicineManagementAgent if available
      const agentManager = (globalThis as any).__NE_AGENT_MANAGER;
      if (agentManager?.MedicineManagementAgent) {
        const agent = agentManager.MedicineManagementAgent;
        if (typeof agent.process === "function") {
          await agent.process(input);
          logger.log("[HealthEngine] MedicineManagementAgent processed input");
        }
      }

      return { status: "HealthEngine completed task", medicine };
    } catch (err: any) {
      await this.recover(err);
      return { status: "HealthEngine recovered from error", error: err.message };
    }
  }

  // Error recovery
  async recover(err: any) {
    logger.error("[HealthEngine] Recovered from error:", err);
  }
}

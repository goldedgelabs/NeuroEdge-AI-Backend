import { db } from "../db/dbManager";
import { logger } from "../utils/logger";

export class MedicineManagementAgent {
  name = "MedicineManagementAgent";

  constructor() {
    logger.log(`[Agent Initialized] ${this.name}`);
  }

  // React to DB updates for medicines
  async handleDBUpdate(event: any) {
    if (event.collection === "medicine") {
      logger.info(`[MedicineAgent] Medicine updated: ${event.key}`, event.value);
      // Implement logic: sync, notify, validate, etc.
    }
  }

  async handleDBDelete(event: any) {
    if (event.collection === "medicine") {
      logger.warn(`[MedicineAgent] Medicine deleted: ${event.key}`);
    }
  }

  async addMedicine(medicine: any) {
    await db.set("medicine", medicine.id, medicine, "edge");
    return medicine;
  }

  async removeMedicine(medicineId: string) {
    await db.delete("medicine", medicineId, "edge");
    return medicineId;
  }

  async recover(err: any) {
    logger.error(`[MedicineAgent] Recovered from error:`, err);
  }
    }

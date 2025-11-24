// src/agents/BillingAgent.ts
import { logger } from "../utils/logger";

interface BillingRecord {
  userId: string;
  amount: number;
  timestamp: number;
  description?: string;
}

export class BillingAgent {
  name = "BillingAgent";
  private records: BillingRecord[] = [];

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Add a billing record
  addRecord(userId: string, amount: number, description?: string) {
    const record: BillingRecord = {
      userId,
      amount,
      timestamp: Date.now(),
      description,
    };
    this.records.push(record);
    logger.log(`[${this.name}] Record added for user: ${userId}`, record);
    return { success: true, record };
  }

  // Get all billing records for a user
  getUserRecords(userId: string) {
    const userRecords = this.records.filter(r => r.userId === userId);
    logger.info(`[${this.name}] Retrieved records for user: ${userId}`);
    return userRecords;
  }

  // Total billing for a user
  getUserTotal(userId: string) {
    const total = this.records
      .filter(r => r.userId === userId)
      .reduce((sum, r) => sum + r.amount, 0);
    logger.info(`[${this.name}] Total billing for user ${userId}: ${total}`);
    return total;
  }

  async recover(err: any) {
    logger.error(`[${this.name}] Recovering from error:`, err);
  }
}

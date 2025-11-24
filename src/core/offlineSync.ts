import { logger } from "../utils/logger";
import { DB } from "./db"; // Your database module
import { engineManager } from "./engineManager";

// Each engine can call this helper to store offline data
export class OfflineSync {
  private engineId: string;
  private syncQueue: any[];

  constructor(engineId: string) {
    this.engineId = engineId;
    this.syncQueue = [];
  }

  // Add data to local queue
  public queue(data: any) {
    this.syncQueue.push({
      time: Date.now(),
      data,
    });
    logger.info(`[OfflineSync] Queued data for ${this.engineId}`);
  }

  // Flush queue to DB
  public async flush() {
    if (this.syncQueue.length === 0) return;

    try {
      await DB.sync(this.engineId, this.syncQueue); // implement DB.sync
      logger.info(`[OfflineSync] Flushed ${this.syncQueue.length} items for ${this.engineId}`);
      this.syncQueue = [];
    } catch (err) {
      logger.warn(`[OfflineSync] Failed to flush for ${this.engineId}`, err);
    }
  }

  // Auto flush (call this in engine tick/heartbeat)
  public async tick() {
    await this.flush();
  }
}

// Example usage inside an engine
/*
const offline = new OfflineSync("SelfImprovementEngine");
offline.queue({ metric: "progress", value: 42 });
await offline.tick(); // will flush if possible
*/

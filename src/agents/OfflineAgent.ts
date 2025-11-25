import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

export class OfflineAgent extends AgentBase {
  private offlineQueue: any[] = [];

  constructor() {
    super("OfflineAgent");
  }

  async run(input?: any) {
    if (!input) return;

    if (input.action === "queue") {
      this.offlineQueue.push(input.data);
      console.log(`[OfflineAgent] Queued data for offline sync:`, input.data);
    } else if (input.action === "sync") {
      await this.sync();
    }

    return this.offlineQueue;
  }

  async recover(err: any) {
    console.error(`[OfflineAgent] Recovering from error:`, err);
  }

  private async sync() {
    console.log(`[OfflineAgent] Syncing ${this.offlineQueue.length} items...`);
    // Example: simulate replication to shared DB
    for (const item of this.offlineQueue) {
      eventBus.publish("db:update", item);
    }
    this.offlineQueue = [];
    console.log(`[OfflineAgent] Sync complete.`);
  }
}

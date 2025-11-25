// src/db/dbManager.ts
import { eventBus } from "../core/eventBus";
import { logger } from "../utils/logger";

type StorageLayer = "edge" | "shared";

interface RecordItem {
  id: string;
  collection: string;
  [key: string]: any;
}

class DBManager {
  private store: Record<StorageLayer, Record<string, Record<string, any>>> = {
    edge: {},
    shared: {},
  };

  async set(collection: string, key: string, value: any, layer: StorageLayer = "edge") {
    if (!this.store[layer][collection]) this.store[layer][collection] = {};
    this.store[layer][collection][key] = value;

    // Fire update events
    eventBus.publish("db:update", { collection, key, value, layer });
    logger.log(`[DBManager] Set ${layer}:${collection}:${key}`);
    return value;
  }

  async get(collection: string, key: string, layer: StorageLayer = "edge") {
    return this.store[layer][collection]?.[key] ?? null;
  }

  async delete(collection: string, key: string, layer: StorageLayer = "edge") {
    if (this.store[layer][collection]?.[key]) {
      delete this.store[layer][collection][key];
      eventBus.publish("db:delete", { collection, key, layer });
      logger.log(`[DBManager] Deleted ${layer}:${collection}:${key}`);
    }
  }

  async getAll(collection: string, layer: StorageLayer = "edge") {
    return Object.values(this.store[layer][collection] ?? {});
  }
}

export const db = new DBManager();

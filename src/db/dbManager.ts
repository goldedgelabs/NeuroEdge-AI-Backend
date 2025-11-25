// src/db/dbManager.ts
import { logger } from "../utils/logger";

type StoreType = "edge" | "shared";

interface RecordData {
  id: string;
  [key: string]: any;
}

export class DBManager {
  private db: Record<StoreType, Record<string, RecordData>> = {
    edge: {},
    shared: {},
  };

  async set(collection: string, key: string, value: any, store: StoreType = "edge") {
    if (!this.db[store][collection]) this.db[store][collection] = {};
    this.db[store][collection][key] = value;
    logger.log(`[DBManager] Set ${store}:${collection}:${key}`);
    return value;
  }

  async get(collection: string, key: string, store: StoreType = "edge") {
    return this.db[store][collection]?.[key] ?? null;
  }

  async getAll(collection: string, store: StoreType = "edge") {
    return Object.values(this.db[store][collection] ?? {});
  }

  async delete(collection: string, key: string, store: StoreType = "edge") {
    if (this.db[store][collection]?.[key]) {
      delete this.db[store][collection][key];
      logger.log(`[DBManager] Deleted ${store}:${collection}:${key}`);
    }
  }
}

export const db = new DBManager();

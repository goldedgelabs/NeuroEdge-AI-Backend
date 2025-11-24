// src/agents/LocalStorageAgent.ts
import { logger } from "../utils/logger";

export class LocalStorageAgent {
  name = "LocalStorageAgent";
  private storage: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Set a key-value pair
  setItem(key: string, value: any) {
    this.storage[key] = value;
    logger.log(`[LocalStorageAgent] Stored key '${key}'.`);
    return { success: true };
  }

  // Get a value by key
  getItem(key: string) {
    if (this.storage[key] === undefined) {
      logger.warn(`[LocalStorageAgent] Key '${key}' not found.`);
      return null;
    }
    return this.storage[key];
  }

  // Remove a key
  removeItem(key: string) {
    if (this.storage[key]) {
      delete this.storage[key];
      logger.log(`[LocalStorageAgent] Removed key '${key}'.`);
      return { success: true };
    }
    return { success: false, message: "Key not found" };
  }

  // Clear all storage
  clear() {
    this.storage = {};
    logger.log(`[LocalStorageAgent] Cleared all storage.`);
    return { success: true };
  }

  // List all keys
  listKeys() {
    return Object.keys(this.storage);
  }
}

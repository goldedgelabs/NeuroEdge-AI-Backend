// src/db/dbManager.ts
/**
 * NeuroEdge DB Manager
 * -------------------
 * Supports edge, shared, and global layers.
 * Offline-first, event-driven, replication ready.
 */

import { eventBus } from "../core/eventBus";
import { logger } from "../utils/logger";

// Simple in-memory DB for demonstration (can be replaced with IndexedDB / SQLite / Redis / etc.)
const storage: Record<string, Record<string, any>> = {
  edge: {},
  shared: {},
  global: {},
};

export const db = {
  // Get single record
  async get(collection: string, key: string, layer: "edge" | "shared" | "global" = "edge") {
    return storage[layer]?.[collection]?.[key] ?? null;
  },

  // Set single record
  async set(collection: string, key: string, value: any, layer: "edge" | "shared" | "global" = "edge") {
    if (!storage[layer][collection]) storage[layer][collection] = {};
    storage[layer][collection][key] = value;

    // Emit update event
    eventBus.publish("db:update", { collection, key, value, layer });

    logger.log(`[DB] Set ${layer}.${collection}:${key}`);
    return value;
  },

  // Delete record
  async delete(collection: string, key: string, layer: "edge" | "shared" | "global" = "edge") {
    if (storage[layer][collection]?.[key]) {
      delete storage[layer][collection][key];
      eventBus.publish("db:delete", { collection, key, layer });
      logger.log(`[DB] Deleted ${layer}.${collection}:${key}`);
      return true;
    }
    return false;
  },

  // Get all records in a collection
  async getAll(collection: string, layer: "edge" | "shared" | "global" = "edge") {
    return Object.values(storage[layer]?.[collection] ?? {});
  },
};

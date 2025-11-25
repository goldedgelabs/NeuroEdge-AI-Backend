// src/core/dbReplication.ts

import { db } from "../db/dbManager";
import { eventBus } from "./engineManager";
import { logger } from "../utils/logger";

/**
 * Replicate all records from edge DB to shared DB for a given collection.
 * Can be run periodically or triggered by events.
 */
export async function replicateEdgeToShared(collection: string) {
  try {
    const edgeRecords = await db.getAll(collection, "edge");
    for (const record of edgeRecords) {
      await db.set(collection, record.id, record, "shared");
      logger.log(`[DBReplication] Replicated ${collection}:${record.id} to shared DB`);
    }
  } catch (err) {
    logger.error(`[DBReplication] Failed to replicate collection ${collection}:`, err);
  }
}

/**
 * Auto-replication via eventBus
 * Listens to any db:update events and triggers replication for that collection.
 */
export function setupAutoReplication() {
  eventBus.subscribe("db:update", async ({ collection }) => {
    if (!collection) return;
    await replicateEdgeToShared(collection);
  });

  logger.log("[DBReplication] Auto-replication for DB updates is enabled.");
}

// Automatically setup replication when this module is imported
setupAutoReplication();

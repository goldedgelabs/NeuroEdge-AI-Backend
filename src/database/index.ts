// src/database/index.ts

import { DatabaseManager } from "./DatabaseManager";
import { logger } from "../utils/logger";

// Create global entry point for the entire DB system
export const DB = new DatabaseManager();

// Expose globally so engines & agents use without circular imports
(globalThis as any).__NEUROEDGE_DB = DB;

logger.info("[Database] Hybrid DB Initialized (Local + Distributed + CRDT Sync)");

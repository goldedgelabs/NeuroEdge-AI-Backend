/**
 * NeuroEdge Bootstrap
 * ------------------
 * Initializes all engines and agents
 * Auto-wires via InspectionAgent
 * Starts DB replication, event bus, and self-healing
 */

import path from "path";
import { engineManager, registerEngine, eventBus } from "./engineManager";
import { agentManager, registerAgent } from "./agentManager";
import { db } from "../db/dbManager";
import { InspectionAgent } from "../agents/InspectionAgent";
import { logger } from "../utils/logger";

// -----------------------------
// Step 1: Initialize InspectionAgent
// -----------------------------
const inspector = new InspectionAgent();
logger.log("[Bootstrap] Initializing InspectionAgent...");

// Run full inspection: auto-register engines & agents
inspector.runInspection();

// -----------------------------
// Step 2: Optional manual registration (if needed)
// -----------------------------
/*
import { HealthEngine } from "../engines/HealthEngine";
registerEngine("HealthEngine", new HealthEngine());
*/

// -----------------------------
// Step 3: DB Replication Setup (edge → shared)
// -----------------------------
async function replicateAllCollections() {
  const collections = await db.listCollections("edge");
  for (const col of collections) {
    await inspector.replicateEdgeToShared(col);
  }
}

// Periodic replication (every 10 seconds)
setInterval(async () => {
  try {
    await replicateAllCollections();
    logger.log("[Bootstrap] Edge → Shared replication complete.");
  } catch (err) {
    logger.error("[Bootstrap] Replication error:", err);
  }
}, 10000);

// -----------------------------
// Step 4: Event Bus & self-healing test
// -----------------------------
eventBus.subscribe("system:heartbeat", () => {
  logger.log("[Bootstrap] Heartbeat received from system");
});

// Example heartbeat publish (every 5 seconds)
setInterval(() => {
  eventBus.publish("system:heartbeat", { ts: Date.now() });
}, 5000);

// -----------------------------
// Step 5: Startup complete
// -----------------------------
logger.log("[Bootstrap] NeuroEdge backend initialized.");
logger.log(`[Bootstrap] Engines loaded: ${Object.keys(engineManager).length}`);
logger.log(`[Bootstrap] Agents loaded: ${Object.keys(agentManager).length}`);

// -----------------------------
// Step 6: Expose for external usage
// -----------------------------
export { engineManager, agentManager, eventBus, db, inspector };

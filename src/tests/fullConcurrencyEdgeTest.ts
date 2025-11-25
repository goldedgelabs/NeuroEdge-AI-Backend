import { engineManager } from "../core/engineManager";
import { agentManager } from "../core/agentManager";
import { db } from "../db/dbManager";
import { replicateEdgeToShared } from "../db/replication";
import { eventBus } from "../core/eventBus";
import { logger } from "../utils/logger";

async function runEngineParallel(engineName: string, input: any) {
  try {
    const engine = engineManager[engineName];
    if (engine && typeof engine.run === "function") {
      const result = await engine.run(input);
      logger.log(`[ParallelTest] Engine ${engineName} result:`, result);
      return result;
    }
  } catch (err) {
    logger.error(`[ParallelTest] Engine ${engineName} failed:`, err);
    const engine = engineManager[engineName];
    if (engine?.recover) await engine.recover(err);
  }
}

async function triggerAgentUpdate(event: any) {
  for (const agentName of Object.keys(agentManager)) {
    const agent = agentManager[agentName];
    if (typeof agent.handleDBUpdate === "function") {
      try {
        await agent.handleDBUpdate(event);
      } catch (err) {
        logger.error(`[ParallelTest] Agent ${agentName} failed on DB update:`, err);
        if (agent.recover) await agent.recover(err);
      }
    }
  }
}

async function main() {
  logger.log("=== NeuroEdge Full Concurrency & Edge Test ===");

  // -----------------------------
  // Clear DBs
  // -----------------------------
  await db.clearAll("edge");
  await db.clearAll("shared");
  logger.log("[Test] Cleared edge & shared DB");

  // -----------------------------
  // Generate dummy inputs for all engines
  // -----------------------------
  const engineInputs: Record<string, any> = {};
  Object.keys(engineManager).forEach(name => {
    engineInputs[name] = {
      id: `${name}_parallel_001`,
      folder: "concurrency_test",
      role: "admin",
      data: `Dummy input for ${name}`
    };
  });

  // -----------------------------
  // Run all engines in parallel
  // -----------------------------
  logger.log("[Test] Running all engines in parallel...");
  const enginePromises = Object.keys(engineManager).map(name => runEngineParallel(name, engineInputs[name]));
  const engineResults = await Promise.all(enginePromises);

  // -----------------------------
  // Fire DB events in parallel to agents
  // -----------------------------
  logger.log("[Test] Triggering DB updates in parallel to agents...");
  const edgeData = await db.getAllCollections("edge");
  const eventPromises: Promise<any>[] = [];

  for (const collection of Object.keys(edgeData)) {
    for (const record of edgeData[collection]) {
      const event = { collection, key: record.id, value: record, source: "ParallelTest" };
      eventPromises.push(triggerAgentUpdate(event));
    }
  }

  await Promise.all(eventPromises);

  // -----------------------------
  // Replicate edge → shared in parallel
  // -----------------------------
  logger.log("[Test] Replicating edge → shared DB in parallel...");
  const replicationPromises = Object.keys(edgeData).map(col => replicateEdgeToShared(col));
  await Promise.all(replicationPromises);

  // -----------------------------
  // Final verification
  // -----------------------------
  const finalShared = await db.getAllCollections("shared");
  logger.log("[Test] Final Shared DB state:", finalShared);

  logger.log("=== NeuroEdge Concurrency & Edge Test Completed Successfully ===");
}

main().catch(err => {
  console.error("[ParallelTest] Fatal error:", err);
});

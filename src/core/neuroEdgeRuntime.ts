// src/core/neuroEdgeRuntime.ts
/**
 * NeuroEdge Full Runtime Simulation
 * --------------------------------
 * - Runs all 25 engines
 * - Triggers 56 agents automatically
 * - Simulates DB updates (edge → shared replication)
 * - Demonstrates Doctrine enforcement + self-healing
 */

import { engineManager, eventBus, runEngineChain } from "./engineManager";
import { agentManager } from "./agentManager";
import { replicateEdgeToShared } from "../db/dbEdgeReplicator";
import { db } from "../db/dbManager";

// -----------------------------
// Setup: DB subscription simulation
// -----------------------------
eventBus.subscribe("db:update", async (event: any) => {
  const { collection, key, value } = event;
  console.log(`[DB Event] Collection: ${collection}, Key: ${key}`, value);

  // Let all agents respond to DB update
  for (const agentName in agentManager) {
    const agent = agentManager[agentName];
    if (typeof agent.handleDBUpdate === "function") {
      try {
        await agent.handleDBUpdate(event);
      } catch (err) {
        if (typeof agent.recover === "function") await agent.recover(err);
      }
    }
  }
});

// -----------------------------
// Setup: DB delete simulation
// -----------------------------
eventBus.subscribe("db:delete", async (event: any) => {
  const { collection, key } = event;
  console.log(`[DB Delete] Collection: ${collection}, Key: ${key}`);

  for (const agentName in agentManager) {
    const agent = agentManager[agentName];
    if (typeof agent.handleDBDelete === "function") {
      try {
        await agent.handleDBDelete(event);
      } catch (err) {
        if (typeof agent.recover === "function") await agent.recover(err);
      }
    }
  }
});

// -----------------------------
// Helper: Run all engines sequentially
// -----------------------------
export async function runAllEnginesSequentially(payload: any = {}) {
  const engineNames = Object.keys(engineManager);
  let lastOutput = payload;

  for (const engineName of engineNames) {
    const engine = engineManager[engineName];
    if (!engine) continue;

    if (typeof engine.run === "function") {
      try {
        console.log(`[Engine Start] ${engineName}`);
        lastOutput = await engine.run(lastOutput);
        // Publish result to agents
        eventBus.publish(`engine:${engineName}`, lastOutput);
      } catch (err) {
        console.error(`[Engine Error] ${engineName}`, err);
        if (typeof engine.recover === "function") await engine.recover(err);
      }
    }
  }
}

// -----------------------------
// Helper: Trigger specific engine
// -----------------------------
export async function triggerEngine(engineName: string, payload: any = {}) {
  const engine = engineManager[engineName];
  if (!engine) throw new Error(`Engine not registered: ${engineName}`);

  if (typeof engine.run === "function") {
    const result = await engine.run(payload);
    eventBus.publish(`engine:${engineName}`, result);
    return result;
  } else {
    eventBus.publish(`engine:${engineName}`, payload);
    return payload;
  }
}

// -----------------------------
// Helper: Replicate edge DB to shared DB
// -----------------------------
export async function replicateAllEdges() {
  const collections = await db.listCollections("edge");
  for (const col of collections) {
    await replicateEdgeToShared(col);
  }
  console.log("[Replication] Edge → Shared replication completed.");
}

// -----------------------------
// Example Full Runtime
// -----------------------------
export async function fullSimulation() {
  console.log("===== NeuroEdge Full Runtime Simulation Started =====");

  // 1. Run all engines sequentially
  await runAllEnginesSequentially({ userId: "test-user" });

  // 2. Replicate all edge DBs
  await replicateAllEdges();

  console.log("===== NeuroEdge Full Runtime Simulation Completed =====");
}

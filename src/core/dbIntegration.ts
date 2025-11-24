/**
 * NeuroEdge DB Integration
 * -----------------------
 * Automatically wires all engines and agents to DB events.
 * Handles edge → shared replication, and event triggers.
 */

import { engineManager, eventBus } from "./engineManager";
import { agentManager } from "./agentManager";
import { db } from "../db/dbManager";

// -----------------------------
// Subscribe agents to DB events
// -----------------------------
function subscribeAgents() {
  for (const agentName in agentManager) {
    const agent = agentManager[agentName];
    if (typeof agent.handleDBUpdate === "function") {
      eventBus.subscribe("db:update", agent.handleDBUpdate.bind(agent));
    }
    if (typeof agent.handleDBDelete === "function") {
      eventBus.subscribe("db:delete", agent.handleDBDelete.bind(agent));
    }
  }
}

// -----------------------------
// Subscribe engines to DB events (optional)
// -----------------------------
function subscribeEngines() {
  for (const engineName in engineManager) {
    const engine = engineManager[engineName];
    if (typeof engine.handleDBUpdate === "function") {
      eventBus.subscribe("db:update", engine.handleDBUpdate.bind(engine));
    }
    if (typeof engine.handleDBDelete === "function") {
      eventBus.subscribe("db:delete", engine.handleDBDelete.bind(engine));
    }
  }
}

// -----------------------------
// Replicate edge → shared periodically
// -----------------------------
export async function replicateAllCollections() {
  const collections = Object.keys(db.edge); // all edge collections
  for (const collection of collections) {
    const edgeRecords = await db.getAll(collection, "edge");
    for (const record of edgeRecords) {
      await db.set(collection, record.id, record, "shared");
    }
  }
  console.log("[DB] Edge → Shared replication complete");
}

// -----------------------------
// Initialize wiring
// -----------------------------
export function initDBIntegration() {
  subscribeAgents();
  subscribeEngines();

  console.log("[DB Integration] All agents and engines wired to DB events");
  }

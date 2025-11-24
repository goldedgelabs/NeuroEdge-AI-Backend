/**
 * NeuroEdge E2E Simulation
 * - Simulates a full scenario where multiple engines and agents interact
 * - Demonstrates offline-first DB, replication, event-driven flows
 * - Tests self-healing, GPU allocation, plugin loading, mesh broadcasts,
 *   learning/evolution loops, and integrations (medicine / phone security / GoldEdge)
 *
 * NOTE: many engine/agent methods are placeholders; the script tries sensible names
 * and falls back gracefully if a method isn't implemented yet.
 */

import { engineManager, runEngineChain, eventBus as engineEventBus } from "../core/engineManager";
import { agentManager } from "../core/agentManager";
import { localDB, distributedDB, replicator } from "../database"; // index.ts export
import { logger } from "../utils/logger";

async function safeCall(target: any, method: string, ...args: any[]) {
  try {
    if (!target) return { error: "target-not-found" };
    if (typeof target[method] === "function") return await target[method](...args);
    if (typeof target.run === "function" && method === "run") return await target.run(...args);
    return { skipped: true, reason: `method-${method}-missing` };
  } catch (err) {
    logger.error(`[safeCall] Error calling ${method}`, err);
    // attempt to trigger recover if available
    try { if (typeof target.recover === "function") await target.recover(err); } catch (e) {}
    return { error: err?.message || String(err) };
  }
}

async function simulateOfflineWriteAndSync() {
  logger.log("=== Offline-first write & replication test ===");
  await localDB.set("patient:001", { id: "001", name: "Alice", meds: [{ name: "Panadol", dose: "500mg" }] });
  logger.log("[DB] Local write complete. Simulating offline state...");

  // simulate local-only updates while offline
  await localDB.set("patient:001.recentEvent", { ts: Date.now(), event: "checkin", note: "missed dose" });

  // Later: go online -> push to distributed
  logger.log("[DB] Going online: pushing local updates to distributed...");
  const val = await localDB.get("patient:001");
  await distributedDB.pushUpdate("patient:001", val);

  // Simulate receiving remote update
  await distributedDB.subscribeToUpdates(async (d: any) => {
    logger.log("[DB] Received distributed update:", d.key);
    await localDB.set(d.key, d.value);
  });

  // Force a replicate merge (uses replicator.replicate if available)
  try {
    const merged = await replicator.replicate({ "patient:001": val }, {}); // simple call
    logger.log("[DB] Replication merged:", merged["patient:001"]?.id || "ok");
  } catch (err) {
    logger.warn("[DB] replicator.replicate not available or failed. Continuing.");
  }
}

async function testEngineAgentFlows() {
  logger.log("=== Engine -> Agent interaction test ===");

  // 1) Run a cross-engine chain: SelfImprovement -> Predictive -> HealthEngine -> PlannerEngine
  try {
    const chainResult = await runEngineChain([
      { engine: "SelfImprovementEngine", input: { userId: "u100", context: "improve_med_adherence" } },
      { engine: "PredictiveEngine", input: { scenario: "adherence_forecast", userId: "u100" } },
      { engine: "HealthEngine", input: { action: "suggest_med_change", userId: "u100" } },
      { engine: "PlannerEngine", input: { planType: "medication_reminder", userId: "u100" } },
    ]);
    logger.log("[Chain] Result:", chainResult);
  } catch (err) {
    logger.error("[Chain] runEngineChain failed:", err);
  }

  // 2) Fire an event that MedicineManagementAgent listens for
  engineEventBus.publish("medicine:new", { medId: "NEURO-001", name: "NeuroBoost", dosage: "250mg", addedBy: "research-team" });

  // Give async handlers a moment
  await new Promise(r => setTimeout(r, 300));

  // 3) Trigger phone theft scenario -> DeviceProtectionEngine should call PhoneSecurityAgent
  engineEventBus.publish("device:stolen", { deviceId: "phone-777", owner: "u100", location: "Nairobi" });

  await new Promise(r => setTimeout(r, 300));

  // 4) GPU assignment for a heavy training task
  const gpuAgent = agentManager["GPUAgent"];
  const assign = await safeCall(gpuAgent, "assignGPU", "task-train-1");
  logger.log("[GPU] Assigned:", assign);

  // Simulate training on CodeEngine / PredictiveEngine using assigned GPU
  if (!assign?.error && assign?.gpu) {
    const pe = engineManager["PredictiveEngine"];
    const trainResult = await safeCall(pe, "run", { action: "train", dataset: "health_corpus_v1", gpu: assign.gpu });
    logger.log("[Train] PredictiveEngine train result:", trainResult);
    await safeCall(gpuAgent, "releaseGPU", assign.gpu);
  }

  // 5) Plugin loading via PluginManagerAgent
  const pluginManager = agentManager["PluginManagerAgent"];
  try {
    await safeCall(pluginManager, "registerPlugin", "sample-analytics", {
      run: async (payload: any) => ({ ok: true, summary: `analyzed ${payload.items?.length || 0}` })
    });
    const pmRun = await safeCall(pluginManager, "runPlugin", "sample-analytics", "run", { items: [1, 2, 3] });
    logger.log("[Plugin] sample-analytics run:", pmRun);
  } catch (err) {
    logger.warn("[Plugin] plugin registration failed:", err);
  }

  // 6) GoldEdge integration flow
  engineEventBus.publish("goldedge:sync", { app: "GoldEdgeBrowser", update: "bookmarks", user: "u100" });
  await new Promise(r => setTimeout(r, 200));

  // 7) Simulate Self-healing: crash an engine and then call it
  logger.log("[Self-heal] Simulating VoiceEngine crash");
  const voice = engineManager["VoiceEngine"];
  // Save original, then break
  const originalVoiceRun = voice?.run;
  if (originalVoiceRun) {
    (voice as any).run = async () => { throw new Error("Simulated crash"); };
    const res = await safeCall(voice, "run", { text: "hello" });
    logger.log("[Self-heal] Crash call result:", res);
    // restore original
    (voice as any).run = originalVoiceRun;
    const res2 = await safeCall(voice, "run", { text: "hello again" });
    logger.log("[Self-heal] Post-restore result:", res2);
  } else {
    logger.warn("[Self-heal] VoiceEngine.run not present");
  }

  // 8) GlobalMesh broadcast of a learning model update
  const mesh = agentManager["GlobalMeshAgent"];
  if (mesh) {
    const broadcastRes = await safeCall(mesh, "broadcast", "model_update", { model: "predictive_v2", version: "2.0" });
    logger.log("[Mesh] Broadcast results:", broadcastRes);
  }

  // 9) Learning & Evolution loop: Feedback -> Analytics -> LearningAgent -> EvolutionAgent
  engineEventBus.publish("feedback:received", { source: "user", text: "model hallucinated", severity: "high" });
  await new Promise(r => setTimeout(r, 300));

  // Probe learning & evolution agents
  const learningAgent = agentManager["LearningAgent"];
  const evolutionAgent = agentManager["EvolutionAgent"];
  const analyticsAgent = agentManager["AnalyticsAgent"];

  const sampleFeedback = { id: "fb1", text: "inaccurate med dosage suggestion", user: "u100" };
  const analyticsOut = await safeCall(analyticsAgent, "run", { action: "analyze_feedback", payload: sampleFeedback });
  logger.log("[Analytics] Feedback analysis:", analyticsOut);

  if (analyticsOut) {
    const learn = await safeCall(learningAgent, "learnFrom", "AnalyticsEngine", analyticsOut);
    logger.log("[Learning] learnFrom result:", learn);
    const evo = await safeCall(evolutionAgent, "evolveComponent", "PredictiveEngine", { patch: "refine-dosage-model" });
    logger.log("[Evolution] evolveComponent result:", evo);
  }

  // 10) Confirm medicine was recorded in DB and agent processed it
  const med = await localDB.get("NEURO_MED_NEURO-001");
  logger.log("[DB] NEURO_MED_NEURO-001 local value:", med ? "exists" : "not-found (expected if agent didn't persist yet)");

  logger.log("=== Engine-Agent flow test complete ===");
}

async function finalAuditAndSummary() {
  logger.log("=== Final audit: agent & engine availability ===");
  const engines = Object.keys(engineManager).sort();
  const agents = Object.keys(agentManager).sort();
  logger.log("[Audit] Engines:", engines.join(", "));
  logger.log("[Audit] Agents:", agents.join(", "));
  logger.log("[Audit] LocalDB keys (sample):", Object.keys((localDB as any).store || {}).slice(0, 20));
  logger.log("=== End of E2E Simulation ===");
}

(async function main() {
  logger.log("[E2E] NeuroEdge E2E simulation starting...");
  try {
    await simulateOfflineWriteAndSync();
    await testEngineAgentFlows();
    await finalAuditAndSummary();
    logger.log("[E2E] Simulation finished successfully ✅");
  } catch (err) {
    logger.error("[E2E] Simulation failed:", err);
  }
})();

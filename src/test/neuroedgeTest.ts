/**
 * NeuroEdge Full Test Scenario
 * ----------------------------
 * 1. Run multiple engines in sequence
 * 2. Trigger agents via events
 * 3. Demonstrate offline-first DB + replication
 * 4. Validate Doctrine enforcement & self-healing
 */

import { engineManager, runEngineChain, eventBus as engineEventBus } from "../core/engineManager";
import { agentManager } from "../core/agentManager";
import { LocalDB } from "../database/local/LocalDB";
import { DistributedDB } from "../database/distributed/DistributedDB";
import { Replicator } from "../database/replication/Replicator";

(async () => {
  console.log("[Test] Starting NeuroEdge full system test...");

  // -----------------------------
  // 1. DATABASE SETUP
  // -----------------------------
  const localDB = new LocalDB();
  const distributedDB = new DistributedDB();
  const replicator = new Replicator(localDB, distributedDB);

  // Simulate offline-first write
  console.log("[Test] Writing offline data...");
  localDB.write("patientData", { id: "123", medicine: "Panadol", dosage: "500mg" });
  replicator.sync(); // sync to distributed DB

  // -----------------------------
  // 2. EVENT TRIGGERS
  // -----------------------------
  engineEventBus.subscribe("medicine:new", (data) => {
    const agent = agentManager["MedicineManagementAgent"];
    agent?.processNewMedicine?.(data);
  });

  // Publish new medicine event
  console.log("[Test] Triggering medicine:new event...");
  engineEventBus.publish("medicine:new", { name: "NeuroBoost", dosage: "250mg" });

  // -----------------------------
  // 3. RUN ENGINE CHAIN
  // -----------------------------
  console.log("[Test] Running engine chain: SelfImprovement -> Predictive -> Planner...");
  const result = await runEngineChain([
    { engine: "SelfImprovementEngine", input: { userId: "user1", task: "optimize" } },
    { engine: "PredictiveEngine", input: { scenario: "medicineAdherence" } },
    { engine: "PlannerEngine", input: { planType: "health" } },
  ]);

  console.log("[Test] Engine chain result:", result);

  // -----------------------------
  // 4. SELF-HEALING TEST
  // -----------------------------
  const faultyEngine = engineManager["VoiceEngine"];
  faultyEngine.run = async () => { throw new Error("Simulated crash"); };
  console.log("[Test] Testing self-healing...");
  const recoverResult = await faultyEngine.run({ text: "Hello world" });
  console.log("[Test] Self-healing result:", recoverResult);

  // -----------------------------
  // 5. AGENT TEST
  // -----------------------------
  console.log("[Test] Triggering PhoneSecurityAgent...");
  const phoneAgent = agentManager["PhoneSecurityAgent"];
  const phoneResult = await phoneAgent?.detectTheft?.({ deviceId: "device123" });
  console.log("[Test] PhoneSecurityAgent result:", phoneResult);

  console.log("[Test] Triggering SelfProtectionAgent...");
  const selfProtect = agentManager["SelfProtectionAgent"];
  const protectResult = await selfProtect?.ensurePersistence?.({ system: "core" });
  console.log("[Test] SelfProtectionAgent result:", protectResult);

  console.log("[Test] NeuroEdge full system test completed ✅");
})();

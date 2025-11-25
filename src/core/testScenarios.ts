// src/core/testScenarios.ts
import { runEngineChain } from "./engineManager";

export async function runTestScenarios() {
  console.log("[Test] Running NeuroEdge test scenarios...");

  const results = await runEngineChain([
    { engine: "PlannerEngine", input: { goal: "Plan rollout" } },
    { engine: "AnalyticsEngine", input: { data: [1,2,3,4] } },
    { engine: "MedicineManagementEngine", input: { id: "med-001", name: "Painkiller", dosage: "100mg" } }
  ]);

  console.log("[Test] Engine chain results:", results);

  // Optionally verify agents received triggers
  const medAgent = agentManager["MedicineManagementAgent"];
  console.log("[Test] MedicineManagementAgent state:", medAgent?.getState?.());
}

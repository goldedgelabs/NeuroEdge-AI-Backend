// src/agents/SimulationAgent.ts
import { logger } from "../utils/logger";
import { engineManager, eventBus } from "../core/engineManager";

export class SimulationAgent {
  name = "SimulationAgent";

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Run a simulation with a given scenario and parameters
  async runSimulation(scenario: string, params: any) {
    logger.log(`[SimulationAgent] Running simulation for scenario: ${scenario}`, params);

    // Example: interact with a relevant engine
    const predictiveEngine = engineManager["PredictiveEngine"];
    let result = null;
    if (predictiveEngine && typeof predictiveEngine.run === "function") {
      result = await predictiveEngine.run({ scenario, params });
    }

    // Notify subscribers about simulation completion
    eventBus["simulation:complete"]?.forEach(cb => cb({ scenario, params, result }));

    logger.info(`[SimulationAgent] Simulation completed: ${scenario}`);
    return { success: true, result };
  }

  // List available simulation scenarios (can be expanded dynamically)
  getAvailableScenarios() {
    return ["market", "environment", "health", "AI_behavior"];
  }
}

import { logger } from "../utils/logger";
import { engineManager } from "../core/engineManager";

export class PlannerAgent {
  name = "PlannerAgent";

  constructor() {
    logger.info(`[PlannerAgent] Initialized`);
    // Optional: survival check on init
    if (typeof (this as any).survivalCheck === "function") {
      (this as any).survivalCheck();
    }
  }

  // Core method: run a task
  async run(task: string | object, context: any = {}) {
    logger.log(`[PlannerAgent] Running task:`, task);

    try {
      // Example: consult AnalyticsEngine before planning
      const analyticsResult = await engineManager["AnalyticsEngine"].run({ task, context });

      // Placeholder plan generation
      const plan = {
        task,
        analytics: analyticsResult,
        status: "planned",
        createdAt: new Date().toISOString(),
      };

      logger.info(`[PlannerAgent] Plan created successfully`);
      return plan;
    } catch (err) {
      logger.error(`[PlannerAgent] Error running task:`, err);
      if (typeof this.recover === "function") {
        await this.recover(err);
      }
      return { error: "Recovered from failure" };
    }
  }

  // Optional recovery method
  async recover(err: any) {
    logger.warn(`[PlannerAgent] Recovery triggered:`, err);
    // Recovery logic can be added here
  }

  // Allow inter-agent communication
  async talkTo(agentName: string, method: string, payload: any) {
    const agent = (globalThis as any).__NE_AGENT_MANAGER?.[agentName];
    if (agent && typeof agent[method] === "function") {
      return agent[method](payload);
    }
    logger.warn(`[PlannerAgent] Agent or method not found: ${agentName}.${method}`);
    return null;
  }
}

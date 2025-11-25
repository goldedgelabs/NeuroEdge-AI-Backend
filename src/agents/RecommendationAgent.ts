import { AgentBase } from "./AgentBase";
import { eventBus, agentManager } from "../core/engineManager";

export class RecommendationAgent extends AgentBase {
  constructor() {
    super("RecommendationAgent");
  }

  /**
   * Run method to generate recommendations based on input
   * input example: { userId: string, context: any }
   */
  async run(input?: any) {
    if (!input) return { error: "No input provided" };
    const { userId, context } = input;

    console.log(`[RecommendationAgent] Generating recommendations for user: ${userId}`);

    // Example: trigger RecommendationEngine if available
    const recommendationEngine = agentManager["RecommendationEngine"];
    if (recommendationEngine && typeof recommendationEngine.run === "function") {
      const recommendations = await recommendationEngine.run({ userId, context });
      return { userId, recommendations };
    }

    // Fallback
    return { userId, recommendations: [], message: "No engine available" };
  }

  async recover(err: any) {
    console.error(`[RecommendationAgent] Recovering from error:`, err);
  }
}

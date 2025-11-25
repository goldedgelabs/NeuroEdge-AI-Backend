import { AgentBase } from "./AgentBase";
import { agentManager, eventBus } from "../core/engineManager";

export class SearchAgent extends AgentBase {
  constructor() {
    super("SearchAgent");
  }

  /**
   * Main method to handle search requests
   * input example: { query: string, options?: any }
   */
  async run(input?: any) {
    if (!input) return { error: "No input provided" };
    const { query, options } = input;

    console.log(`[SearchAgent] Received query: ${query}`);

    // Trigger SearchEngine if registered
    const searchEngine = agentManager["SearchEngine"];
    if (searchEngine && typeof searchEngine.run === "function") {
      const result = await searchEngine.run({ query, options });
      return { query, result };
    }

    return { query, result: null, message: "SearchEngine not available" };
  }

  async recover(err: any) {
    console.error(`[SearchAgent] Recovering from error:`, err);
  }
}

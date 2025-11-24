import { EngineBase } from "../EngineBase";
import { agentManager } from "../../core/agentManager";

export class AgentsEngine extends EngineBase {
  constructor() {
    super("AgentsEngine");
  }

  async run(input: any) {
    console.log(`[AgentsEngine] Running agent orchestration with input:`, input);

    // Example: Trigger multiple agents in sequence
    const agentNames = input?.agents || Object.keys(agentManager);
    const results: Record<string, any> = {};

    for (const agentName of agentNames) {
      const agent = agentManager[agentName];
      if (agent && typeof agent.run === "function") {
        try {
          results[agentName] = await agent.run(input);
        } catch (err) {
          console.warn(`[AgentsEngine] Error running ${agentName}:`, err);
          results[agentName] = { error: "Failed to run agent" };
        }
      }
    }

    return results;
  }

  async handleDBUpdate(event: any) {
    console.log(`[AgentsEngine] DB Update event received:`, event);
    // Optional: Trigger agents based on DB changes
  }

  async handleDBDelete(event: any) {
    console.log(`[AgentsEngine] DB Delete event received:`, event);
    // Optional: Trigger agents to clean up resources
  }
}

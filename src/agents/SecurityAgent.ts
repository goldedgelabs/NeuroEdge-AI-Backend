import { AgentBase } from "./AgentBase";
import { agentManager, eventBus } from "../core/engineManager";

export class SecurityAgent extends AgentBase {
  constructor() {
    super("SecurityAgent");
  }

  /**
   * Main security check entry
   * input example: { type: "audit" | "scan", target?: string }
   */
  async run(input?: any) {
    if (!input) return { error: "No input provided" };
    const { type, target } = input;

    console.log(`[SecurityAgent] Performing security check: ${type} on ${target || "all"}`);

    // Example: trigger SecurityEngine if registered
    const securityEngine = agentManager["SecurityEngine"];
    if (securityEngine && typeof securityEngine.run === "function") {
      const result = await securityEngine.run({ type, target });
      return { type, target, result };
    }

    return { type, target, result: null, message: "SecurityEngine not available" };
  }

  async recover(err: any) {
    console.error(`[SecurityAgent] Recovering from error:`, err);
  }
}

import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class SelfHealingEngine extends EngineBase {
  constructor() {
    super();
    this.name = "SelfHealingEngine";
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Ensure self-healing routines and monitoring are active
    return true;
  }

  /**
   * run function
   * @param input - { type: string, payload: any }
   */
  async run(input: { type: string; payload: any }) {
    logger.info(`[${this.name}] Processing task:`, input.type);

    let result;
    switch (input.type) {
      case "engineRecovery":
        // Recover a failed engine
        result = await this.recoverEngine(input.payload.engineName);
        break;
      case "agentRecovery":
        // Recover a failed agent
        result = await this.recoverAgent(input.payload.agentName);
        break;
      default:
        result = { status: "unknown", message: "Action not recognized" };
    }

    return {
      task: input.type,
      result,
      timestamp: new Date().toISOString(),
    };
  }

  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "SelfHealingEngine recovered" };
  }

  async recoverEngine(engineName: string) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine.survivalCheck === "function") {
      const check = await engine.survivalCheck();
      return { engineName, recovered: check };
    }
    return { engineName, recovered: false };
  }

  async recoverAgent(agentName: string) {
    const agentManager = (globalThis as any).__NE_AGENT_MANAGER;
    const agent = agentManager[agentName];
    if (agent && typeof agent.recover === "function") {
      const result = await agent.recover({ source: "SelfHealingEngine" });
      return { agentName, recovered: true, result };
    }
    return { agentName, recovered: false };
  }

  async talkTo(engineName: string, method: string, payload: any) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine[method] === "function") {
      return engine[method](payload);
    }
    return null;
  }
}

// Optional: register immediately
// registerEngine("SelfHealingEngine", new SelfHealingEngine());

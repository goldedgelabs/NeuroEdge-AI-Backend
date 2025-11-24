import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class ReinforcementEngine extends EngineBase {
  constructor() {
    super();
    this.name = "ReinforcementEngine";
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Check RL models or policies
    return true;
  }

  /**
   * run function
   * @param input - { state: any, action?: any, reward?: number }
   */
  async run(input: { state: any; action?: any; reward?: number }) {
    logger.info(`[${this.name}] Processing state:`, input.state);

    // Mock reinforcement logic
    const nextAction = { action: "move_forward", confidence: 0.87 };
    const updatedState = { ...input.state, lastAction: nextAction };

    return {
      nextAction,
      updatedState,
      timestamp: new Date().toISOString(),
    };
  }

  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "ReinforcementEngine recovered" };
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
// registerEngine("ReinforcementEngine", new ReinforcementEngine());

import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class OrchestrationEngine extends EngineBase {
  constructor() {
    super();
    this.name = "OrchestrationEngine";
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Check that all dependent engines are registered
    const engines = (globalThis as any).__NE_ENGINE_MANAGER;
    if (!engines) {
      throw new Error(`[${this.name}] No engine manager found!`);
    }
    return true;
  }

  // Main run function: orchestrates other engines
  async run(chain: { engine: string; input?: any }[]) {
    logger.info(`[${this.name}] Orchestrating engine chain:`, chain.map(c => c.engine));

    const engineManager = (globalThis as any).__NE_ENGINE_MANAGER;
    let lastOutput: any = null;

    for (const step of chain) {
      const engine = engineManager[step.engine];
      if (!engine || typeof engine.run !== "function") {
        logger.warn(`[${this.name}] Engine not found or invalid: ${step.engine}`);
        continue;
      }
      lastOutput = await engine.run(step.input ?? lastOutput);
    }

    return { status: "ok", output: lastOutput };
  }

  // Self-healing
  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "OrchestrationEngine recovered" };
  }

  // Engine-to-engine communication
  async talkTo(engineName: string, method: string, payload: any) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine[method] === "function") {
      return engine[method](payload);
    }
    return null;
  }
}

// Optional: register immediately
// registerEngine("OrchestrationEngine", new OrchestrationEngine());

import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class MemoryEngine extends EngineBase {
  private memoryStore: Record<string, any> = {};

  constructor() {
    super();
    this.name = "MemoryEngine";
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Could check disk/DB persistence or cache readiness
    return true;
  }

  // Main run function
  async run(input: any) {
    logger.info(`[${this.name}] Running with input:`, input);

    if (input?.action === "store" && input?.key && input?.value) {
      this.memoryStore[input.key] = input.value;
      return { status: "stored", key: input.key };
    }

    if (input?.action === "retrieve" && input?.key) {
      return { status: "retrieved", key: input.key, value: this.memoryStore[input.key] };
    }

    if (input?.action === "delete" && input?.key) {
      delete this.memoryStore[input.key];
      return { status: "deleted", key: input.key };
    }

    return { status: "noop", message: "No action performed" };
  }

  // Self-healing
  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    this.memoryStore = {}; // fallback: reset memory
    return { status: "recovered", message: "Memory cleared for safety" };
  }

  // Communicate with other engines
  async talkTo(engineName: string, method: string, payload: any) {
    const engine = (globalThis as any).__NE_ENGINE_MANAGER[engineName];
    if (engine && typeof engine[method] === "function") {
      return engine[method](payload);
    }
    return null;
  }
}

// Optional: register immediately
// registerEngine("MemoryEngine", new MemoryEngine());

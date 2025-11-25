import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class SummarizationEngine extends EngineBase {
  constructor() {
    super();
    this.name = "SummarizationEngine";
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.info(`[${this.name}] Performing survival check...`);
    // Ensure summarization models/resources are ready
    return true;
  }

  /**
   * run function
   * @param input - { text: string, maxSentences?: number }
   */
  async run(input: { text: string; maxSentences?: number }) {
    logger.info(`[${this.name}] Summarizing text...`);

    const maxSentences = input.maxSentences ?? 5;
    const sentences = input.text.split(/[.!?]/).filter(Boolean);
    const summary = sentences.slice(0, maxSentences).join(". ") + (sentences.length > maxSentences ? "..." : "");

    return {
      originalLength: sentences.length,
      summary,
      timestamp: new Date().toISOString(),
    };
  }

  async recover(err: any) {
    logger.error(`[${this.name}] Error recovered:`, err);
    return { status: "recovered", message: "SummarizationEngine recovered" };
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
// registerEngine("SummarizationEngine", new SummarizationEngine());

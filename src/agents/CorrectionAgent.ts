import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/eventBus";
import { db } from "../db/dbManager";

/**
 * Correction Agent
 * ----------------
 * Responsible for:
 *  - Grammar correction
 *  - Text cleanup
 *  - Rewriting inputs to clean canonical format
 *  - Fixing AI or user errors
 *  - Auto-correcting engine/agent payloads before processing
 */
export class CorrectionAgent extends AgentBase {
  constructor() {
    super({
      id: "correction-agent",
      name: "Correction Agent",
      description: "Corrects grammar, spelling, formatting, and rewrites ambiguous text.",
      type: "nlp"
    });
  }

  /**
   * Corrects user text and returns the improved version.
   */
  async correctText(payload: { text: string }) {
    const { text } = payload;

    if (!text || typeof text !== "string") {
      return { error: "Invalid text input." };
    }

    // Step 1 — Basic grammar and spelling correction (placeholder logic)
    const corrected = await this.basicCorrection(text);

    // Step 2 — Publish event
    eventBus.publish("correction:applied", {
      original: text,
      corrected
    });

    // Step 3 — Store correction logs
    await this.logCorrection(text, corrected);

    return { corrected };
  }

  /**
   * Placeholder grammar + spelling correction system.
   * (This will later be replaced by ReasoningEngine + NLP models.)
   */
  async basicCorrection(text: string): Promise<string> {
    let fixed = text.trim();

    // Auto-capitalize first letter
    if (fixed.length > 0) {
      fixed = fixed[0].toUpperCase() + fixed.slice(1);
    }

    // Ensure sentence ends properly
    if (!fixed.endsWith(".") && !fixed.endsWith("!") && !fixed.endsWith("?")) {
      fixed += ".";
    }

    // Remove duplicate spaces
    fixed = fixed.replace(/\s+/g, " ");

    return fixed;
  }

  /**
   * Store correction logs in DB.
   */
  async logCorrection(original: string, corrected: string) {
    const entry = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      original,
      corrected
    };

    await db.set("corrections", entry.id, entry, "edge");
  }

  /**
   * Subscribes to correction events
   */
  async init() {
    eventBus.subscribe("correction:applied", (data) => {
      console.log(`[CorrectionAgent] Correction event:`, data);
    });
  }
}

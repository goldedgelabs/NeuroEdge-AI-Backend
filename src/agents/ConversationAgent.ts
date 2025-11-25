import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/eventBus";
import { db } from "../db/dbManager";

/**
 * Conversation Agent
 * ------------------
 * Handles all user–AI conversational flows.
 * Controls tone, context, reply shaping, memory injection,
 * and routing requests to engines when needed.
 */
export class ConversationAgent extends AgentBase {
  constructor() {
    super({
      id: "conversation-agent",
      name: "Conversation Agent",
      description: "Manages user conversations, context tracking, memory injection, and routing.",
      type: "core"
    });
  }

  /**
   * Primary conversation handler
   */
  async handle(payload: any): Promise<any> {
    const { message, userId = "anonymous" } = payload;

    // Step 1 — Check moderation
    const moderation = await this.scanForSafety(message);
    if (!moderation.safe) {
      return {
        blocked: true,
        reason: "Message violates conversation safety rules.",
        flags: moderation.flags
      };
    }

    // Step 2 — Retrieve user memory
    const memory = await this.getUserMemory(userId);

    // Step 3 — Generate AI reply (placeholder)
    const reply = await this.generateReply(message, memory);

    // Step 4 — Save conversation to DB
    await this.storeMessage(userId, message, reply);

    // Step 5 — Publish conversation event
    eventBus.publish("conversation:new", {
      userId,
      input: message,
      output: reply
    });

    return { reply };
  }

  /**
   * Lightweight text safety scanning
   */
  async scanForSafety(text: string) {
    const redFlags = ["kill", "hack", "sex", "bomb"];
    const found = redFlags.filter((w) => text.toLowerCase().includes(w));

    if (found.length > 0) {
      return { safe: false, flags: found };
    }
    return { safe: true };
  }

  /**
   * Store message in conversation logs
   */
  async storeMessage(userId: string, userMessage: string, aiReply: string) {
    const record = {
      id: `${Date.now()}`,
      timestamp: Date.now(),
      userId,
      message: userMessage,
      reply: aiReply
    };

    await db.set("conversations", record.id, record, "edge");
  }

  /**
   * Retrieve user's memory profile
   */
  async getUserMemory(userId: string) {
    return await db.get("memory_profiles", userId, "shared");
  }

  /**
   * Placeholder reply system (will later connect to ReasoningEngine)
   */
  async generateReply(input: string, memory: any) {
    const memoryNote = memory ? ` (I remember you)` : "";
    return `You said: "${input}". Tell me more.${memoryNote}`;
  }

  /**
   * Subscribes to new conversation events
   */
  async init() {
    eventBus.subscribe("conversation:new", (data) => {
      console.log(`[ConversationAgent] New conversation:`, data);
    });
  }
}

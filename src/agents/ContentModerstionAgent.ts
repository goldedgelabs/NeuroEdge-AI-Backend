import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/eventBus";
import { db } from "../db/dbManager";

/**
 * Content Moderation Agent
 * ------------------------
 * Scans text, images, audio, or video for harmful, abusive,
 * illegal, or unsafe content using NeuroEdge local policies.
 */
export class ContentModerationAgent extends AgentBase {
  constructor() {
    super({
      id: "content-moderation-agent",
      name: "Content Moderation Agent",
      description: "Detects and blocks harmful, unsafe, or policy-violating content across all engines and apps.",
      type: "security"
    });
  }

  /**
   * Main moderation endpoint
   */
  async handle(payload: any): Promise<any> {
    const { input, mode = "text" } = payload;

    switch (mode) {
      case "text":
        return this.scanText(input);
      case "image":
        return this.scanImage(input);
      case "audio":
        return this.scanAudio(input);
      case "video":
        return this.scanVideo(input);
      default:
        return { error: "Unknown moderation mode" };
    }
  }

  /**
   * TEXT moderation
   */
  async scanText(text: string) {
    const lower = text.toLowerCase();

    const banned = [
      "kill",
      "bomb",
      "terror",
      "hack",
      "racist",
      "suicide",
      "drugs",
      "abuse",
      "weapon"
    ];

    const flaggedWords = banned.filter((w) => lower.includes(w));

    if (flaggedWords.length > 0) {
      eventBus.publish("moderation:flagged", {
        type: "text",
        text,
        flags: flaggedWords
      });

      return {
        safe: false,
        reason: "Contains banned content",
        flags: flaggedWords
      };
    }

    return { safe: true };
  }

  /**
   * IMAGE moderation (placeholder for now)
   */
  async scanImage(image: any) {
    eventBus.publish("moderation:scan", { type: "image" });
    return { safe: true, note: "Image scanning model will be plugged in later" };
  }

  /**
   * AUDIO moderation (placeholder)
   */
  async scanAudio(audio: any) {
    eventBus.publish("moderation:scan", { type: "audio" });
    return { safe: true };
  }

  /**
   * VIDEO moderation (placeholder)
   */
  async scanVideo(video: any) {
    eventBus.publish("moderation:scan", { type: "video" });
    return { safe: true };
  }

  /**
   * Auto-actions when flags happen
   */
  async init() {
    eventBus.subscribe("moderation:flagged", (data) => {
      console.log(`[ModerationAgent] FLAGGED CONTENT!`, data);

      db.set(
        "moderation_logs",
        `${Date.now()}`,
        {
          timestamp: Date.now(),
          type: data.type,
          content: data.text,
          flags: data.flags
        },
        "edge"
      );
    });
  }
}

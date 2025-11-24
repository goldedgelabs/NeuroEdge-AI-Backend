// src/agents/LearningAgent.ts
import { logger } from "../utils/logger";
import { engineManager, eventBus } from "../core/engineManager";

export class LearningAgent {
  name = "LearningAgent";

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Learn from engine outputs or external data
  async learnFrom(engineName: string, data: any) {
    logger.log(`[LearningAgent] Learning from engine: ${engineName}`, data);

    const engine = engineManager[engineName];
    if (!engine) {
      logger.warn(`[LearningAgent] Engine not found: ${engineName}`);
      return { success: false, message: "Engine not found" };
    }

    if (typeof engine.provideLearningData === "function") {
      const learningData = await engine.provideLearningData(data);
      // Process or store the learning
      logger.info(`[LearningAgent] Learning processed from ${engineName}`);
      return { success: true, learningData };
    } else {
      logger.warn(`[LearningAgent] Engine ${engineName} does not provide learning data`);
      return { success: false, message: "No learning method available" };
    }
  }

  // Integrate knowledge into other agents or engines
  async applyKnowledge(targetName: string, knowledge: any) {
    logger.log(`[LearningAgent] Applying knowledge to: ${targetName}`, knowledge);

    const target = engineManager[targetName];
    if (!target) {
      logger.warn(`[LearningAgent] Target not found: ${targetName}`);
      return { success: false, message: "Target not found" };
    }

    if (typeof target.receiveKnowledge === "function") {
      await target.receiveKnowledge(knowledge);
      logger.info(`[LearningAgent] Knowledge applied to ${targetName}`);
      // Emit event to notify system
      eventBus["learning:applied"]?.forEach(cb => cb({ targetName, knowledge }));
      return { success: true };
    } else {
      logger.warn(`[LearningAgent] Target ${targetName} cannot receive knowledge`);
      return { success: false, message: "Cannot receive knowledge" };
    }
  }
  }

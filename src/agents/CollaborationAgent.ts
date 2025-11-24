// src/agents/CollaborationAgent.ts
import { logger } from "../utils/logger";
import { eventBus } from "../core/engineManager";

export class CollaborationAgent {
  name = "CollaborationAgent";
  private collaborators: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Add a collaborator (could be another AI, agent, or human)
  addCollaborator(id: string, metadata: any) {
    if (this.collaborators[id]) {
      logger.warn(`[CollaborationAgent] Collaborator '${id}' already exists.`);
      return { success: false, message: "Collaborator already exists" };
    }
    this.collaborators[id] = metadata;
    logger.log(`[CollaborationAgent] Collaborator '${id}' added.`);
    // Notify system of new collaborator
    eventBus["collaboration:new"]?.forEach(cb => cb({ id, metadata }));
    return { success: true };
  }

  // Remove collaborator
  removeCollaborator(id: string) {
    if (this.collaborators[id]) {
      delete this.collaborators[id];
      logger.log(`[CollaborationAgent] Collaborator '${id}' removed.`);
      eventBus["collaboration:removed"]?.forEach(cb => cb({ id }));
      return { success: true };
    }
    return { success: false, message: "Collaborator not found" };
  }

  // List all collaborators
  listCollaborators() {
    return Object.keys(this.collaborators).map(id => ({
      id,
      metadata: this.collaborators[id],
    }));
  }

  // Send a message or task to a collaborator
  sendMessage(id: string, payload: any) {
    if (!this.collaborators[id]) {
      logger.warn(`[CollaborationAgent] Collaborator '${id}' not found.`);
      return { success: false, message: "Collaborator not found" };
    }
    logger.log(`[CollaborationAgent] Sending message to '${id}':`, payload);
    eventBus[`collaboration:message:${id}`]?.forEach(cb => cb(payload));
    return { success: true };
  }
}

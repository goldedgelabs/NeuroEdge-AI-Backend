// src/agents/InspectionAgent.ts
import fs from "fs";
import path from "path";
import { engineManager, registerEngine } from "../core/engineManager";
import { agentManager, registerAgent } from "../core/agentManager";
import { db } from "../db/dbManager";
import { eventBus } from "../core/eventBus";
import { logger } from "../utils/logger";

export class InspectionAgent {
  name = "InspectionAgent";

  enginesPath = path.resolve(__dirname, "../engines");
  agentsPath = path.resolve(__dirname, "../agents");

  constructor() {
    logger.log(`[InspectionAgent] Initialized`);
  }

  async scanEngines() {
    const files = fs.readdirSync(this.enginesPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));

    for (const file of files) {
      const engineName = file.replace(/\.(ts|js)$/, "");
      if (!engineManager[engineName]) {
        const engineModule = await import(path.join(this.enginesPath, file));
        const EngineClass = engineModule[engineName];
        if (EngineClass) {
          registerEngine(engineName, new EngineClass());
          logger.log(`[InspectionAgent] Registered new engine: ${engineName}`);
          eventBus.publish("engine:registered", { engine: engineName });
        }
      }
    }
  }

  async scanAgents() {
    const files = fs.readdirSync(this.agentsPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));

    for (const file of files) {
      const agentName = file.replace(/\.(ts|js)$/, "");
      if (!agentManager[agentName]) {
        const agentModule = await import(path.join(this.agentsPath, file));
        const AgentClass = agentModule[agentName];
        if (AgentClass) {
          registerAgent(agentName, new AgentClass());
          logger.log(`[InspectionAgent] Registered new agent: ${agentName}`);
          eventBus.publish("agent:registered", { agent: agentName });
        }
      }
    }
  }

  async unregisterEngine(engineName: string) {
    if (engineManager[engineName]) {
      delete engineManager[engineName];
      logger.log(`[InspectionAgent] Unregistered engine: ${engineName}`);
      eventBus.publish("engine:unregistered", { engine: engineName });
    }
  }

  async unregisterAgent(agentName: string) {
    if (agentManager[agentName]) {
      delete agentManager[agentName];
      logger.log(`[InspectionAgent] Unregistered agent: ${agentName}`);
      eventBus.publish("agent:unregistered", { agent: agentName });
    }
  }

  async fullScan() {
    await this.scanEngines();
    await this.scanAgents();
    logger.log(`[InspectionAgent] Full scan complete`);
  }

  // Optional: Schedule periodic scans
  scheduleScan(intervalMs: number) {
    setInterval(() => this.fullScan(), intervalMs);
    logger.log(`[InspectionAgent] Scheduled scans every ${intervalMs}ms`);
  }
}

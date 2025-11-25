// src/agents/InspectionAgent.ts
import { readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { engineManager } from "../core/engineManager";
import { agentManager } from "../core/agentManager";
import { db } from "../db/dbManager";
import { eventBus } from "../core/eventBus";
import { logger } from "../utils/logger";

export class InspectionAgent {
  name = "InspectionAgent";

  constructor() {
    logger.log(`[${this.name}] Initialized`);
  }

  // Scan a folder recursively for .ts files
  private scanFolder(folderPath: string): string[] {
    let files: string[] = [];
    const items = readdirSync(folderPath);
    for (const item of items) {
      const fullPath = join(folderPath, item);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        files = files.concat(this.scanFolder(fullPath));
      } else if (stats.isFile() && extname(item) === ".ts") {
        files.push(fullPath);
      }
    }
    return files;
  }

  // Dynamically import and register engines
  async inspectEngines() {
    const enginesPath = join(__dirname, "../engines");
    const engineFiles = this.scanFolder(enginesPath);

    for (const file of engineFiles) {
      const engineName = basename(file, ".ts");
      if (!engineManager[engineName]) {
        try {
          const module = await import(file);
          const EngineClass = module[engineName];
          if (EngineClass) {
            const instance = new EngineClass();
            engineManager[engineName] = instance;
            logger.log(`[InspectionAgent] Registered engine: ${engineName}`);
          }
        } catch (err) {
          logger.error(`[InspectionAgent] Failed to register engine ${engineName}:`, err);
        }
      }
    }
  }

  // Dynamically import and register agents
  async inspectAgents() {
    const agentsPath = join(__dirname);
    const agentFiles = this.scanFolder(agentsPath);

    for (const file of agentFiles) {
      const agentName = basename(file, ".ts");
      if (agentName === "InspectionAgent" || agentName === "AgentBase") continue;
      if (!agentManager[agentName]) {
        try {
          const module = await import(file);
          const AgentClass = module[agentName];
          if (AgentClass) {
            const instance = new AgentClass();
            agentManager[agentName] = instance;
            logger.log(`[InspectionAgent] Registered agent: ${agentName}`);
          }
        } catch (err) {
          logger.error(`[InspectionAgent] Failed to register agent ${agentName}:`, err);
        }
      }
    }
  }

  // Optionally unregister removed engines or agents
  async cleanup() {
    for (const engineName in engineManager) {
      const enginePath = join(__dirname, "../engines", `${engineName}.ts`);
      try {
        statSync(enginePath);
      } catch {
        delete engineManager[engineName];
        logger.warn(`[InspectionAgent] Unregistered missing engine: ${engineName}`);
      }
    }

    for (const agentName in agentManager) {
      if (agentName === "InspectionAgent") continue;
      const agentPath = join(__dirname, `${agentName}.ts`);
      try {
        statSync(agentPath);
      } catch {
        delete agentManager[agentName];
        logger.warn(`[InspectionAgent] Unregistered missing agent: ${agentName}`);
      }
    }
  }

  // Full inspection routine
  async run() {
    logger.log(`[${this.name}] Running full inspection...`);
    await this.inspectEngines();
    await this.inspectAgents();
    await this.cleanup();
    logger.log(`[${this.name}] Inspection complete`);
  }
}

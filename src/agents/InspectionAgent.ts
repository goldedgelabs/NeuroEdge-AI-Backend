import fs from "fs";
import path from "path";
import { engineManager, registerEngine } from "../core/engineManager";
import { agentManager, registerAgent } from "../core/agentManager";
import { eventBus } from "../core/engineManager";
import { logger } from "../utils/logger";

export class InspectionAgent {
  name = "InspectionAgent";

  constructor() {
    logger.log(`[InspectionAgent] Initialized`);
  }

  /**
   * Scan a folder recursively and return all .ts files
   */
  scanFolder(folderPath: string): string[] {
    let results: string[] = [];
    const items = fs.readdirSync(folderPath);

    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(this.scanFolder(fullPath));
      } else if (fullPath.endsWith(".ts")) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Dynamically load and register all engines
   */
  inspectEngines(folderPath: string) {
    const files = this.scanFolder(folderPath);
    files.forEach(file => {
      const EngineClass = require(file).default || require(file);
      if (!EngineClass) return;
      const engineName = EngineClass.name;
      if (!engineManager[engineName]) {
        logger.log(`[InspectionAgent] Registering Engine: ${engineName}`);
        registerEngine(engineName, new EngineClass());
      } else {
        logger.log(`[InspectionAgent] Engine already registered: ${engineName}`);
      }
    });
  }

  /**
   * Dynamically load and register all agents
   */
  inspectAgents(folderPath: string) {
    const files = this.scanFolder(folderPath);
    files.forEach(file => {
      const AgentClass = require(file).default || require(file);
      if (!AgentClass) return;
      const agentName = AgentClass.name;
      if (!agentManager[agentName]) {
        logger.log(`[InspectionAgent] Registering Agent: ${agentName}`);
        registerAgent(agentName, new AgentClass());
      } else {
        logger.log(`[InspectionAgent] Agent already registered: ${agentName}`);
      }
    });
  }

  /**
   * Full inspection for all engines and agents
   */
  runInspection() {
    logger.log(`[InspectionAgent] Running full system inspection...`);

    const enginesFolder = path.resolve(__dirname, "../engines");
    const agentsFolder = path.resolve(__dirname, "../agents");

    this.inspectEngines(enginesFolder);
    this.inspectAgents(agentsFolder);

    logger.log(`[InspectionAgent] Inspection complete.`);
  }

  /**
   * Unregister an engine dynamically
   */
  unregisterEngine(name: string) {
    if (engineManager[name]) {
      delete engineManager[name];
      logger.log(`[InspectionAgent] Engine unregistered: ${name}`);
    }
  }

  /**
   * Unregister an agent dynamically
   */
  unregisterAgent(name: string) {
    if (agentManager[name]) {
      delete agentManager[name];
      logger.log(`[InspectionAgent] Agent unregistered: ${name}`);
    }
  }
    }

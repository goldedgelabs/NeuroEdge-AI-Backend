// src/core/engineManager.ts
/**
 * NeuroEdge Engine Manager
 * -----------------------
 * Central registry for all engines
 * Provides:
 *  - Doctrine enforcement
 *  - Self-healing
 *  - Inter-engine communication
 *  - runEngineChain helper
 */

import { DoctrineEngine } from "../engines/DoctrineEngine/index";

// Import all 42 engines (some may be stubs for future expansion)
import { AgentsEngine } from "../engines/AgentsEngine/index";
import { CodeEngine } from "../engines/CodeEngine/index";
import { DataEngine } from "../engines/DataEngine/index";
import { DataIngestEngine } from "../engines/DataIngestEngine/index";
import { DecisionEngine } from "../engines/DecisionEngine/index";
import { DeviceProtectionEngine } from "../engines/DeviceProtectionEngine/index";
import { DoctrineEngine } from "../engines/DoctrineEngine/index";
import { GamingCreativeEngine } from "../engines/GamingCreativeEngine/index";
import { GoldEdgeIntegrationEngine } from "../engines/GoldEdgeIntegrationEngine/index";
import { HealthEngine } from "../engines/HealthEngine/index";
import { MarketEngine } from "../engines/MarketEngine/index";
import { MedicineManagementEngine } from "../engines/MedicineManagementEngine/index";
import { MemoryEngine } from "../engines/MemoryEngine/index";
import { MonitoringEngine } from "../engines/MonitoringEngine/index";
import { MultiModalEngine } from "../engines/MultiModalEngine/index";
import { PersonaEngine } from "../engines/PersonaEngine/index";
import { PhoneSecurityEngine } from "../engines/PhoneSecurityEngine/index";
import { PlannerEngine } from "../engines/PlannerEngine/index";
import { PolicyEngine } from "../engines/PolicyEngine/index";
import { RealTimeRecommenderEngine } from "../engines/RealTimeRecommenderEngine/index";
import { ReasoningEngine } from "../engines/ReasoningEngine/index";
import { RecommendationEngine } from "../engines/RecommendationEngine/index";
import { ResearchAnalyticsEngine } from "../engines/ResearchAnalyticsEngine/index";
import { ResearchEngine } from "../engines/ResearchEngine/index";
import { SchedulingEngine } from "../engines/SchedulingEngine/index";
import { SecurityEngine } from "../engines/SecurityEngine/index";
import { SelfImprovementEngine } from "../engines/SelfImprovementEngine/index";
import { SimulationEngine } from "../engines/SimulationEngine/index";
import { SummarizationEngine } from "../engines/SummarizationEngine/index";
import { VisionEngine } from "../engines/VisionEngine/index";
import { VoiceEngine } from "../engines/VoiceEngine/index";
import { WorkerEngine } from "../engines/WorkerEngine/index";
import { ReinforcementEngine } from "../engines/ReinforcementEngine/index";
import { AnalyticsEngine } from "../engines/AnalyticsEngine/index";
import { PlannerHelperEngine } from "../engines/PlannerHelperEngine/index";
import { OrchestrationEngine } from "../engines/OrchestrationEngine/index";
import { SearchEngine } from "../engines/SearchEngine/index";
import { TranslationEngine } from "../engines/TranslationEngine/index";
import { ConversationEngine } from "../engines/ConversationEngine/index";
import { SchedulingHelperEngine } from "../engines/SchedulingHelperEngine/index";
import { SelfHealingEngine } from "../engines/SelfHealingEngine/index";
import { TelemetryEngine } from "../engines/TelemetryEngine/index";

export const engineManager: Record<string, any> = {};
const doctrine = new DoctrineEngine();

// Global reference for engines to access manager
(globalThis as any).__NE_ENGINE_MANAGER = engineManager;

// -----------------------------
// Register Engines with Doctrine enforcement & self-healing
// -----------------------------
export function registerEngine(name: string, engineInstance: any) {
  engineManager[name] = new Proxy(engineInstance, {
    get(target: any, prop: string) {
      const origMethod = target[prop];
      if (typeof origMethod === "function") {
        return async (...args: any[]) => {
          const action = `${name}.${String(prop)}`;
          const folderArg = args[0]?.folder || "";
          const userRole = args[0]?.role || "user";

          // Doctrine enforcement
          let doctrineResult = { success: true };
          if (doctrine && typeof (doctrine as any).enforceAction === "function") {
            doctrineResult = await (doctrine as any).enforceAction(action, folderArg, userRole);
          }

          if (!doctrineResult.success) {
            console.warn(`[Doctrine] Action blocked: ${action}`);
            return { blocked: true, message: doctrineResult.message };
          }

          // Run original method with self-healing
          try {
            return await origMethod.apply(target, args);
          } catch (err) {
            if (typeof target.recover === "function") {
              await target.recover(err);
            }
            return { error: "Recovered from failure" };
          }
        };
      }
      return origMethod;
    }
  });
}

// -----------------------------
// Event Bus
// -----------------------------
export const eventBus: Record<string, Function[]> = {};
export function subscribe(channel: string, callback: Function) {
  if (!eventBus[channel]) eventBus[channel] = [];
  eventBus[channel].push(callback);
}
export function publish(channel: string, data: any) {
  const subscribers = eventBus[channel] || [];
  subscribers.forEach(cb => cb(data));
}

// -----------------------------
// Run multiple engines in sequence
// -----------------------------
export async function runEngineChain(chain: { engine: string; input?: any }[]) {
  let lastOutput: any = null;
  for (const step of chain) {
    const engine = engineManager[step.engine];
    if (!engine) throw new Error(`Engine not registered: ${step.engine}`);
    if (typeof engine.run === "function") {
      lastOutput = await engine.run(step.input ?? lastOutput);
    } else if (typeof engine === "function") {
      lastOutput = await engine(step.input ?? lastOutput);
    } else {
      lastOutput = null;
    }
  }
  return lastOutput;
}

// -----------------------------
// Register all 42 engines
// -----------------------------
[
  AgentsEngine,
  CodeEngine,
  DataEngine,
  DataIngestEngine,
  DecisionEngine,
  DeviceProtectionEngine,
  DoctrineEngine,
  GamingCreativeEngine,
  GoldEdgeIntegrationEngine,
  HealthEngine,
  MarketEngine,
  MedicineManagementEngine,
  MemoryEngine,
  MonitoringEngine,
  MultiModalEngine,
  PersonaEngine,
  PhoneSecurityEngine,
  PlannerEngine,
  PolicyEngine,
  RealTimeRecommenderEngine,
  ReasoningEngine,
  RecommendationEngine,
  ResearchAnalyticsEngine,
  ResearchEngine,
  SchedulingEngine,
  SecurityEngine,
  SelfImprovementEngine,
  SimulationEngine,
  SummarizationEngine,
  VisionEngine,
  VoiceEngine,
  WorkerEngine,
  ReinforcementEngine,
  AnalyticsEngine,
  PlannerHelperEngine,
  OrchestrationEngine,
  SearchEngine,
  TranslationEngine,
  ConversationEngine,
  SchedulingHelperEngine,
  SelfHealingEngine,
  TelemetryEngine
].forEach((EngineClass: any) => {
  const instanceName = EngineClass.name;
  registerEngine(instanceName, new EngineClass());
});

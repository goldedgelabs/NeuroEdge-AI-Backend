/**
 * NeuroEdge Engine Manager
 * -----------------------
 * Central registry for all engines
 * - Doctrine enforcement
 * - Self-healing
 * - Inter-engine communication
 * - EventBus integration
 */

import { DoctrineEngine } from "../engines/DoctrineEngine/index";

// Import all 25 engines (including new ones)
import { SelfImprovementEngine } from "../engines/SelfImprovementEngine/index";
import { PredictiveEngine } from "../engines/PredictiveEngine/index";
import { CodeEngine } from "../engines/CodeEngine/index";
import { VoiceEngine } from "../engines/VoiceEngine/index";
import { VisionEngine } from "../engines/VisionEngine/index";
import { ReinforcementEngine } from "../engines/ReinforcementEngine/index";
import { DataIngestEngine } from "../engines/DataIngestEngine/index";
import { AnalyticsEngine } from "../engines/AnalyticsEngine/index";
import { PlannerEngine } from "../engines/PlannerEngine/index";
import { MemoryEngine } from "../engines/MemoryEngine/index";
import { ConversationEngine } from "../engines/ConversationEngine/index";
import { SchedulingEngine } from "../engines/SchedulingEngine/index";
import { RecommendationEngine } from "../engines/RecommendationEngine/index";
import { SecurityEngine } from "../engines/SecurityEngine/index";
import { MonitoringEngine } from "../engines/MonitoringEngine/index";
import { TranslationEngine } from "../engines/TranslationEngine/index";
import { SummarizationEngine } from "../engines/SummarizationEngine/index";
import { PersonaEngine } from "../engines/PersonaEngine/index";
import { CreativityEngine } from "../engines/CreativityEngine/index";
import { OrchestrationEngine } from "../engines/OrchestrationEngine/index";
import { SearchEngine } from "../engines/SearchEngine/index";
import { MedicineManagementEngine } from "../engines/MedicineManagementEngine/index";
import { PhoneSecurityEngine } from "../engines/PhoneSecurityEngine/index";
import { GoldEdgeIntegrationEngine } from "../engines/GoldEdgeIntegrationEngine/index";
import { HealthEngine } from "../engines/HealthEngine/index";

export const engineManager: Record<string, any> = {};
const doctrine = new DoctrineEngine();

// Global reference to avoid circular imports
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
// Register all 25 engines
// -----------------------------
const engines = [
  SelfImprovementEngine,
  PredictiveEngine,
  CodeEngine,
  VoiceEngine,
  VisionEngine,
  ReinforcementEngine,
  DataIngestEngine,
  AnalyticsEngine,
  PlannerEngine,
  MemoryEngine,
  ConversationEngine,
  SchedulingEngine,
  RecommendationEngine,
  SecurityEngine,
  MonitoringEngine,
  TranslationEngine,
  SummarizationEngine,
  PersonaEngine,
  CreativityEngine,
  OrchestrationEngine,
  SearchEngine,
  MedicineManagementEngine,
  PhoneSecurityEngine,
  GoldEdgeIntegrationEngine,
  HealthEngine
];

engines.forEach(EngineClass => {
  registerEngine(EngineClass.name, new EngineClass());
});

registerEngine("DoctrineEngine", doctrine);

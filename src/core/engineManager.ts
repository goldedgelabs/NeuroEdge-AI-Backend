// src/core/engineManager.ts
import { db } from "../db/dbManager";
import { eventBus } from "./eventBus";
import { logger } from "../utils/logger";
import { DoctrineEngine } from "../engines/DoctrineEngine";

// --- Import all 42 engines ---
import { SelfImprovementEngine } from "../engines/SelfImprovementEngine";
import { PredictiveEngine } from "../engines/PredictiveEngine";
import { CodeEngine } from "../engines/CodeEngine";
import { VoiceEngine } from "../engines/VoiceEngine";
import { VisionEngine } from "../engines/VisionEngine";
import { ReinforcementEngine } from "../engines/ReinforcementEngine";
import { DataIngestEngine } from "../engines/DataIngestEngine";
import { AnalyticsEngine } from "../engines/AnalyticsEngine";
import { PlannerEngine } from "../engines/PlannerEngine";
import { MemoryEngine } from "../engines/MemoryEngine";
import { ConversationEngine } from "../engines/ConversationEngine";
import { SchedulingEngine } from "../engines/SchedulingEngine";
import { RecommendationEngine } from "../engines/RecommendationEngine";
import { SecurityEngine } from "../engines/SecurityEngine";
import { MonitoringEngine } from "../engines/MonitoringEngine";
import { TranslationEngine } from "../engines/TranslationEngine";
import { SummarizationEngine } from "../engines/SummarizationEngine";
import { PersonaEngine } from "../engines/PersonaEngine";
import { CreativityEngine } from "../engines/CreativityEngine";
import { OrchestrationEngine } from "../engines/OrchestrationEngine";
import { SearchEngine } from "../engines/SearchEngine";
import { DeviceProtectionEngine } from "../engines/DeviceProtectionEngine";
import { HealthEngine } from "../engines/HealthEngine";
import { MarketEngine } from "../engines/MarketEngine";
import { MedicineManagementEngine } from "../engines/MedicineManagementEngine";
import { MultiModalEngine } from "../engines/MultiModalEngine";
import { GamingCreativeEngine } from "../engines/GamingCreativeEngine";
import { PolicyEngine } from "../engines/PolicyEngine";
import { RealTimeRecommenderEngine } from "../engines/RealTimeRecommenderEngine";
import { ReasoningEngine } from "../engines/ReasoningEngine";
import { ResearchAnalyticsEngine } from "../engines/ResearchAnalyticsEngine";
import { ResearchEngine } from "../engines/ResearchEngine";
import { SimulationEngine } from "../engines/SimulationEngine";
import { GoldEdgeIntegrationEngine } from "../engines/GoldEdgeIntegrationEngine";
import { PhoneSecurityEngine } from "../engines/PhoneSecurityEngine";
import { PlannerHelperEngine } from "../engines/PlannerHelperEngine";
import { TelemetryEngine } from "../engines/TelemetryEngine";
import { SchedulerEngine } from "../engines/SchedulerEngine";
import { EdgeDeviceEngine } from "../engines/EdgeDeviceEngine";

// -----------------------------
export const engineManager: Record<string, any> = {};
const doctrine = new DoctrineEngine();
(globalThis as any).__NE_ENGINE_MANAGER = engineManager;

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
          if (doctrine && typeof doctrine.enforceAction === "function") {
            doctrineResult = await doctrine.enforceAction(action, folderArg, userRole);
          }
          if (!doctrineResult.success) {
            logger.warn(`[Doctrine] Action blocked: ${action}`);
            return { blocked: true, message: doctrineResult.message };
          }

          try {
            const result = await origMethod.apply(target, args);

            // --- DB integration: auto write + emit db:update ---
            if (result?.collection && result?.id) {
              await db.set(result.collection, result.id, result, "edge");
              eventBus.publish("db:update", {
                collection: result.collection,
                key: result.id,
                value: result,
                source: name
              });
              logger.log(`[EngineManager] DB updated by ${name}.${String(prop)} → ${result.collection}:${result.id}`);
            }

            return result;
          } catch (err) {
            if (typeof target.recover === "function") await target.recover(err);
            return { error: "Recovered from failure" };
          }
        };
      }
      return origMethod;
    }
  });
}

// -----------------------------
export async function runEngineChain(chain: { engine: string; input?: any }[]) {
  let lastOutput: any = null;
  for (const step of chain) {
    const engine = engineManager[step.engine];
    if (!engine) throw new Error(`Engine not registered: ${step.engine}`);
    lastOutput = await engine.run?.(step.input ?? lastOutput);
  }
  return lastOutput;
}

// -----------------------------
// Register all engines
// -----------------------------
[
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
  DeviceProtectionEngine,
  HealthEngine,
  MarketEngine,
  MedicineManagementEngine,
  MultiModalEngine,
  GamingCreativeEngine,
  PolicyEngine,
  RealTimeRecommenderEngine,
  ReasoningEngine,
  ResearchAnalyticsEngine,
  ResearchEngine,
  SimulationEngine,
  GoldEdgeIntegrationEngine,
  PhoneSecurityEngine,
  PlannerHelperEngine,
  TelemetryEngine,
  SchedulerEngine,
  EdgeDeviceEngine
].forEach((EngineClass) => registerEngine(EngineClass.name, new EngineClass()));

registerEngine("DoctrineEngine", doctrine);

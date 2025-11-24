// src/core/engineManager.ts
import { DoctrineEngine } from "../engines/DoctrineEngine/index";
import { db } from "../db/dbManager";
import { eventBus } from "./engineManagerBase"; // keep base event bus
import { logger } from "../utils/logger";

// Import all 25 engines
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
import { DoctrineEngine } from "../engines/DoctrineEngine";
import { PhoneSecurityEngine } from "../engines/PhoneSecurityEngine";
import { MedicineManagementEngine } from "../engines/MedicineManagementEngine";
import { GoldEdgeIntegrationEngine } from "../engines/GoldEdgeIntegrationEngine";

export const engineManager: Record<string, any> = {};
const doctrine = new DoctrineEngine();
(globalThis as any).__NE_ENGINE_MANAGER = engineManager;

// -----------------------------
// Register Engines with Doctrine & DB integration
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
            logger.warn(`[Doctrine] Action blocked: ${action}`);
            return { blocked: true, message: doctrineResult.message };
          }

          // Run original method with self-healing
          try {
            const result = await origMethod.apply(target, args);

            // Optionally write to DB if engine emits data
            if (args[0]?.dbCollection && args[0]?.dbKey) {
              await db.set(args[0].dbCollection, args[0].dbKey, result, args[0].dbTarget || "edge");
            }

            return result;
          } catch (err) {
            if (typeof target.recover === "function") {
              await target.recover(err);
            }
            return { error: "Recovered from failure" };
          }
        };
      }
      return origMethod;
    },
  });
}

// -----------------------------
// Register all 25 engines
// -----------------------------
const engines = [
  SelfImprovementEngine, PredictiveEngine, CodeEngine, VoiceEngine, VisionEngine,
  ReinforcementEngine, DataIngestEngine, AnalyticsEngine, PlannerEngine, MemoryEngine,
  ConversationEngine, SchedulingEngine, RecommendationEngine, SecurityEngine, MonitoringEngine,
  TranslationEngine, SummarizationEngine, PersonaEngine, CreativityEngine, OrchestrationEngine,
  SearchEngine, DoctrineEngine, PhoneSecurityEngine, MedicineManagementEngine, GoldEdgeIntegrationEngine
];

engines.forEach(Eng => registerEngine(Eng.name, new Eng()));

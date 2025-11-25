// src/core/agentManager.ts
import { db } from "../db/dbManager";
import { eventBus } from "./eventBus";
import { logger } from "../utils/logger";
import { replicateEdgeToShared } from "../db/replicationManager";

// --- Import all 63 agents ---
import { ARVAgent } from "../agents/ARVAgent";
import { AnalyticsAgent } from "../agents/AnalyticsAgent";
import { AntiTheftAgent } from "../agents/AntiTheftAgent";
import { AutoUpdateAgent } from "../agents/AutoUpdateAgent";
import { BillingAgent } from "../agents/BillingAgent";
import { CollaborationAgent } from "../agents/CollaborationAgent";
import { CorrectionAgent } from "../agents/CorrectionAgent";
import { ContentModerationAgent } from "../agents/ContentModerationAgent";
import { ConversationAgent } from "../agents/ConversationAgent";
import { CreativityAgent } from "../agents/CreativityAgent";
import { CriticAgent } from "../agents/CriticAgent";
import { DataIngestAgent } from "../agents/DataIngestAgent";
import { DataProcessingAgent } from "../agents/DataProcessingAgent";
import { DecisionAgent } from "../agents/DecisionAgent";
import { DeviceProtectionAgent } from "../agents/DeviceProtectionAgent";
import { DiscoveryAgent } from "../agents/DiscoveryAgent";
import { DistributedTaskAgent } from "../agents/DistributedTaskAgent";
import { DoctrineAgent } from "../agents/DoctrineAgent";
import { EdgeDeviceAgent } from "../agents/EdgeDeviceAgent";
import { EvolutionAgent } from "../agents/EvolutionAgent";
import { FeedbackAgent } from "../agents/FeedbackAgent";
import { FounderAgent } from "../agents/FounderAgent";
import { GPIAgent } from "../agents/GPIAgent";
import { GlobalMedAgent } from "../agents/GlobalMedAgent";
import { GoldEdgeIntegrationAgent } from "../agents/GoldEdgeIntegrationAgent";
import { HotReloadAgent } from "../agents/HotReloadAgent";
import { InspectionAgent } from "../agents/InspectionAgent";
import { LearningAgent } from "../agents/LearningAgent";
import { LocalStorageAgent } from "../agents/LocalStorageAgent";
import { MarketAssessmentAgent } from "../agents/MarketAssessmentAgent";
import { MetricsAgent } from "../agents/MetricsAgent";
import { MonitoringAgent } from "../agents/MonitoringAgent";
import { OfflineAgent } from "../agents/OfflineAgent";
import { OrchestrationAgent } from "../agents/OrchestrationAgent";
import { PersonalAgent } from "../agents/PersonalAgent";
import { PhoneSecurityAgent } from "../agents/PhoneSecurityAgent";
import { PlannerAgent } from "../agents/PlannerAgent";
import { PluginHelperAgent } from "../agents/PluginHelperAgent";
import { PluginManagerAgent } from "../agents/PluginManagerAgent";
import { PredictiveAgent } from "../agents/PredictiveAgent";
import { RecommendationAgent } from "../agents/RecommendationAgent";
import { ReinforcementAgent } from "../agents/ReinforcementAgent";
import { ResearchAgent } from "../agents/ResearchAgent";
import { SchedulingAgent } from "../agents/SchedulingAgent";
import { SchedulerAgent } from "../agents/SchedulerAgent";
import { SearchAgent } from "../agents/SearchAgent";
import { SecurityClearanceAgent } from "../agents/SecurityClearanceAgent";
import { SecurityAgent } from "../agents/SecurityAgent";
import { SelfHealingAgent } from "../agents/SelfHealingAgent";
import { SelfImprovementAgent } from "../agents/SelfImprovementAgent";
import { SelfProtectionAgent } from "../agents/SelfProtectionAgent";
import { SimulationAgent } from "../agents/SimulationAgent";
import { SummarizationAgent } from "../agents/SummarizationAgent";
import { SupervisorAgent } from "../agents/SupervisorAgent";
import { TelemetryAgent } from "../agents/TelemetryAgent";
import { TranslationAgent } from "../agents/TranslationAgent";
import { ValidationAgent } from "../agents/ValidationAgent";
import { VerifierAgent } from "../agents/VerifierAgent";
import { WorkerAgent } from "../agents/WorkerAgent";

// -----------------------------
export const agentManager: Record<string, any> = {};
const doctrine = new DoctrineAgent();
(globalThis as any).__NE_AGENT_MANAGER = agentManager;

// -----------------------------
export function registerAgent(name: string, agentInstance: any) {
  agentManager[name] = new Proxy(agentInstance, {
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

            // DB integration + eventBus
            if (result?.collection && result?.id) {
              await db.set(result.collection, result.id, result, "edge");
              eventBus.publish("db:update", {
                collection: result.collection,
                key: result.id,
                value: result,
                source: name,
              });
              logger.log(`[AgentManager] DB updated by ${name}.${String(prop)} → ${result.collection}:${result.id}`);
            }

            return result;
          } catch (err) {
            if (typeof target.recover === "function") await target.recover(err);
            return { error: "Recovered from failure" };
          }
        };
      }
      return origMethod;
    },
  });

  // Subscribe agent to DB events
  eventBus.subscribe("db:update", async (data: any) => {
    await agentManager[name]?.handleDBUpdate?.(data);
  });
  eventBus.subscribe("db:delete", async (data: any) => {
    await agentManager[name]?.handleDBDelete?.(data);
  });
}

// -----------------------------
// Register all agents
[
  ARVAgent,
  AnalyticsAgent,
  AntiTheftAgent,
  AutoUpdateAgent,
  BillingAgent,
  CollaborationAgent,
  CorrectionAgent,
  ContentModerationAgent,
  ConversationAgent,
  CreativityAgent,
  CriticAgent,
  DataIngestAgent,
  DataProcessingAgent,
  DecisionAgent,
  DeviceProtectionAgent,
  DiscoveryAgent,
  DistributedTaskAgent,
  EdgeDeviceAgent,
  EvolutionAgent,
  FeedbackAgent,
  FounderAgent,
  GPIAgent,
  GlobalMedAgent,
  GoldEdgeIntegrationAgent,
  HotReloadAgent,
  InspectionAgent,
  LearningAgent,
  LocalStorageAgent,
  MarketAssessmentAgent,
  MetricsAgent,
  MonitoringAgent,
  OfflineAgent,
  OrchestrationAgent,
  PersonalAgent,
  PhoneSecurityAgent,
  PlannerAgent,
  PluginHelperAgent,
  PluginManagerAgent,
  PredictiveAgent,
  RecommendationAgent,
  ReinforcementAgent,
  ResearchAgent,
  SchedulingAgent,
  SchedulerAgent,
  SearchAgent,
  SecurityClearanceAgent,
  SecurityAgent,
  SelfHealingAgent,
  SelfImprovementAgent,
  SelfProtectionAgent,
  SimulationAgent,
  SummarizationAgent,
  SupervisorAgent,
  TelemetryAgent,
  TranslationAgent,
  ValidationAgent,
  VerifierAgent,
  WorkerAgent,
].forEach((AgentClass) => registerAgent(AgentClass.name, new AgentClass()));

// DoctrineAgent also registered
registerAgent("DoctrineAgent", doctrine);

// -----------------------------
// Optional manual replication helpers
export async function replicateAllEdgeToShared() {
  return replicateEdgeToShared();
}

export async function replicateCollectionToShared(collection: string) {
  return replicateEdgeToShared(collection);
    }

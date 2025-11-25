// src/core/agentManager.ts
/**
 * NeuroEdge Agent Manager
 * ----------------------
 * Central registry for all agents
 * Provides:
 *  - Doctrine enforcement
 *  - Self-healing
 *  - DB integration
 *  - Event bus notifications
 *  - Global reference for easy access
 */

import { DoctrineAgent } from "../agents/DoctrineAgent";
import { db } from "../db/dbManager";
import { eventBus } from "./eventBus";
import { logger } from "../utils/logger";

// Import all agents (63+)
import { ARVAgent } from "../agents/ARVAgent";
import { AgentBase } from "../agents/AgentBase";
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
import { EdgeDeviceAgent } from "../agents/EdgeDeviceAgent";
import { EvolutionAgent } from "../agents/EvolutionAgent";
import { FeedbackAgent } from "../agents/FeedbackAgent";
import { FounderAgent } from "../agents/FounderAgent";
import { GPUAgent } from "../agents/GPUAgent";
import { GlobalMeshAgent } from "../agents/GlobalMeshAgent";
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
// Agent Manager
// -----------------------------
export const agentManager: Record<string, any> = {};
const doctrine = new DoctrineAgent();

// Global reference
(globalThis as any).__NE_AGENT_MANAGER = agentManager;

// -----------------------------
// Agent registration with Doctrine & self-healing
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

            // --- DB integration ---
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
// EventBus subscription helper
// -----------------------------
export async function subscribeToDBEvents(agentName: string) {
  const agent = agentManager[agentName];
  if (!agent) return;

  eventBus.subscribe("db:update", async (event) => {
    if (typeof agent.handleDBUpdate === "function") {
      await agent.handleDBUpdate(event);
    }
  });

  eventBus.subscribe("db:delete", async (event) => {
    if (typeof agent.handleDBDelete === "function") {
      await agent.handleDBDelete(event);
    }
  });
}

// -----------------------------
// Register all 63 agents
// -----------------------------
registerAgent("ARVAgent", new ARVAgent());
registerAgent("AgentBase", new AgentBase());
registerAgent("AnalyticsAgent", new AnalyticsAgent());
registerAgent("AntiTheftAgent", new AntiTheftAgent());
registerAgent("AutoUpdateAgent", new AutoUpdateAgent());
registerAgent("BillingAgent", new BillingAgent());
registerAgent("CollaborationAgent", new CollaborationAgent());
registerAgent("CorrectionAgent", new CorrectionAgent());
registerAgent("ContentModerationAgent", new ContentModerationAgent());
registerAgent("ConversationAgent", new ConversationAgent());
registerAgent("CreativityAgent", new CreativityAgent());
registerAgent("CriticAgent", new CriticAgent());
registerAgent("DataIngestAgent", new DataIngestAgent());
registerAgent("DataProcessingAgent", new DataProcessingAgent());
registerAgent("DecisionAgent", new DecisionAgent());
registerAgent("DeviceProtectionAgent", new DeviceProtectionAgent());
registerAgent("DiscoveryAgent", new DiscoveryAgent());
registerAgent("DistributedTaskAgent", new DistributedTaskAgent());
registerAgent("EdgeDeviceAgent", new EdgeDeviceAgent());
registerAgent("EvolutionAgent", new EvolutionAgent());
registerAgent("FeedbackAgent", new FeedbackAgent());
registerAgent("FounderAgent", new FounderAgent());
registerAgent("GPUAgent", new GPUAgent());
registerAgent("GlobalMeshAgent", new GlobalMeshAgent());
registerAgent("GoldEdgeIntegrationAgent", new GoldEdgeIntegrationAgent());
registerAgent("HotReloadAgent", new HotReloadAgent());
registerAgent("InspectionAgent", new InspectionAgent());
registerAgent("LearningAgent", new LearningAgent());
registerAgent("LocalStorageAgent", new LocalStorageAgent());
registerAgent("MarketAssessmentAgent", new MarketAssessmentAgent());
registerAgent("MetricsAgent", new MetricsAgent());
registerAgent("MonitoringAgent", new MonitoringAgent());
registerAgent("OfflineAgent", new OfflineAgent());
registerAgent("OrchestrationAgent", new OrchestrationAgent());
registerAgent("PersonalAgent", new PersonalAgent());
registerAgent("PhoneSecurityAgent", new PhoneSecurityAgent());
registerAgent("PlannerAgent", new PlannerAgent());
registerAgent("PluginHelperAgent", new PluginHelperAgent());
registerAgent("PluginManagerAgent", new PluginManagerAgent());
registerAgent("PredictiveAgent", new PredictiveAgent());
registerAgent("RecommendationAgent", new RecommendationAgent());
registerAgent("ReinforcementAgent", new ReinforcementAgent());
registerAgent("ResearchAgent", new ResearchAgent());
registerAgent("SchedulingAgent", new SchedulingAgent());
registerAgent("SchedulerAgent", new SchedulerAgent());
registerAgent("SearchAgent", new SearchAgent());
registerAgent("SecurityClearanceAgent", new SecurityClearanceAgent());
registerAgent("SecurityAgent", new SecurityAgent());
registerAgent("SelfHealingAgent", new SelfHealingAgent());
registerAgent("SelfImprovementAgent", new SelfImprovementAgent());
registerAgent("SelfProtectionAgent", new SelfProtectionAgent());
registerAgent("SimulationAgent", new SimulationAgent());
registerAgent("SummarizationAgent", new SummarizationAgent());
registerAgent("SupervisorAgent", new SupervisorAgent());
registerAgent("TelemetryAgent", new TelemetryAgent());
registerAgent("TranslationAgent", new TranslationAgent());
registerAgent("ValidationAgent", new ValidationAgent());
registerAgent("VerifierAgent", new VerifierAgent());
registerAgent("WorkerAgent", new WorkerAgent());

// -----------------------------
// Subscribe all agents to DB events
// -----------------------------
Object.keys(agentManager).forEach(subscribeToDBEvents);

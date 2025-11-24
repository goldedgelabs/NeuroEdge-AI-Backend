// src/core/agentManager.ts
import { eventBus } from "./engineManager";
import { logger } from "../utils/logger";
import { DoctrineAgent } from "../agents/DoctrineAgent";

// Import all 56 agents
import { PlannerAgent } from "../agents/PlannerAgent";
import { CriticAgent } from "../agents/CriticAgent";
import { WorkerAgent } from "../agents/WorkerAgent";
import { VerifierAgent } from "../agents/VerifierAgent";
import { SupervisorAgent } from "../agents/SupervisorAgent";
import { SelfHealingAgent } from "../agents/SelfHealingAgent";
import { PredictiveAgent } from "../agents/PredictiveAgent";
import { AnalyticsAgent } from "../agents/AnalyticsAgent";
import { MemoryAgent } from "../agents/MemoryAgent";
import { TranslatorAgent } from "../agents/TranslatorAgent";
import { ConversationAgent } from "../agents/ConversationAgent";
import { MonitoringAgent } from "../agents/MonitoringAgent";
import { SchedulingAgent } from "../agents/SchedulingAgent";
import { RecommendationAgent } from "../agents/RecommendationAgent";
import { OrchestrationAgent } from "../agents/OrchestrationAgent";
import { CreativityAgent } from "../agents/CreativityAgent";
import { SecurityAgent } from "../agents/SecurityAgent";
import { VisionAgent } from "../agents/VisionAgent";
import { VoiceAgent } from "../agents/VoiceAgent";
import { ReinforcementAgent } from "../agents/ReinforcementAgent";
import { DoctrineAgent } from "../agents/DoctrineAgent";
import { PersonaAgent } from "../agents/PersonaAgent";
import { ARVAgent } from "../agents/ARVAgent";
import { SelfImprovementAgent } from "../agents/SelfImprovementAgent";
import { DataIngestAgent } from "../agents/DataIngestAgent";
import { SummarizationAgent } from "../agents/SummarizationAgent";
import { SearchAgent } from "../agents/SearchAgent";
import { OrchestratorAgent } from "../agents/OrchestratorAgent";
import { SchedulerAgent } from "../agents/SchedulerAgent";
import { PlannerHelperAgent } from "../agents/PlannerHelperAgent";
import { MetricsAgent } from "../agents/MetricsAgent";
import { TelemetryAgent } from "../agents/TelemetryAgent";
import { FileHandlerAgent } from "../agents/FileHandlerAgent";
import { BillingAgent } from "../agents/BillingAgent";
import { FounderAgent } from "../agents/FounderAgent";
import { PluginAgent } from "../agents/PluginAgent";
import { GPUAgent } from "../agents/GPUAgent";
import { OfflineAgent } from "../agents/OfflineAgent";
import { AutoUpdateAgent } from "../agents/AutoUpdateAgent";
import { HotReloadAgent } from "../agents/HotReloadAgent";
import { SecurityCheckAgent } from "../agents/SecurityCheckAgent";
import { DistributedTaskAgent } from "../agents/DistributedTaskAgent";
import { PluginManagerAgent } from "../agents/PluginManagerAgent";
import { LocalStorageAgent } from "../agents/LocalStorageAgent";
import { EdgeDeviceAgent } from "../agents/EdgeDeviceAgent";
import { CollaborationAgent } from "../agents/CollaborationAgent";
import { ResearchAgent } from "../agents/ResearchAgent";
import { SimulationAgent } from "../agents/SimulationAgent";
import { FeedbackAgent } from "../agents/FeedbackAgent";
import { EvolutionAgent } from "../agents/EvolutionAgent";
import { LearningAgent } from "../agents/LearningAgent";
import { GlobalMeshAgent } from "../agents/GlobalMeshAgent";
import { PhoneSecurityAgent } from "../agents/PhoneSecurityAgent";
import { MedicineManagementAgent } from "../agents/MedicineManagementAgent";
import { GoldEdgeIntegrationAgent } from "../agents/GoldEdgeIntegrationAgent";
import { SelfProtectionAgent } from "../agents/SelfProtectionAgent";

export const agentManager: Record<string, any> = {};
const doctrine = new DoctrineAgent();
(globalThis as any).__NE_AGENT_MANAGER = agentManager;

export function registerAgent(name: string, agentInstance: any) {
  agentManager[name] = new Proxy(agentInstance, {
    get(target: any, prop: string) {
      const origMethod = target[prop];
      if (typeof origMethod === "function") {
        return async (...args: any[]) => {
          const action = `${name}.${String(prop)}`;
          const folderArg = args[0]?.folder || "";
          const userRole = args[0]?.role || "user";

          let doctrineResult = { success: true };
          if (doctrine && typeof doctrine.enforceAction === "function") {
            doctrineResult = await doctrine.enforceAction(action, folderArg, userRole);
          }
          if (!doctrineResult.success) {
            logger.warn(`[Doctrine] Action blocked: ${action}`);
            return { blocked: true, message: doctrineResult.message };
          }

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
    },
  });

  // Subscribe agent to DB events automatically
  if (typeof agentInstance.handleDBUpdate === "function") {
    eventBus.subscribe("db:update", agentInstance.handleDBUpdate.bind(agentInstance));
  }
  if (typeof agentInstance.handleDBDelete === "function") {
    eventBus.subscribe("db:delete", agentInstance.handleDBDelete.bind(agentInstance));
  }
}

// Register all 56 agents
const agents = [
  PlannerAgent, CriticAgent, WorkerAgent, VerifierAgent, SupervisorAgent,
  SelfHealingAgent, PredictiveAgent, AnalyticsAgent, MemoryAgent, TranslatorAgent,
  ConversationAgent, MonitoringAgent, SchedulingAgent, RecommendationAgent,
  OrchestrationAgent, CreativityAgent, SecurityAgent, VisionAgent, VoiceAgent,
  ReinforcementAgent, DoctrineAgent, PersonaAgent, ARVAgent, SelfImprovementAgent,
  DataIngestAgent, SummarizationAgent, SearchAgent, OrchestratorAgent, SchedulerAgent,
  PlannerHelperAgent, MetricsAgent, TelemetryAgent, FileHandlerAgent, BillingAgent,
  FounderAgent, PluginAgent, GPUAgent, OfflineAgent, AutoUpdateAgent, HotReloadAgent,
  SecurityCheckAgent, DistributedTaskAgent, PluginManagerAgent, LocalStorageAgent,
  EdgeDeviceAgent, CollaborationAgent, ResearchAgent, SimulationAgent, FeedbackAgent,
  EvolutionAgent, LearningAgent, GlobalMeshAgent, PhoneSecurityAgent, MedicineManagementAgent,
  GoldEdgeIntegrationAgent, SelfProtectionAgent
];

agents.forEach(A => registerAgent(A.name, new A()));

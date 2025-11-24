/**
 * NeuroEdge Agent Manager
 * -----------------------
 * Central registry for all agents
 * Features:
 *  - Doctrine enforcement
 *  - Self-healing
 *  - Inter-agent and engine-agent communication
 */

import { DoctrineAgent } from "../agents/DoctrineAgent";

// --- Import all 56 agents ---
import {
  PlannerAgent,
  CriticAgent,
  WorkerAgent,
  VerifierAgent,
  SupervisorAgent,
  SelfHealingAgent,
  PredictiveAgent,
  AnalyticsAgent,
  MemoryAgent,
  TranslatorAgent,
  ConversationAgent,
  MonitoringAgent,
  SchedulingAgent,
  RecommendationAgent,
  OrchestrationAgent,
  CreativityAgent,
  SecurityAgent,
  VisionAgent,
  VoiceAgent,
  ReinforcementAgent,
  DoctrineAgent as _DoctrineAgent,
  PersonaAgent,
  ARVAgent,
  SelfImprovementAgent,
  DataIngestAgent,
  SummarizationAgent,
  SearchAgent,
  OrchestratorAgent,
  SchedulerAgent,
  PlannerHelperAgent,
  MetricsAgent,
  TelemetryAgent,
  FileHandlerAgent,
  BillingAgent,
  FounderAgent,
  PluginAgent,
  GPUAgent,
  OfflineAgent,
  AutoUpdateAgent,
  HotReloadAgent,
  SecurityCheckAgent,
  DistributedTaskAgent,
  PluginManagerAgent,
  LocalStorageAgent,
  EdgeDeviceAgent,
  CollaborationAgent,
  ResearchAgent,
  SimulationAgent,
  FeedbackAgent,
  EvolutionAgent,
  LearningAgent,
  GlobalMeshAgent,
  PhoneSecurityAgent,
  MedicineManagementAgent,
  GoldEdgeIntegrationAgent,
  SelfProtectionAgent
} from "../agents";

export const agentManager: Record<string, any> = {};
const doctrine = new DoctrineAgent();

// Global reference
(globalThis as any).__NE_AGENT_MANAGER = agentManager;

// --- Register Agents with Doctrine enforcement & self-healing ---
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
            console.warn(`[Doctrine] Action blocked: ${action}`);
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
    }
  });
}

// --- Register all 56 agents ---
registerAgent("PlannerAgent", new PlannerAgent());
registerAgent("CriticAgent", new CriticAgent());
registerAgent("WorkerAgent", new WorkerAgent());
registerAgent("VerifierAgent", new VerifierAgent());
registerAgent("SupervisorAgent", new SupervisorAgent());
registerAgent("SelfHealingAgent", new SelfHealingAgent());
registerAgent("PredictiveAgent", new PredictiveAgent());
registerAgent("AnalyticsAgent", new AnalyticsAgent());
registerAgent("MemoryAgent", new MemoryAgent());
registerAgent("TranslatorAgent", new TranslatorAgent());
registerAgent("ConversationAgent", new ConversationAgent());
registerAgent("MonitoringAgent", new MonitoringAgent());
registerAgent("SchedulingAgent", new SchedulingAgent());
registerAgent("RecommendationAgent", new RecommendationAgent());
registerAgent("OrchestrationAgent", new OrchestrationAgent());
registerAgent("CreativityAgent", new CreativityAgent());
registerAgent("SecurityAgent", new SecurityAgent());
registerAgent("VisionAgent", new VisionAgent());
registerAgent("VoiceAgent", new VoiceAgent());
registerAgent("ReinforcementAgent", new ReinforcementAgent());
registerAgent("DoctrineAgent", doctrine);
registerAgent("PersonaAgent", new PersonaAgent());
registerAgent("ARVAgent", new ARVAgent());
registerAgent("SelfImprovementAgent", new SelfImprovementAgent());
registerAgent("DataIngestAgent", new DataIngestAgent());
registerAgent("SummarizationAgent", new SummarizationAgent());
registerAgent("SearchAgent", new SearchAgent());
registerAgent("OrchestratorAgent", new OrchestratorAgent());
registerAgent("SchedulerAgent", new SchedulerAgent());
registerAgent("PlannerHelperAgent", new PlannerHelperAgent());
registerAgent("MetricsAgent", new MetricsAgent());
registerAgent("TelemetryAgent", new TelemetryAgent());
registerAgent("FileHandlerAgent", new FileHandlerAgent());
registerAgent("BillingAgent", new BillingAgent());
registerAgent("FounderAgent", new FounderAgent());
registerAgent("PluginAgent", new PluginAgent());
registerAgent("GPUAgent", new GPUAgent());
registerAgent("OfflineAgent", new OfflineAgent());
registerAgent("AutoUpdateAgent", new AutoUpdateAgent());
registerAgent("HotReloadAgent", new HotReloadAgent());
registerAgent("SecurityCheckAgent", new SecurityCheckAgent());
registerAgent("DistributedTaskAgent", new DistributedTaskAgent());
registerAgent("PluginManagerAgent", new PluginManagerAgent());
registerAgent("LocalStorageAgent", new LocalStorageAgent());
registerAgent("EdgeDeviceAgent", new EdgeDeviceAgent());
registerAgent("CollaborationAgent", new CollaborationAgent());
registerAgent("ResearchAgent", new ResearchAgent());
registerAgent("SimulationAgent", new SimulationAgent());
registerAgent("FeedbackAgent", new FeedbackAgent());
registerAgent("EvolutionAgent", new EvolutionAgent());
registerAgent("LearningAgent", new LearningAgent());
registerAgent("GlobalMeshAgent", new GlobalMeshAgent());
registerAgent("PhoneSecurityAgent", new PhoneSecurityAgent());
registerAgent("MedicineManagementAgent", new MedicineManagementAgent());
registerAgent("GoldEdgeIntegrationAgent", new GoldEdgeIntegrationAgent());
registerAgent("SelfProtectionAgent", new SelfProtectionAgent());

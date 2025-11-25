// src/core/neuroEdgeManager.ts
/**
 * NeuroEdge Central Manager
 * ------------------------
 * - Registers all engines (42+) and agents (63+)
 * - Doctrine-aware enforcement
 * - Self-healing for both engines and agents
 * - Event bus for inter-engine/agent communication
 * - Global references to avoid circular imports
 */

import { DoctrineEngine } from "../engines/DoctrineEngine/index";
import { DoctrineAgent } from "../agents/DoctrineAgent";

// ================== Engines ==================
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

// ================== Agents ==================
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

// ================== Managers ==================
export const engineManager: Record<string, any> = {};
export const agentManager: Record<string, any> = {};
const doctrineEngine = new DoctrineEngine();
const doctrineAgent = new DoctrineAgent();

// Global refs
(globalThis as any).__NE_ENGINE_MANAGER = engineManager;
(globalThis as any).__NE_AGENT_MANAGER = agentManager;

// ================== Generic register functions ==================
function register(name: string, instance: any, manager: Record<string, any>, doctrine: any) {
  manager[name] = new Proxy(instance, {
    get(target: any, prop: string) {
      const orig = target[prop];
      if (typeof orig === "function") {
        return async (...args: any[]) => {
          // Doctrine enforcement
          let result = { success: true };
          if (doctrine && typeof doctrine.enforceAction === "function") {
            result = await doctrine.enforceAction(`${name}.${String(prop)}`, args[0]?.folder || "", args[0]?.role || "user");
          }
          if (!result.success) {
            console.warn(`[Doctrine] Action blocked: ${name}.${String(prop)}`);
            return { blocked: true, message: result.message };
          }

          try {
            return await orig.apply(target, args);
          } catch (err) {
            if (typeof target.recover === "function") await target.recover(err);
            return { error: "Recovered from failure" };
          }
        };
      }
      return orig;
    }
  });
}

// ================== Register Engines ==================
[
  SelfImprovementEngine, PredictiveEngine, CodeEngine, VoiceEngine, VisionEngine,
  ReinforcementEngine, DataIngestEngine, AnalyticsEngine, PlannerEngine, MemoryEngine,
  ConversationEngine, SchedulingEngine, RecommendationEngine, SecurityEngine, MonitoringEngine,
  TranslationEngine, SummarizationEngine, PersonaEngine, CreativityEngine, OrchestrationEngine,
  SearchEngine, doctrineEngine
].forEach(E => register(E.name, new E(), engineManager, doctrineEngine));

// ================== Register Agents ==================
[
  ARVAgent, AnalyticsAgent, AntiTheftAgent, AutoUpdateAgent, BillingAgent, CollaborationAgent,
  CorrectionAgent, ContentModerationAgent, ConversationAgent, CreativityAgent, CriticAgent,
  DataIngestAgent, DataProcessingAgent, DecisionAgent, DeviceProtectionAgent, DiscoveryAgent,
  DistributedTaskAgent, EdgeDeviceAgent, EvolutionAgent, FeedbackAgent, FounderAgent,
  GPIAgent, GlobalMedAgent, GoldEdgeIntegrationAgent, HotReloadAgent, InspectionAgent,
  LearningAgent, LocalStorageAgent, MarketAssessmentAgent, MetricsAgent, MonitoringAgent,
  OfflineAgent, OrchestrationAgent, PersonalAgent, PhoneSecurityAgent, PlannerAgent,
  PluginHelperAgent, PluginManagerAgent, PredictiveAgent, RecommendationAgent,
  ReinforcementAgent, ResearchAgent, SchedulingAgent, SchedulerAgent, SearchAgent,
  SecurityClearanceAgent, SecurityAgent, SelfHealingAgent, SelfImprovementAgent,
  SelfProtectionAgent, SimulationAgent, SummarizationAgent, SupervisorAgent, TelemetryAgent,
  TranslationAgent, ValidationAgent, VerifierAgent, WorkerAgent, doctrineAgent
].forEach(A => register(A.name, new A(), agentManager, doctrineAgent));

// ================== Event Bus ==================
export const eventBus: Record<string, Function[]> = {};
export function subscribe(channel: string, callback: Function) {
  if (!eventBus[channel]) eventBus[channel] = [];
  eventBus[channel].push(callback);
}
export function publish(channel: string, data: any) {
  (eventBus[channel] || []).forEach(cb => cb(data));
}

// ================== runEngineChain helper ==================
export async function runEngineChain(chain: { engine: string; input?: any }[]) {
  let last: any = null;
  for (const step of chain) {
    const e = engineManager[step.engine];
    if (!e) throw new Error(`Engine not registered: ${step.engine}`);
    last = typeof e.run === "function" ? await e.run(step.input ?? last) : null;
  }
  return last;
}

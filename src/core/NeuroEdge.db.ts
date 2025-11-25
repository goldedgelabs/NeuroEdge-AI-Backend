/**
 * NeuroEdge DB Bootstrap
 * -----------------------
 * 1. Registers all engines & agents
 * 2. Integrates LocalDB + DistributedDB + Replicator
 * 3. Wires db:update/db:delete events
 * 4. Offline-first & edge-ready
 * 5. Ready for future engine/agent additions
 */

import { engineManager, registerEngine } from "./engineManager";
import { agentManager, registerAgent } from "./agentManager";
import { db, localDB, distributedDB, replicator } from "../db/dbManager";
import { eventBus } from "./engineManager";
import { logger } from "../utils/logger";

// -----------------------------
// 1. Import all engines (42)
// -----------------------------
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
import { ARVEngine } from "../engines/ARVEngine";
import { MedicineManagementEngine } from "../engines/MedicineManagementEngine";
import { GoldEdgeIntegrationEngine } from "../engines/GoldEdgeIntegrationEngine";
import { GamingCreativeEngine } from "../engines/GamingCreativeEngine";
import { HealthEngine } from "../engines/HealthEngine";
import { MarketEngine } from "../engines/MarketEngine";
import { MultiModalEngine } from "../engines/MultiModalEngine";
import { PhoneSecurityEngine } from "../engines/PhoneSecurityEngine";
import { DeviceProtectionEngine } from "../engines/DeviceProtectionEngine";
import { PolicyEngine } from "../engines/PolicyEngine";
import { RealTimeRecommenderEngine } from "../engines/RealTimeRecommenderEngine";
import { ReasoningEngine } from "../engines/ReasoningEngine";
import { ResearchAnalyticsEngine } from "../engines/ResearchAnalyticsEngine";
import { ResearchEngine } from "../engines/ResearchEngine";
import { SimulationEngine } from "../engines/SimulationEngine";
import { SelfImprovementEngine as SIEngine } from "../engines/SelfImprovementEngine";
import { VisionEngine as VEngine } from "../engines/VisionEngine";

// -----------------------------
// 2. Import all agents (63)
// -----------------------------
import {
  ARVAgent, AgentBase, AnalyticsAgent, AntiTheftAgent, AutoUpdateAgent,
  BillingAgent, CollaborationAgent, CorrectionAgent, ContentModerationAgent,
  ConversationAgent, CreativityAgent, CriticAgent, DataIngestAgent, DataProcessingAgent,
  DecisionAgent, DeviceProtectionAgent, DiscoveryAgent, DistributedTaskAgent,
  DoctrineAgent, EdgeDeviceAgent, EvolutionAgent, FeedbackAgent, FounderAgent,
  GPIAgent, GlobalMedAgent, GoldEdgeIntegrationAgent, HotReloadAgent, InspectionAgent,
  LearningAgent, LocalStorageAgent, MarketAssessmentAgent, MetricsAgent,
  MonitoringAgent, OfflineAgent, OrchestrationAgent, PersonalAgent, PhoneSecurityAgent,
  PlannerAgent, PluginHelperAgent, PluginManagerAgent, PredictiveAgent,
  RecommendationAgent, ReinforcementAgent, ResearchAgent, SchedulingAgent,
  SchedulerAgent, SearchAgent, SecurityClearanceAgent, SecurityAgent, SelfHealingAgent,
  SelfImprovementAgent, SelfProtectionAgent, SimulationAgent, SummarizationAgent,
  SupervisorAgent, TelemetryAgent, TranslationAgent, ValidationAgent,
  VerifierAgent, WorkerAgent
} from "../agents";

// -----------------------------
// 3. Register engines
// -----------------------------
const allEngines = [
  SelfImprovementEngine, PredictiveEngine, CodeEngine, VoiceEngine, VisionEngine,
  ReinforcementEngine, DataIngestEngine, AnalyticsEngine, PlannerEngine, MemoryEngine,
  ConversationEngine, SchedulingEngine, RecommendationEngine, SecurityEngine, MonitoringEngine,
  TranslationEngine, SummarizationEngine, PersonaEngine, CreativityEngine, OrchestrationEngine,
  SearchEngine, DoctrineEngine, ARVEngine, MedicineManagementEngine, GoldEdgeIntegrationEngine,
  GamingCreativeEngine, HealthEngine, MarketEngine, MultiModalEngine, PhoneSecurityEngine,
  DeviceProtectionEngine, PolicyEngine, RealTimeRecommenderEngine, ReasoningEngine,
  ResearchAnalyticsEngine, ResearchEngine, SimulationEngine, SIEngine, VEngine
];

allEngines.forEach(E => registerEngine(E.name, new E()));
logger.log(`[DB Bootstrap] Registered ${allEngines.length} engines`);

// -----------------------------
// 4. Register agents
// -----------------------------
const allAgents = [
  ARVAgent, AgentBase, AnalyticsAgent, AntiTheftAgent, AutoUpdateAgent,
  BillingAgent, CollaborationAgent, CorrectionAgent, ContentModerationAgent,
  ConversationAgent, CreativityAgent, CriticAgent, DataIngestAgent, DataProcessingAgent,
  DecisionAgent, DeviceProtectionAgent, DiscoveryAgent, DistributedTaskAgent,
  DoctrineAgent, EdgeDeviceAgent, EvolutionAgent, FeedbackAgent, FounderAgent,
  GPIAgent, GlobalMedAgent, GoldEdgeIntegrationAgent, HotReloadAgent, InspectionAgent,
  LearningAgent, LocalStorageAgent, MarketAssessmentAgent, MetricsAgent,
  MonitoringAgent, OfflineAgent, OrchestrationAgent, PersonalAgent, PhoneSecurityAgent,
  PlannerAgent, PluginHelperAgent, PluginManagerAgent, PredictiveAgent,
  RecommendationAgent, ReinforcementAgent, ResearchAgent, SchedulingAgent,
  SchedulerAgent, SearchAgent, SecurityClearanceAgent, SecurityAgent, SelfHealingAgent,
  SelfImprovementAgent, SelfProtectionAgent, SimulationAgent, SummarizationAgent,
  SupervisorAgent, TelemetryAgent, TranslationAgent, ValidationAgent,
  VerifierAgent, WorkerAgent
];

allAgents.forEach(A => registerAgent(A.name, new A()));
logger.log(`[DB Bootstrap] Registered ${allAgents.length} agents`);

// -----------------------------
// 5. DB Event Subscriptions
// -----------------------------
eventBus.subscribe("db:update", async (data) => {
  logger.log(`[DB Event] update → ${data.collection}:${data.key}`);
});
eventBus.subscribe("db:delete", async (data) => {
  logger.log(`[DB Event] delete → ${data.collection}:${data.key}`);
});

// -----------------------------
// 6. Replication + offline-first
// -----------------------------
(async () => {
  const collections = ["medicine", "analytics", "logs", "predictions", "user", "security"];
  await db.replicateAll(collections);
  logger.log("[DB Bootstrap] Initial replication complete");
})();

logger.log("[DB Bootstrap] NeuroEdge DB fully wired ✅");

export { db, localDB, distributedDB, replicator };

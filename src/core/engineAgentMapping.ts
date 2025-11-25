// src/core/engineAgentMapping.ts
import { engineManager } from "./engineManager";
import { agentManager } from "./agentManager";
import { eventBus } from "./eventBus";
import { logger } from "../utils/logger";

// -----------------------------
// Engine → Agent Mapping Table
// Expandable for future engines and agents
// -----------------------------
const engineAgentMap: Record<string, string[]> = {
  HealthEngine: ["MedicineManagementAgent", "MonitoringAgent"],
  VisionEngine: ["SecurityAgent", "AnalyticsAgent"],
  VoiceEngine: ["ConversationAgent", "AnalyticsAgent"],
  PredictiveEngine: ["RecommendationAgent", "SchedulingAgent"],
  PlannerEngine: ["PlannerHelperAgent", "OrchestrationAgent"],
  SecurityEngine: ["SecurityCheckAgent", "PhoneSecurityAgent"],
  ReinforcementEngine: ["SelfImprovementAgent", "LearningAgent"],
  DataIngestEngine: ["MemoryAgent", "AnalyticsAgent"],
  AnalyticsEngine: ["MetricsAgent", "TelemetryAgent"],
  CreativityEngine: ["ContentModerationAgent", "CorrectionAgent"],
  OrchestrationEngine: ["SchedulerAgent", "PluginManagerAgent"],
  DoctrineEngine: ["InspectionAgent"],
  SummarizationEngine: ["AnalyticsAgent", "ResearchAgent"],
  TranslationEngine: ["ConversationAgent", "PersonaAgent"],
  MemoryEngine: ["AnalyticsAgent", "SelfImprovementAgent"],
  ConversationEngine: ["PersonaAgent", "RecommendationAgent"],
  MonitoringEngine: ["SelfProtectionAgent", "SecurityCheckAgent"],
  GoldEdgeIntegrationEngine: ["GoldEdgeIntegrationAgent", "PluginHelperAgent"],
  SelfImprovementEngine: ["LearningAgent", "SelfHealingAgent"],
  // Add remaining engines here...
};

// -----------------------------
// Subscribe to engine outputs
// -----------------------------
eventBus.subscribe("engine:output", async (payload) => {
  const { engine, output } = payload;
  const agentsToTrigger = engineAgentMap[engine] || [];

  for (const agentName of agentsToTrigger) {
    const agent = agentManager[agentName];
    if (agent?.handleEngineOutput) {
      try {
        await agent.handleEngineOutput(output);
        logger.log(`[Mapping] Engine ${engine} triggered ${agentName}`);
      } catch (err) {
        logger.error(`[Mapping] Failed to trigger ${agentName} from ${engine}:`, err);
      }
    }
  }
});

// -----------------------------
// Helper: Add new engine → agent dynamically
// -----------------------------
export function addEngineAgentMapping(engine: string, agent: string) {
  if (!engineAgentMap[engine]) engineAgentMap[engine] = [];
  if (!engineAgentMap[engine].includes(agent)) engineAgentMap[engine].push(agent);
  logger.log(`[Mapping] Added mapping ${engine} → ${agent}`);
}

// -----------------------------
// Global reference for future expansion
// -----------------------------
(globalThis as any).__NE_ENGINE_AGENT_MAPPING = {
  engineAgentMap,
  addEngineAgentMapping,
};

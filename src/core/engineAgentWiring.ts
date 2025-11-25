// src/core/engineAgentWiring.ts

import { engineManager } from "./engineManager";
import { agentManager } from "./agentManager";
import { eventBus } from "./engineManager";
import { logger } from "../utils/logger";

// Define a mapping of engines → agents they trigger
const engineAgentMap: Record<string, string[]> = {
  // Core mappings (expand for all 42 engines)
  SelfImprovementEngine: ["SelfImprovementAgent", "LearningAgent"],
  PredictiveEngine: ["PredictiveAgent", "AnalyticsAgent"],
  CodeEngine: ["PluginAgent", "PluginManagerAgent"],
  VoiceEngine: ["VoiceAgent", "ConversationAgent"],
  VisionEngine: ["VisionAgent", "MonitoringAgent"],
  ReinforcementEngine: ["ReinforcementAgent", "LearningAgent"],
  DataIngestEngine: ["DataIngestAgent", "MetricsAgent"],
  AnalyticsEngine: ["AnalyticsAgent", "MetricsAgent", "ResearchAgent"],
  PlannerEngine: ["PlannerAgent", "PlannerHelperAgent"],
  MemoryEngine: ["MemoryAgent", "TelemetryAgent"],
  ConversationEngine: ["ConversationAgent", "PersonaAgent"],
  SchedulingEngine: ["SchedulingAgent", "SchedulerAgent"],
  RecommendationEngine: ["RecommendationAgent", "RealTimeRecomenderAgent"],
  SecurityEngine: ["SecurityAgent", "SecurityCheckAgent", "SecurityClearanceAgent"],
  MonitoringEngine: ["MonitoringAgent", "TelemetryAgent"],
  TranslationEngine: ["TranslationAgent", "ConversationAgent"],
  SummarizationEngine: ["SummarizationAgent", "SearchAgent"],
  PersonaEngine: ["PersonaAgent", "ConversationAgent"],
  CreativityEngine: ["CreativityAgent", "ResearchAgent"],
  OrchestrationEngine: ["OrchestrationAgent", "PlannerAgent", "SchedulerAgent"],
  SearchEngine: ["SearchAgent", "SummarizationAgent"],
  DoctrineEngine: ["DoctrineAgent"],

  // Additional new engines
  PhoneSecurityEngine: ["PhoneSecurityAgent", "AntiTheftAgent"],
  GoldEdgeIntegrationEngine: ["GoldEdgeIntegrationAgent", "PluginAgent"],
  MedicineManagementEngine: ["MedicineManagementAgent", "TelemetryAgent"],
  HealthEngine: ["MedicineManagementAgent", "SelfProtectionAgent"],
  DeviceProtectionEngine: ["SelfProtectionAgent", "InspectionAgent"],
  MarketEngine: ["MarketAssessmentAgent", "ResearchAgent"],
  MultiModalEngine: ["VisionAgent", "VoiceAgent", "ConversationAgent"],
  GamingCreativeEngine: ["CreativityAgent", "SimulationAgent"],
  PolicyEngine: ["SecurityClearanceAgent", "DoctrineAgent"],
  RealTimeRecomenderEngine: ["RecommendationAgent", "MetricsAgent"],
  ReasoningEngine: ["SelfImprovementAgent", "PredictiveAgent"],
  ResearchAnalyticsEngine: ["AnalyticsAgent", "ResearchAgent"],
  ResearchEngine: ["ResearchAgent", "CollaborationAgent"],
  SimulationEngine: ["SimulationAgent", "EvolutionAgent"],
};

// Wire all engines to trigger their agents on `.run()` automatically
export function wireEnginesToAgents() {
  Object.entries(engineAgentMap).forEach(([engineName, agents]) => {
    const engine = engineManager[engineName];
    if (!engine) {
      logger.warn(`[EngineAgentWiring] Engine not found: ${engineName}`);
      return;
    }

    const originalRun = engine.run?.bind(engine);
    if (!originalRun) return;

    engine.run = async function(input: any) {
      const output = await originalRun(input);

      // Notify all mapped agents
      for (const agentName of agents) {
        const agent = agentManager[agentName];
        if (agent && typeof agent.run === "function") {
          try {
            await agent.run(output);
            logger.log(`[EngineAgentWiring] ${engineName} triggered ${agentName}`);
          } catch (err) {
            logger.error(`[EngineAgentWiring] Failed to trigger ${agentName}:`, err);
          }
        }
      }

      // Publish event to eventBus for further listeners
      eventBus.publish("engine:run", { engine: engineName, input, output });
      return output;
    };
  });
}

// Auto-run wiring if imported
wireEnginesToAgents();
logger.log("[EngineAgentWiring] All engines wired to their respective agents.");

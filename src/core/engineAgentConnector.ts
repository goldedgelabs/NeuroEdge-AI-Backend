// src/core/engineAgentConnector.ts
/**
 * NeuroEdge Engine ↔ Agent Connector
 * ----------------------------------
 * Central wiring of engines and agents
 * - Uses global engineManager & agentManager
 * - Doctrine enforcement is applied automatically
 * - Self-healing triggers if agent fails
 * - EventBus handles all inter-communication
 */

import { engineManager, eventBus } from "./engineManager";
import { agentManager } from "./agentManager";

// -----------------------------
// Helper: wire single engine → multiple agents
// -----------------------------
function wireEngineToAgent(engineName: string, agentNames: string[], methodName: string = "run") {
  eventBus.subscribe(`engine:${engineName}`, async (payload: any) => {
    for (const agentName of agentNames) {
      const agent = agentManager[agentName];
      if (!agent) continue;

      if (typeof agent[methodName] === "function") {
        try {
          await agent[methodName](payload);
        } catch (err) {
          if (typeof agent.recover === "function") {
            await agent.recover(err);
          } else {
            console.error(`[Connector] Agent ${agentName} failed:`, err);
          }
        }
      }
    }
  });
}

// -----------------------------
// Engine → Agent Wiring Map
// -----------------------------
const wiringMap: Record<string, string[]> = {
  SelfImprovementEngine: ["SelfImprovementAgent", "EvolutionAgent", "LearningAgent"],
  PredictiveEngine: ["PredictiveAgent", "AnalyticsAgent", "MetricsAgent"],
  CodeEngine: ["WorkerAgent", "CriticAgent", "OrchestratorAgent"],
  VoiceEngine: ["VoiceAgent", "ConversationAgent"],
  VisionEngine: ["VisionAgent", "CreativityAgent"],
  ReinforcementEngine: ["ReinforcementAgent", "AnalyticsAgent"],
  DataIngestEngine: ["DataIngestAgent", "MemoryAgent"],
  AnalyticsEngine: ["AnalyticsAgent", "MetricsAgent", "TelemetryAgent"],
  PlannerEngine: ["PlannerAgent", "PlannerHelperAgent", "SupervisorAgent"],
  MemoryEngine: ["MemoryAgent", "ConversationAgent"],
  ConversationEngine: ["ConversationAgent", "PersonaAgent"],
  SchedulingEngine: ["SchedulerAgent", "PlannerAgent"],
  RecommendationEngine: ["RecommendationAgent", "PersonaAgent"],
  SecurityEngine: ["SecurityAgent", "SecurityCheckAgent", "SelfProtectionAgent"],
  MonitoringEngine: ["MonitoringAgent", "TelemetryAgent"],
  TranslationEngine: ["TranslatorAgent", "ConversationAgent"],
  SummarizationEngine: ["SummarizationAgent", "ConversationAgent"],
  PersonaEngine: ["PersonaAgent", "ConversationAgent"],
  CreativityEngine: ["CreativityAgent", "OrchestrationAgent"],
  OrchestrationEngine: ["OrchestrationAgent", "PluginManagerAgent", "AutoUpdateAgent"],
  SearchEngine: ["SearchAgent", "AnalyticsAgent"],
  DoctrineEngine: ["DoctrineAgent"],
  ARVEngine: ["ARVAgent", "CreativityAgent"],
  SelfHealingEngine: ["SelfHealingAgent", "SupervisorAgent"],
  MedicineEngine: ["MedicineManagementAgent", "DataIngestAgent"],
  PhoneSecurityEngine: ["PhoneSecurityAgent", "SelfProtectionAgent"],
  GoldEdgeIntegrationEngine: ["GoldEdgeIntegrationAgent", "PluginManagerAgent"],
};

// -----------------------------
// Auto-wire all engines → agents
// -----------------------------
for (const [engineName, agentList] of Object.entries(wiringMap)) {
  wireEngineToAgent(engineName, agentList);
}

console.log("[Connector] Engine → Agent wiring complete");

// -----------------------------
// Optional: trigger engine events manually
// -----------------------------
export async function triggerEngine(engineName: string, payload: any) {
  const engine = engineManager[engineName];
  if (!engine) throw new Error(`Engine not found: ${engineName}`);

  if (typeof engine.run === "function") {
    const result = await engine.run(payload);
    eventBus.publish(`engine:${engineName}`, result);
    return result;
  } else {
    eventBus.publish(`engine:${engineName}`, payload);
    return payload;
  }
}

// -----------------------------
// Example Usage
// -----------------------------
// triggerEngine("PredictiveEngine", { userId: "1234", data: {...} });

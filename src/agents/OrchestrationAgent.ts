// src/agents/OrchestrationAgent.ts
import { engineManager } from "../core/engineManager";
import { logger } from "../utils/logger";

export class OrchestrationAgent {
  name = "OrchestrationAgent";

  constructor() {
    logger.log(`${this.name} initialized`);
  }

  /**
   * Coordinate multiple engines to complete a complex task
   * @param tasks Array of engine-task objects
   */
  async coordinate(tasks: { engine: string; input: any }[]) {
    const runChainInput = tasks.map(task => ({
      engine: task.engine,
      input: task.input,
    }));

    try {
      const result = await engineManager["OrchestrationEngine"].run({
        action: "coordinate",
        payload: runChainInput,
      });
      logger.info(`[${this.name}] Orchestration completed`);
      return result;
    } catch (err) {
      logger.error(`[${this.name}] Orchestration failed:`, err);
      return { error: "Failed to orchestrate tasks", details: err };
    }
  }

  /**
   * Execute a predefined workflow
   * @param workflowName Name of the workflow
   * @param data Input data for the workflow
   */
  async executeWorkflow(workflowName: string, data: any) {
    try {
      const result = await engineManager["OrchestrationEngine"].run({
        action: "executeWorkflow",
        payload: { workflowName, data },
      });
      logger.info(`[${this.name}] Workflow ${workflowName} executed`);
      return result;
    } catch (err) {
      logger.error(`[${this.name}] Workflow execution failed:`, err);
      return { error: "Workflow execution failed", details: err };
    }
  }
}

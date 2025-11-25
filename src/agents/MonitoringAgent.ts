import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

/**
 * MonitoringAgent
 * ----------------
 * Monitors system status, engine health, agent activity, and performance metrics.
 */
export class MonitoringAgent extends AgentBase {
    constructor() {
        super("MonitoringAgent");
        this.subscribeToEvents();
    }

    /**
     * Subscribe to important system events
     */
    private subscribeToEvents() {
        eventBus.subscribe("engine:status", (event) => this.handleEngineStatus(event));
        eventBus.subscribe("agent:status", (event) => this.handleAgentStatus(event));
    }

    /**
     * Handle engine status updates
     */
    async handleEngineStatus(event: any) {
        const { engineName, status } = event;
        console.log(`[MonitoringAgent] Engine ${engineName} status: ${status}`);
    }

    /**
     * Handle agent status updates
     */
    async handleAgentStatus(event: any) {
        const { agentName, status } = event;
        console.log(`[MonitoringAgent] Agent ${agentName} status: ${status}`);
    }

    /**
     * Default run method
     */
    async run(input: any) {
        console.log(`[MonitoringAgent] Run called with input:`, input);
        return { success: true };
    }

    /**
     * Recover from errors
     */
    async recover(err: any) {
        console.warn(`[MonitoringAgent] Recovering from error`, err);
    }

    /**
     * Send a system alert
     */
    async sendAlert(message: string) {
        console.warn(`[MonitoringAgent] ALERT:`, message);
        return { success: true };
    }
}

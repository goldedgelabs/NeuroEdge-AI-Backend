import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

/**
 * MetricsAgent
 * ------------
 * Collects, processes, and stores system and application metrics.
 */
export class MetricsAgent extends AgentBase {
    private metricsStore: Record<string, number> = {};

    constructor() {
        super("MetricsAgent");
        this.subscribeToDBEvents();
    }

    /**
     * Subscribe to database or system events
     */
    private subscribeToDBEvents() {
        eventBus.subscribe("db:update", (event) => this.handleDBUpdate(event));
        eventBus.subscribe("db:delete", (event) => this.handleDBDelete(event));
    }

    /**
     * Handle database updates
     */
    async handleDBUpdate(event: any) {
        const { collection, key, value } = event;
        if (collection !== "metrics") return;
        this.metricsStore[key] = value;
        console.log(`[MetricsAgent] Metric updated: ${key}`, value);
    }

    /**
     * Handle database deletion
     */
    async handleDBDelete(event: any) {
        const { collection, key } = event;
        if (collection !== "metrics") return;
        delete this.metricsStore[key];
        console.log(`[MetricsAgent] Metric deleted: ${key}`);
    }

    /**
     * Set a metric
     */
    async setMetric(key: string, value: number) {
        this.metricsStore[key] = value;
        eventBus.publish("db:update", { collection: "metrics", key, value });
        console.log(`[MetricsAgent] Metric saved: ${key}`);
        return { success: true };
    }

    /**
     * Get a metric
     */
    async getMetric(key: string) {
        return this.metricsStore[key] || 0;
    }

    /**
     * Remove a metric
     */
    async removeMetric(key: string) {
        delete this.metricsStore[key];
        eventBus.publish("db:delete", { collection: "metrics", key });
        console.log(`[MetricsAgent] Metric removed: ${key}`);
        return { success: true };
    }

    /**
     * Default run method
     */
    async run(input: any) {
        console.log(`[MetricsAgent] Run called with input:`, input);
        return { success: true };
    }

    /**
     * Recover from errors
     */
    async recover(err: any) {
        console.warn(`[MetricsAgent] Recovering from error`, err);
    }
}

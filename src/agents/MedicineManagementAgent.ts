import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

/**
 * MedicineManagementAgent
 * ---------------------
 * Handles medicine subscriptions, updates, and coordination
 * with HealthEngine or other medicine-related engines.
 */
export class MedicineManagementAgent extends AgentBase {
    private medicines: Record<string, any> = {};

    constructor() {
        super("MedicineManagementAgent");
        this.subscribeToDBEvents();
    }

    /**
     * Listen to DB events for medicine updates
     */
    private subscribeToDBEvents() {
        eventBus.subscribe("db:update", (event) => this.handleDBUpdate(event));
        eventBus.subscribe("db:delete", (event) => this.handleDBDelete(event));
    }

    /**
     * Handle medicine update
     */
    async handleDBUpdate(event: any) {
        const { collection, key, value } = event;
        if (collection !== "medicine") return;
        this.medicines[key] = value;
        console.log(`[MedicineManagementAgent] Medicine updated: ${key}`, value);
        // Could trigger notifications or engine calls
    }

    /**
     * Handle medicine deletion
     */
    async handleDBDelete(event: any) {
        const { collection, key } = event;
        if (collection !== "medicine") return;
        delete this.medicines[key];
        console.log(`[MedicineManagementAgent] Medicine deleted: ${key}`);
    }

    /**
     * Add or update medicine
     */
    async setMedicine(med: { id: string; name: string; dosage: string; manufacturer: string }) {
        this.medicines[med.id] = med;
        eventBus.publish("db:update", { collection: "medicine", key: med.id, value: med });
        console.log(`[MedicineManagementAgent] Medicine saved: ${med.name}`);
        return { success: true };
    }

    /**
     * Retrieve medicine
     */
    async getMedicine(id: string) {
        return this.medicines[id] || null;
    }

    /**
     * Remove medicine
     */
    async removeMedicine(id: string) {
        delete this.medicines[id];
        eventBus.publish("db:delete", { collection: "medicine", key: id });
        console.log(`[MedicineManagementAgent] Medicine removed: ${id}`);
        return { success: true };
    }

    /**
     * General run method
     */
    async run(input: any) {
        console.log(`[MedicineManagementAgent

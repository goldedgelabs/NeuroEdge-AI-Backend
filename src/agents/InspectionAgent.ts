import { AgentBase } from "./AgentBase";
import { engineManager, registerEngine, eventBus } from "../core/engineManager";
import { agentManager, registerAgent } from "../core/agentManager";
import { db } from "../db/dbManager";
import * as fs from "fs";
import * as path from "path";

/**
 * InspectionAgent
 * ----------------
 * Automatically inspects the entire NeuroEdge system:
 * - Engines folder
 * - Agents folder
 * - DB entries
 * - Event bus channels
 * Registers/unregisters dynamically
 * Detects new engines/agents and ensures everything is up-to-date.
 */
export class InspectionAgent extends AgentBase {
    constructor() {
        super("InspectionAgent");
    }

    /**
     * Scan a folder recursively for engines or agents
     */
    private scanFolder(folderPath: string): string[] {
        const items: string[] = [];
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);
            if (entry.isDirectory()) {
                items.push(...this.scanFolder(fullPath));
            } else if (entry.isFile() && entry.name.endsWith(".ts")) {
                items.push(fullPath);
            }
        }
        return items;
    }

    /**
     * Register all engines dynamically
     */
    async inspectEngines() {
        const enginePath = path.resolve(__dirname, "../engines");
        const engineFiles = this.scanFolder(enginePath);
        for (const file of engineFiles) {
            const engineName = path.basename(file, ".ts");
            if (!(engineName in engineManager)) {
                try {
                    const EngineClass = (await import(file))[engineName];
                    if (EngineClass) {
                        registerEngine(engineName, new EngineClass());
                        console.log(`[InspectionAgent] Registered new engine: ${engineName}`);
                    }
                } catch (err) {
                    console.error(`[InspectionAgent] Failed to register engine ${engineName}:`, err);
                }
            }
        }
    }

    /**
     * Register all agents dynamically
     */
    async inspectAgents() {
        const agentPath = path.resolve(__dirname);
        const agentFiles = this.scanFolder(agentPath);
        for (const file of agentFiles) {
            const agentName = path.basename(file, ".ts");
            if (!(agentName in agentManager) && agentName !== "AgentBase") {
                try {
                    const AgentClass = (await import(file))[agentName];
                    if (AgentClass) {
                        registerAgent(agentName, new AgentClass());
                        console.log(`[InspectionAgent] Registered new agent: ${agentName}`);
                    }
                } catch (err) {
                    console.error(`[InspectionAgent] Failed to register agent ${agentName}:`, err);
                }
            }
        }
    }

    /**
     * Scan DB collections and report status
     */
    async inspectDB() {
        const collections = await db.listCollections();
        console.log(`[InspectionAgent] DB Collections:`, collections);
    }

    /**
     * Scan event bus channels
     */
    async inspectEventBus() {
        const channels = Object.keys(eventBus);
        console.log(`[InspectionAgent] EventBus Channels:`, channels);
    }

    /**
     * Main inspection routine
     */
    async run(input?: any) {
        console.log(`[InspectionAgent] Starting system inspection...`);

        await this.inspectEngines();
        await this.inspectAgents();
        await this.inspectDB();
        await this.inspectEventBus();

        console.log(`[InspectionAgent] Inspection complete.`);
        return { success: true };
    }

    /**
     * Recover from errors
     */
    async recover(err: any) {
        console.error(`[InspectionAgent] Recovering from error`, err);
    }
}

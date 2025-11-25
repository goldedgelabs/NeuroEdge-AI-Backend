import { AgentBase } from "./AgentBase";
import { engineManager, registerEngine, eventBus } from "../core/engineManager";
import { agentManager, registerAgent } from "../core/agentManager";
import { db } from "../db/dbManager";
import * as fs from "fs";
import * as path from "path";

/**
 * InspectionAgent
 * ----------------
 * Continuously inspects and watches the system:
 * - Engines folder
 * - Agents folder
 * - DB collections
 * - EventBus channels
 * Auto-registers new engines/agents and handles updates/removals.
 */
export class InspectionAgent extends AgentBase {
    private enginesPath: string;
    private agentsPath: string;

    constructor() {
        super("InspectionAgent");
        this.enginesPath = path.resolve(__dirname, "../engines");
        this.agentsPath = path.resolve(__dirname);

        // Start real-time watchers
        this.watchFolder(this.enginesPath, "engine");
        this.watchFolder(this.agentsPath, "agent");
    }

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

    async inspectEngines() {
        const engineFiles = this.scanFolder(this.enginesPath);
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

    async inspectAgents() {
        const agentFiles = this.scanFolder(this.agentsPath);
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

    async inspectDB() {
        const collections = await db.listCollections();
        console.log(`[InspectionAgent] DB Collections:`, collections);
    }

    async inspectEventBus() {
        const channels = Object.keys(eventBus);
        console.log(`[InspectionAgent] EventBus Channels:`, channels);
    }

    private watchFolder(folderPath: string, type: "engine" | "agent") {
        fs.watch(folderPath, { recursive: true }, async (eventType, filename) => {
            if (!filename.endsWith(".ts")) return;

            const fullPath = path.join(folderPath, filename);
            const name = path.basename(filename, ".ts");

            if (eventType === "rename") {
                // File added or removed
                if (fs.existsSync(fullPath)) {
                    // Added
                    try {
                        const ModuleClass = (await import(fullPath))[name];
                        if (ModuleClass) {
                            if (type === "engine") registerEngine(name, new ModuleClass());
                            else registerAgent(name, new ModuleClass());
                            console.log(`[InspectionAgent] Auto-registered new ${type}: ${name}`);
                        }
                    } catch (err) {
                        console.error(`[InspectionAgent] Failed to auto-register ${type} ${name}:`, err);
                    }
                } else {
                    // Removed
                    if (type === "engine" && engineManager[name]) {
                        delete engineManager[name];
                        console.log(`[InspectionAgent] Engine removed: ${name}`);
                    } else if (type === "agent" && agentManager[name]) {
                        delete agentManager[name];
                        console.log(`[InspectionAgent] Agent removed: ${name}`);
                    }
                }
            } else if (eventType === "change") {
                // File changed → reload
                try {
                    delete require.cache[require.resolve(fullPath)];
                    const ModuleClass = (await import(fullPath))[name];
                    if (ModuleClass) {
                        if (type === "engine") registerEngine(name, new ModuleClass());
                        else registerAgent(name, new ModuleClass());
                        console.log(`[InspectionAgent] Reloaded ${type}: ${name}`);
                    }
                } catch (err) {
                    console.error(`[InspectionAgent] Failed to reload ${type} ${name}:`, err);
                }
            }
        });

        console.log(`[InspectionAgent] Watching ${type} folder: ${folderPath}`);
    }

    async run(input?: any) {
        console.log(`[InspectionAgent] Starting inspection...`);
        await this.inspectEngines();
        await this.inspectAgents();
        await this.inspectDB();
        await this.inspectEventBus();
        console.log(`[InspectionAgent] Inspection complete.`);
        return { success: true };
    }

    async recover(err: any) {
        console.error(`[InspectionAgent] Recovering from error`, err);
    }
}

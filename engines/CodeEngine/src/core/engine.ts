import { eventBus } from "./events";
import { connectMongo } from "../db/mongo";
import { connectRedis } from "../db/redis";
import { connectVectorDB } from "../db/vector";
import { JobWorker } from "../workers/job.worker";
import { SandboxWorker } from "../workers/sandbox.worker";
import Logger from "../utils/logger";

export class CodeEngine {
    async start() {
        Logger.info("🚀 Starting NeuroEdge Code Engine...");

        await this.initializeDatabases();
        await this.initializeWorkers();
        await this.initializeEvents();

        Logger.info("✅ Code Engine successfully started.");
    }

    private async initializeDatabases() {
        Logger.info("🔌 Connecting databases...");

        await connectMongo();
        await connectRedis();
        await connectVectorDB();

        Logger.info("🗄️ Databases ready.");
    }

    private async initializeWorkers() {
        Logger.info("⚙️ Starting workers...");

        JobWorker.init();
        SandboxWorker.init();

        Logger.info("👷 Workers online.");
    }

    private async initializeEvents() {
        Logger.info("🔔 Subscribing to engine events...");

        eventBus.onEvent("sandbox.output", (data) => {
            Logger.info("🧪 Sandbox Output Received:", data);
        });

        eventBus.onEvent("refactor.complete", (job) => {
            Logger.info("✨ Refactor Job Complete:", job.id);
        });

        Logger.info("📡 Event system ready.");
    }
}

export default new CodeEngine();

import { getRedis } from "../db/redis";
import { eventBus } from "../core/events";
import RefactorService from "../services/refactor.service";
import EmbeddingService from "../services/embeddings.service";
import Logger from "../utils/logger";

export class JobWorker {
    static async init() {
        const redis = getRedis();
        Logger.info("🛠️ Job Worker initialized.");

        while (true) {
            try {
                const job = await redis.brPop("code_jobs", 0);

                if (!job) continue;

                const parsed = JSON.parse(job.element);

                Logger.info(`📥 Received job: ${parsed.type}`);

                switch (parsed.type) {
                    case "refactor":
                        const result = await RefactorService.refactorCode(parsed.payload);
                        eventBus.emitEvent("refactor.complete", result);
                        break;

                    case "embed":
                        const embedding = await EmbeddingService.embedCode(parsed.payload);
                        eventBus.emitEvent("embedding.ready", embedding);
                        break;

                    default:
                        Logger.warn("⚠️ Unknown job type:", parsed.type);
                }

            } catch (err) {
                Logger.error("❌ Job Worker Error:", err);
            }
        }
    }
}

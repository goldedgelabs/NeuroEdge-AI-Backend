import { getRedis } from "../db/redis";
import { eventBus } from "../core/events";
import ExecutionService from "../services/execution.service";
import Logger from "../utils/logger";

export class SandboxWorker {
    static async init() {
        const redis = getRedis();
        Logger.info("🔒 Sandbox Worker initialized.");

        while (true) {
            try {
                const job = await redis.brPop("sandbox_jobs", 0);

                if (!job) continue;

                const parsed = JSON.parse(job.element);

                Logger.info(`🧪 Sandbox job: ${parsed.language}`);

                const result = await ExecutionService.runCode(parsed);

                eventBus.emitEvent("sandbox.output", result);

            } catch (err) {
                Logger.error("🔥 Sandbox Worker Error:", err);
            }
        }
    }
}

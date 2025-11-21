import { createClient } from "redis";
import Logger from "../utils/logger";

let redisClient: any;

export async function connectRedis() {
    const url = process.env.REDIS_URL || "redis://localhost:6379";

    redisClient = createClient({ url });

    redisClient.on("error", (err: any) => {
        Logger.error("🔴 Redis Error:", err);
    });

    await redisClient.connect();

    Logger.info("🟠 Redis connected (Cache + Queue + Rate Limit)");

    return redisClient;
}

export function getRedis() {
    return redisClient;
}

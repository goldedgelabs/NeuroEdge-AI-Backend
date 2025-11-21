import { Router } from "express";
import { randomUUID } from "crypto";
import { getRedis } from "../db/redis";

const router = Router();

router.post("/", async (req, res) => {
    const { code, language = "javascript" } = req.body;

    const jobId = randomUUID();

    const redis = getRedis();
    await redis.lPush(
        "code_jobs",
        JSON.stringify({ type: "refactor", payload: { id: jobId, code, language } })
    );

    return res.json({ jobId, message: "Refactor job queued." });
});

export default router;

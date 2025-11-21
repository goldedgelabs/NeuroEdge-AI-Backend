import { Router } from "express";
import { randomUUID } from "crypto";
import { getRedis } from "../db/redis";

const router = Router();

router.post("/", async (req, res) => {
    const { code } = req.body;

    const jobId = randomUUID();

    const redis = getRedis();
    await redis.lPush(
        "code_jobs",
        JSON.stringify({ type: "embed", payload: { id: jobId, code } })
    );

    return res.json({ jobId, message: "Embedding job queued." });
});

export default router;

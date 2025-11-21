import { Router } from "express";
import { getRedis } from "../db/redis";
import { randomUUID } from "crypto";

const router = Router();

router.post("/", async (req, res) => {
    const { code, language = "javascript" } = req.body;

    const jobId = randomUUID();

    const redis = getRedis();

    await redis.lPush(
        "sandbox_jobs",
        JSON.stringify({ id: jobId, code, language })
    );

    return res.json({
        jobId,
        message: "Code execution job queued."
    });
});

export default router;

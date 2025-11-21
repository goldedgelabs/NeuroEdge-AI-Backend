import { Router } from "express";
import { getRedis } from "../db/redis";

const router = Router();

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const redis = getRedis();
    const result = await redis.get(`job:${id}`);

    if (!result) {
        return res.json({ status: "pending" });
    }

    return res.json(JSON.parse(result));
});

export default router;

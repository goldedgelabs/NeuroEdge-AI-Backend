import { Router } from "express";
import { getVectorDB } from "../db/vector";
import axios from "axios";

const router = Router();

router.post("/", async (req, res) => {
    const { query } = req.body;

    const embed = await axios.post(
        process.env.LLM_GATEWAY_URL + "/v1/embeddings",
        { input: query }
    );

    const vector = embed.data.embedding;

    const client = getVectorDB();

    const results = await client.search("code_embeddings", {
        vector,
        limit: 10,
    });

    return res.json({ query, results });
});

export default router;

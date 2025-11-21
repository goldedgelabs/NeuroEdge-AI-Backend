import { getVectorDB } from "../db/vector";
import axios from "axios";
import Logger from "../utils/logger";

class EmbeddingService {
    async embedCode(payload: any) {
        const { id, code } = payload;

        Logger.info("🧬 Generating embeddings for code...");

        const embedding = await axios.post(
            process.env.LLM_GATEWAY_URL + "/v1/embeddings",
            { input: code }
        );

        const vector = embedding.data.embedding;

        const client = getVectorDB();

        await client.upsert("code_embeddings", {
            points: [
                {
                    id,
                    vector,
                    payload: { code },
                },
            ],
        });

        return { id, vector };
    }
}

export default new EmbeddingService();

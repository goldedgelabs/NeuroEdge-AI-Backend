import Logger from "../utils/logger";
import { QdrantClient } from "@qdrant/js-client-rest";

let vectorClient: any;

export async function connectVectorDB() {
    const provider = process.env.VECTOR_PROVIDER || "qdrant";

    if (provider === "qdrant") {
        vectorClient = new QdrantClient({
            url: process.env.QDRANT_URL || "http://localhost:6333",
        });

        Logger.info("🧠 Qdrant Vector DB connected.");
    }

    // Future: Pinecone, Milvus, Weaviate bindings

    return vectorClient;
}

export function getVectorDB() {
    return vectorClient;
}

import mongoose from "mongoose";
import Logger from "../utils/logger";

export async function connectMongo() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/neuroedge-code";

    try {
        await mongoose.connect(uri, {
            autoIndex: true,
        });

        Logger.info("🟢 MongoDB connected (NeuroEdge Code Engine)");
    } catch (err) {
        Logger.error("🔴 MongoDB connection failed:", err);
        process.exit(1);
    }
}

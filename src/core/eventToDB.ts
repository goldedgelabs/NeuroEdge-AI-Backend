import { eventBus } from "./engineManager"; // use your central eventBus
import { DB } from "./db"; // Your database module
import { logger } from "../utils/logger";

eventBus.on("engine:event", async (event: any) => {
  try {
    await DB.events.insert(event); // assume DB.events.insert handles persistence
    logger.info(`[EventToDB] Logged event from ${event.engineId || "unknown"}`);
  } catch (err) {
    logger.error(`[EventToDB] Failed to log event`, err);
  }
});

// Example engine emitting an event:
/*
eventBus.publish("engine:event", {
  engineId: "PredictiveEngine",
  type: "PREDICTION_COMPLETED",
  result: { score: 0.92 },
  timestamp: Date.now()
});
*/

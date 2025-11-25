// src/core/startup.ts
import { InspectionAgent } from "../agents/InspectionAgent";
import { logger } from "../utils/logger";

// Initialize InspectionAgent
const inspectionAgent = new InspectionAgent();

// Run a full scan on startup
(async () => {
  logger.log("[Startup] Running initial full scan of engines and agents...");
  await inspectionAgent.fullScan();

  // Optional: schedule periodic scans every 5 minutes (300000 ms)
  inspectionAgent.scheduleScan(300000);

  logger.log("[Startup] InspectionAgent initialized and periodic scans scheduled.");
})();

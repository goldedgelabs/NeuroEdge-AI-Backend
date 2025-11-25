import { db } from "../db/dbManager";
import { logger } from "../utils/logger";

export class PhoneSecurityAgent {
  name = "PhoneSecurityAgent";

  constructor() {
    logger.log(`[Agent Initialized] ${this.name}`);
  }

  async handleDBUpdate(event: any) {
    if (event.collection === "device_security") {
      logger.info(`[PhoneSecurityAgent] Device event:`, event.key);
    }
  }

  async addDeviceEvent(event: any) {
    await db.set("device_security", event.id, event, "edge");
    return event;
  }

  async recover(err: any) {
    logger.error(`[PhoneSecurityAgent] Recovered from error:`, err);
  }
}

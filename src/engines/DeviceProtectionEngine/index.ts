import { EngineBase } from "../EngineBase";
import { logger } from "../../utils/logger";

export class DeviceProtectionEngine extends EngineBase {
  constructor() {
    super();
    this.survivalCheck();
  }

  async survivalCheck() {
    logger.log("DeviceProtectionEngine active: monitoring device security...");
  }

  async run(input: any) {
    logger.log("DeviceProtectionEngine processing input:", input);
    // Trigger PhoneSecurityAgent / SelfProtectionAgent
    const agentManager = (globalThis as any).__NE_AGENT_MANAGER;
    if (agentManager?.PhoneSecurityAgent) {
      await agentManager.PhoneSecurityAgent.monitor(input);
    }
    if (agentManager?.SelfProtectionAgent) {
      await agentManager.SelfProtectionAgent.ensureInstalled(input);
    }
    return { status: "DeviceProtectionEngine completed task" };
  }

  async recover(err: any) {
    logger.error("DeviceProtectionEngine recovered from error:", err);
  }
}

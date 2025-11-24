// src/agents/AfyaLinkAgent.ts
import { logger } from "../utils/logger";
import { eventBus } from "../core/engineManager";

export class AfyaLinkAgent {
  name = "AfyaLinkAgent";
  medicines: Record<string, any> = {};
  subscriptions: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  addMedicine(medId: string, info: any) {
    this.medicines[medId] = info;
    logger.log(`[AfyaLinkAgent] Medicine added: ${medId}`, info);
    eventBus["afya:medicineAdded"]?.forEach(cb => cb({ medId, info }));
    return { success: true };
  }

  subscribePatient(patientId: string, plan: any) {
    this.subscriptions[patientId] = plan;
    logger.log(`[AfyaLinkAgent] Patient subscribed: ${patientId}`, plan);
    eventBus["afya:patientSubscribed"]?.forEach(cb => cb({ patientId, plan }));
    return { success: true };
  }

  listMedicines() {
    return this.medicines;
  }

  listSubscriptions() {
    return this.subscriptions;
  }
}

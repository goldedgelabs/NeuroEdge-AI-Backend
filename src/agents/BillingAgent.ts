import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/eventBus";
import { db } from "../db/dbManager";

export class BillingAgent extends AgentBase {
  constructor() {
    super({
      id: "billing-agent",
      name: "Billing Agent",
      description: "Handles billing, subscriptions, and payment processing within NeuroEdge.",
      type: "system"
    });
  }

  /**
   * Main handler for billing actions
   */
  async handle(payload: any): Promise<any> {
    const { action, data } = payload;

    switch (action) {
      case "create-subscription":
        return this.createSubscription(data);

      case "cancel-subscription":
        return this.cancelSubscription(data);

      case "process-payment":
        return this.processPayment(data);

      default:
        return { error: "Unknown action for BillingAgent" };
    }
  }

  /**
   * Create a subscription record
   */
  async createSubscription(subscription: any) {
    await db.set("subscriptions", subscription.id, subscription, "shared");
    eventBus.publish("billing:created", subscription);
    return { success: true, subscription };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscription: any) {
    await db.delete("subscriptions", subscription.id, "shared");
    eventBus.publish("billing:cancelled", subscription);
    return { success: true };
  }

  /**
   * Process a payment
   */
  async processPayment(payment: any) {
    await db.set("payments", payment.id, payment, "shared");
    eventBus.publish("billing:paid", payment);
    return { success: true, payment };
  }

  /**
   * Initialize agent subscriptions
   */
  async init() {
    eventBus.subscribe("billing:created", async (subscription) => {
      console.log(`[BillingAgent] Subscription created:`, subscription);
    });

    eventBus.subscribe("billing:paid", async (payment) => {
      console.log(`[BillingAgent] Payment processed:`, payment);
    });
  }
}

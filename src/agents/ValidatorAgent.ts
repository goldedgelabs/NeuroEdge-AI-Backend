import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

export class ValidatorAgent extends AgentBase {
  constructor() {
    super("ValidatorAgent");
  }

  /**
   * Validates input data according to rules or schemas.
   * Can be extended to support multiple validation types.
   */
  async run(input: { data: any; schema?: any }) {
    const { data, schema } = input || {};

    if (!data) {
      return { error: "ValidatorAgent requires a 'data' field." };
    }

    // Placeholder for actual validation logic
    let valid = true;
    let errors: string[] = [];

    if (schema) {
      // perform schema-based validation
      // This is a placeholder example
      if (typeof data !== schema.type) {
        valid = false;
        errors.push(`Expected type ${schema.type}, got ${typeof data}`);
      }
    }

    console.log(`[ValidatorAgent] Validation result for data:`, data, "Valid:", valid);

    // Publish validation event
    eventBus.publish("validation:completed", { data, valid, errors });

    return { success: true, valid, errors };
  }

  async recover(err: any) {
    console.error(`[ValidatorAgent] Error during validation:`, err);
  }
}

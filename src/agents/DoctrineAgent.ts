import { AgentBase } from "./AgentBase";

/**
 * DoctrineAgent
 * -------------
 * Central agent that enforces rules and policies
 * across NeuroEdge engines and agents.
 */
export class DoctrineAgent extends AgentBase {
    private rules: Record<string, any>;

    constructor() {
        super("DoctrineAgent");
        this.rules = {};
    }

    /**
     * Add or update a rule
     * @param action - The engine/agent action e.g., "HealthEngine.run"
     * @param rule - Rule object { allowedRoles: [], condition: fn }
     */
    addRule(action: string, rule: any) {
        this.rules[action] = rule;
    }

    /**
     * Enforce a rule for an action
     * @param action - Action being invoked
     * @param folder - Optional folder/context
     * @param role - Role of the requester
     */
    async enforceAction(action: string, folder: string = "", role: string = "user") {
        const rule = this.rules[action];
        if (!rule) return { success: true };

        // Check role
        if (rule.allowedRoles && !rule.allowedRoles.includes(role)) {
            return { success: false, message: "Role not allowed" };
        }

        // Check condition function
        if (rule.condition && !(await rule.condition(folder, role))) {
            return { success: false, message: "Condition failed" };
        }

        return { success: true };
    }

    /**
     * Remove a rule
     */
    removeRule(action: string) {
        delete this.rules[action];
    }
}

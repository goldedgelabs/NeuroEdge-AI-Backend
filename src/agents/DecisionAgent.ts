import { AgentBase } from "./AgentBase";
import { DecisionEngine } from "../engines/DecisionEngine";
import { ReasoningEngine } from "../engines/ReasoningEngine";
import { PolicyEngine } from "../engines/PolicyEngine";

export class DecisionAgent extends AgentBase {
    private decisionEngine: DecisionEngine;
    private reasoningEngine: ReasoningEngine;
    private policyEngine: PolicyEngine;

    constructor() {
        super("DecisionAgent");
        this.decisionEngine = new DecisionEngine();
        this.reasoningEngine = new ReasoningEngine();
        this.policyEngine = new PolicyEngine();
    }

    /**
     * Generates options based on available data.
     */
    async generateOptions(context: any): Promise<any[]> {
        return await this.reasoningEngine.generateOptions(context);
    }

    /**
     * Filters options using policy & safety constraints.
     */
    async applyPolicies(options: any[]): Promise<any[]> {
        return await this.policyEngine.filter(options);
    }

    /**
     * Selects the best option.
     */
    async decide(context: any): Promise<any> {
        const options = await this.generateOptions(context);
        const safeOptions = await this.applyPolicies(options);
        return await this.decisionEngine.chooseBest(safeOptions);
    }
}

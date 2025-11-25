import { AgentBase } from "./AgentBase";
import { CriticEngine } from "../engines/CriticEngine";

export class CriticAgent extends AgentBase {
    private criticEngine: CriticEngine;

    constructor() {
        super("CriticAgent");
        this.criticEngine = new CriticEngine();
    }

    /**
     * Provides structured critique, reviews, evaluations, or quality assessment
     * of content, ideas, decisions, or outputs.
     */
    async critique(input: string): Promise<string> {
        return await this.criticEngine.evaluate(input);
    }

    /**
     * Scores or rates the quality of any material.
     */
    async score(input: string): Promise<number> {
        return await this.criticEngine.score(input);
    }
}

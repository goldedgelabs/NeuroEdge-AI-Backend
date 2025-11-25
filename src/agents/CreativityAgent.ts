import { AgentBase } from "./AgentBase";
import { CreativeEngine } from "../engines/CreativeEngine";

export class CreativityAgent extends AgentBase {
    private creativeEngine: CreativeEngine;

    constructor() {
        super("CreativityAgent");
        this.creativeEngine = new CreativeEngine();
    }

    /**
     * Generates creative ideas, concepts, stories, designs, or any form of imaginative output.
     */
    async generateCreativeOutput(input: string): Promise<string> {
        return await this.creativeEngine.process(input);
    }

    /**
     * Enhances, expands, or transforms existing creative material.
     */
    async enhanceCreativeWork(work: string): Promise<string> {
        return await this.creativeEngine.enhance(work);
    }
}

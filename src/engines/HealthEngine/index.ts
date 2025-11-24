import { EngineBase } from "../EngineBase";
import { survivalCheck } from "./survival_check";

export class <EngineName> extends EngineBase {
  name = "<EngineName>";

  constructor() {
    super();
    survivalCheck();
  }

  async run(input: any) {
    // placeholder for main logic
    return { engine: this.name, input };
  }

  async recover(error: any) {
    console.warn(`[${this.name}] Recovered from error`, error);
    return { recovered: true };
  }

  async talkTo(engineName: string, method: string, payload: any) {
    const manager = (globalThis as any).__NE_ENGINE_MANAGER;
    if (manager && manager[engineName] && typeof manager[engineName][method] === "function") {
      return await manager[engineName][method](payload);
    }
    return null;
  }
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: string;
}

export abstract class AgentBase {
  id: string;
  name: string;
  description: string;
  type: string;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
  }

  /**
   * Every agent MUST implement a handle() method.
   */
  abstract handle(payload: any): Promise<any>;

  /**
   * Optional setup hook
   */
  async init(): Promise<void> {
    return;
  }

  /**
   * Optional cleanup hook
   */
  async shutdown(): Promise<void> {
    return;
  }

  /**
   * Base metadata returned by all agents
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
    };
  }
}

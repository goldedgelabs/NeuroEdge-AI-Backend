import { AgentBase } from "./AgentBase";
import { eventBus } from "../core/engineManager";

export class PluginManagerAgent extends AgentBase {
  private plugins: Record<string, any> = {};

  constructor() {
    super("PluginManagerAgent");
  }

  async run(input?: any) {
    console.log(`[PluginManagerAgent] Running with input:`, input);
    // Example: load or initialize plugins
    if (input?.action === "register" && input.pluginName && input.plugin) {
      this.registerPlugin(input.pluginName, input.plugin);
    } else if (input?.action === "unregister" && input.pluginName) {
      this.unregisterPlugin(input.pluginName);
    }

    return this.plugins;
  }

  async recover(err: any) {
    console.error(`[PluginManagerAgent] Recovering from error:`, err);
  }

  registerPlugin(name: string, plugin: any) {
    this.plugins[name] = plugin;
    console.log(`[PluginManagerAgent] Registered plugin: ${name}`);
    eventBus.publish("plugin:registered", { name, plugin });
  }

  unregisterPlugin(name: string) {
    delete this.plugins[name];
    console.log(`[PluginManagerAgent] Unregistered plugin: ${name}`);
    eventBus.publish("plugin:unregistered", { name });
  }
}

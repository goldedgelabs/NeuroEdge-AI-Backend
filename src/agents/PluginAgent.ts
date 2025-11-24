// src/agents/PluginAgent.ts
import { logger } from "../utils/logger";

export class PluginAgent {
  name = "PluginAgent";
  plugins: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Load a new plugin
  async loadPlugin(pluginName: string, plugin: any) {
    this.plugins[pluginName] = plugin;
    logger.log(`[PluginAgent] Plugin loaded: ${pluginName}`);
    return { success: true, pluginName };
  }

  // Execute a plugin method
  async executePlugin(pluginName: string, method: string, payload?: any) {
    const plugin = this.plugins[pluginName];
    if (!plugin || typeof plugin[method] !== "function") {
      logger.warn(`[PluginAgent] Plugin method not found: ${pluginName}.${method}`);
      return { success: false, error: "Plugin or method not found" };
    }
    logger.log(`[PluginAgent] Executing plugin: ${pluginName}.${method}`, payload);
    return plugin[method](payload);
  }

  // Remove a plugin
  async unloadPlugin(pluginName: string) {
    if (this.plugins[pluginName]) {
      delete this.plugins[pluginName];
      logger.log(`[PluginAgent] Plugin unloaded: ${pluginName}`);
      return { success: true, pluginName };
    }
    return { success: false, pluginName, message: "Plugin not found" };
  }

  // Recovery hook
  async recover(err: any) {
    logger.warn(`[PluginAgent] Recovering from error:`, err);
    return { recovered: true };
  }
}

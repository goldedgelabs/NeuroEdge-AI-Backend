// src/agents/PluginManagerAgent.ts
import { logger } from "../utils/logger";

export class PluginManagerAgent {
  name = "PluginManagerAgent";
  private plugins: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Register a new plugin
  registerPlugin(pluginName: string, pluginInstance: any) {
    if (this.plugins[pluginName]) {
      logger.warn(`[PluginManagerAgent] Plugin '${pluginName}' is already registered.`);
      return { success: false, message: "Plugin already registered" };
    }
    this.plugins[pluginName] = pluginInstance;
    logger.log(`[PluginManagerAgent] Plugin '${pluginName}' registered.`);
    return { success: true };
  }

  // Get a plugin instance
  getPlugin(pluginName: string) {
    return this.plugins[pluginName] || null;
  }

  // Execute a method of a plugin safely
  async runPlugin(pluginName: string, methodName: string, payload?: any) {
    const plugin = this.plugins[pluginName];
    if (!plugin) {
      logger.warn(`[PluginManagerAgent] Plugin '${pluginName}' not found.`);
      return { error: "Plugin not found" };
    }
    const method = plugin[methodName];
    if (typeof method !== "function") {
      logger.warn(`[PluginManagerAgent] Method '${methodName}' not found on plugin '${pluginName}'.`);
      return { error: "Method not found" };
    }

    try {
      return await method(payload);
    } catch (err) {
      logger.error(`[PluginManagerAgent] Plugin '${pluginName}' method '${methodName}' failed:`, err);
      return { error: err };
    }
  }

  async listPlugins() {
    return Object.keys(this.plugins);
  }
}

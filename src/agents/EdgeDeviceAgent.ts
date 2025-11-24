// src/agents/EdgeDeviceAgent.ts
import { logger } from "../utils/logger";

export class EdgeDeviceAgent {
  name = "EdgeDeviceAgent";
  private connectedDevices: Record<string, any> = {};

  constructor() {
    logger.info(`${this.name} initialized`);
  }

  // Register a new edge device
  registerDevice(deviceId: string, metadata: any) {
    if (this.connectedDevices[deviceId]) {
      logger.warn(`[EdgeDeviceAgent] Device '${deviceId}' already registered.`);
      return { success: false, message: "Device already registered" };
    }
    this.connectedDevices[deviceId] = metadata;
    logger.log(`[EdgeDeviceAgent] Device '${deviceId}' registered.`);
    return { success: true };
  }

  // Remove a device
  removeDevice(deviceId: string) {
    if (this.connectedDevices[deviceId]) {
      delete this.connectedDevices[deviceId];
      logger.log(`[EdgeDeviceAgent] Device '${deviceId}' removed.`);
      return { success: true };
    }
    return { success: false, message: "Device not found" };
  }

  // List all connected devices
  listDevices() {
    return Object.keys(this.connectedDevices).map(id => ({
      id,
      metadata: this.connectedDevices[id],
    }));
  }

  // Send a task to a device (placeholder)
  sendTask(deviceId: string, task: any) {
    if (!this.connectedDevices[deviceId]) {
      logger.warn(`[EdgeDeviceAgent] Device '${deviceId}' not found.`);
      return { success: false, message: "Device not found" };
    }
    logger.log(`[EdgeDeviceAgent] Task sent to device '${deviceId}':`, task);
    // Integrate with task routing system later
    return { success: true };
  }
}

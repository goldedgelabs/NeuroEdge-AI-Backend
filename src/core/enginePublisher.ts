// src/core/enginePublisher.ts
/**
 * NeuroEdge Engine Publisher
 * --------------------------
 * Automatically publishes engine.run() outputs to all connected agents.
 * Ensures Doctrine rules and self-healing are applied.
 */

import { engineManager, eventBus } from "./engineManager";

export function enableAutoPublish(engineName: string, methods: string[] = ["run"]) {
  const engine = engineManager[engineName];
  if (!engine) throw new Error(`Engine not registered: ${engineName}`);

  methods.forEach((methodName) => {
    const origMethod = engine[methodName];
    if (typeof origMethod === "function") {
      engine[methodName] = async function (...args: any[]) {
        const result = await origMethod.apply(this, args);

        // Publish result automatically to agents subscribed to this engine
        const channel = `${engineName}:${methodName}`;
        eventBus.publish(channel, result);

        return result;
      };
    }
  });
}

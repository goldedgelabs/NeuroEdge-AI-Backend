/**
 * NeuroEdge DB Manager
 * -------------------
 * Provides edge and shared storage with event notifications
 */

export const db: Record<string, any> = {
  edge: new Map<string, Map<string, any>>(),
  shared: new Map<string, Map<string, any>>()
};

import { eventBus } from "../core/engineManager";

export async function set(collection: string, key: string, value: any, target: "edge" | "shared" = "edge") {
  if (!db[target].has(collection)) db[target].set(collection, new Map());
  db[target].get(collection)!.set(key, value);

  // Publish DB update event
  eventBus.publish("db:update", { collection, key, value, target });
}

export async function get(collection: string, key: string, target: "edge" | "shared" = "edge") {
  return db[target].get(collection)?.get(key) ?? null;
}

export async function deleteRecord(collection: string, key: string, target: "edge" | "shared" = "edge") {
  db[target].get(collection)?.delete(key);

  // Publish DB delete event
  eventBus.publish("db:delete", { collection, key, target });
}

export async function getAll(collection: string, target: "edge" | "shared" = "edge") {
  return Array.from(db[target].get(collection)?.values() ?? []);
}

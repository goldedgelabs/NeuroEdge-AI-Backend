// src/db/dbManager.ts
import fs from "fs";
import path from "path";
import { agentManager } from "../core/agentManager";
import { engineManager } from "../core/engineManager";
import { eventBus } from "../core/engineManager";
import { DoctrineAgent } from "../agents/DoctrineAgent";

// Paths
const EDGE_PATH = path.join(__dirname, "edge");
const SHARED_PATH = path.join(__dirname, "shared");

// Ensure directories exist
if (!fs.existsSync(EDGE_PATH)) fs.mkdirSync(EDGE_PATH, { recursive: true });
if (!fs.existsSync(SHARED_PATH)) fs.mkdirSync(SHARED_PATH, { recursive: true });

// Doctrine enforcement
const doctrine = new DoctrineAgent();

// Helper: read JSON file
function readFile(location: "edge" | "shared", collection: string) {
  const base = location === "edge" ? EDGE_PATH : SHARED_PATH;
  const filePath = path.join(base, `${collection}.json`);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
}

// Helper: write JSON file
function writeFile(location: "edge" | "shared", collection: string, data: any) {
  const base = location === "edge" ? EDGE_PATH : SHARED_PATH;
  const filePath = path.join(base, `${collection}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const db = {
  async get(collection: string, key: string, location: "edge" | "shared" = "edge") {
    const data = readFile(location, collection);
    return data[key] || null;
  },

  async set(collection: string, key: string, value: any, location: "edge" | "shared" = "edge") {
    // Doctrine check
    const action = `db.set:${collection}.${key}`;
    const doctrineResult = await doctrine.enforceAction(action, "", "user");
    if (!doctrineResult.success) {
      console.warn(`[Doctrine] DB write blocked: ${collection}.${key}`);
      return { blocked: true, message: doctrineResult.message };
    }

    const data = readFile(location, collection);
    data[key] = value;
    writeFile(location, collection, data);

    // Publish event
    eventBus.publish("db:update", { collection, key, value, target: location });

    return value;
  },

  async delete(collection: string, key: string, location: "edge" | "shared" = "edge") {
    const data = readFile(location, collection);
    if (data[key]) delete data[key];
    writeFile(location, collection, data);

    // Publish deletion event
    eventBus.publish("db:delete", { collection, key, target: location });
    return true;
  },

  async getAll(collection: string, location: "edge" | "shared" = "edge") {
    const data = readFile(location, collection);
    return Object.values(data);
  },

  async replicateEdgeToShared(collection: string) {
    const edgeRecords = await this.getAll(collection, "edge");
    for (const record of edgeRecords) {
      await this.set(collection, record.id, record, "shared");
    }
  },

  async subscribe(collection: string, callback: Function) {
    eventBus.subscribe("db:update", (event: any) => {
      if (event.collection === collection) callback(event);
    });
    eventBus.subscribe("db:delete", (event: any) => {
      if (event.collection === collection) callback(event);
    });
  }
};

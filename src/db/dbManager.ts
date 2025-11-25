// src/db/dbManager.ts
type DBRecord = Record<string, any>;

const edgeDB: Record<string, Record<string, any>> = {};
const sharedDB: Record<string, Record<string, any>> = {};

export const db = {
  async set(collection: string, key: string, value: any, target: "edge" | "shared" = "edge") {
    const dbRef = target === "edge" ? edgeDB : sharedDB;
    if (!dbRef[collection]) dbRef[collection] = {};
    dbRef[collection][key] = value;
  },

  async get(collection: string, key: string, target: "edge" | "shared" = "edge") {
    const dbRef = target === "edge" ? edgeDB : sharedDB;
    return dbRef[collection]?.[key] ?? null;
  },

  async getAll(collection: string, target: "edge" | "shared" = "edge") {
    const dbRef = target === "edge" ? edgeDB : sharedDB;
    return Object.values(dbRef[collection] || {});
  },

  async delete(collection: string, key: string, target: "edge" | "shared" = "edge") {
    const dbRef = target === "edge" ? edgeDB : sharedDB;
    if (dbRef[collection]) delete dbRef[collection][key];
  },

  async replicateEdgeToShared(collection: string) {
    const records = await this.getAll(collection, "edge");
    for (const rec of records) {
      await this.set(collection, rec.id, rec, "shared");
    }
  }
};

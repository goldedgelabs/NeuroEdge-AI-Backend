import { edgeDB } from "./edge/edgeDB";
import { sharedDB } from "./shared/sharedDB";

export const db = {
  async get(collection: string, key: string, location: "edge" | "shared" = "edge") {
    return location === "edge"
      ? await edgeDB.get(collection, key)
      : await sharedDB.get(collection, key);
  },

  async set(collection: string, key: string, value: any, location: "edge" | "shared" = "edge") {
    return location === "edge"
      ? await edgeDB.set(collection, key, value)
      : await sharedDB.set(collection, key, value);
  },

  async delete(collection: string, key: string, location: "edge" | "shared" = "edge") {
    return location === "edge"
      ? await edgeDB.delete(collection, key)
      : await sharedDB.delete(collection, key);
  },

  async getAll(collection: string, location: "edge" | "shared" = "edge") {
    return location === "edge"
      ? await edgeDB.getAll(collection)
      : await sharedDB.getAll(collection);
  }
};

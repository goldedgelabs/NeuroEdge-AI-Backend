// src/db/sharedDB.ts
import { db } from "./dbManager";

export async function replicateAll() {
  const collections = Object.keys(db["edgeDB"] || {});
  for (const col of collections) {
    await db.replicateEdgeToShared(col);
  }
}

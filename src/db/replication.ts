import { db } from "./dbManager";

export async function replicateEdgeToShared(collection: string) {
  const edgeRecords = await db.getAll(collection, "edge");
  for (const record of edgeRecords) {
    await db.set(collection, record.id, record, "shared");
  }
  console.log(`[Replication] ${collection} replicated from edge → shared`);
}

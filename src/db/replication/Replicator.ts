import { LocalDB } from "../local/LocalDB";
import { DistributedDB } from "../distributed/DistributedDB";

export class Replicator {
  constructor(private localDB: LocalDB, private distributedDB: DistributedDB) {}

  // Push all local changes to distributed DB
  async push(collection: string) {
    const records = await this.localDB.getAll(collection);
    for (const record of records) {
      await this.distributedDB.set(collection, record.id, record);
    }
  }

  // Pull updates from distributed DB to local
  async pull(collection: string) {
    const records = await this.distributedDB.getAll(collection);
    for (const record of records) {
      await this.localDB.set(collection, record.id, record);
    }
  }

  // Full replication: push local → distributed, then pull distributed → local
  async replicate(collection: string) {
    await this.push(collection);
    await this.pull(collection);
  }

  // Periodic sync for all collections
  async replicateAll(collections: string[]) {
    for (const col of collections) await this.replicate(col);
  }
}

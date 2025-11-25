export class DistributedDB {
  private store: Record<string, Record<string, any>> = {};

  async set(collection: string, key: string, value: any) {
    if (!this.store[collection]) this.store[collection] = {};
    this.store[collection][key] = value;
    return value;
  }

  async get(collection: string, key: string) {
    return this.store[collection]?.[key] ?? null;
  }

  async getAll(collection: string) {
    return Object.values(this.store[collection] || {});
  }

  async delete(collection: string, key: string) {
    if (this.store[collection]) delete this.store[collection][key];
  }
}

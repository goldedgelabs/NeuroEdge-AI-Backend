// src/database/local/LocalDB.ts
import { logger } from "../../utils/logger";
import crypto from "crypto";

export class LocalDB {
  private store: Record<string, any> = {};
  private encryptionKey: Buffer;

  constructor(key?: string) {
    this.encryptionKey = Buffer.from(key || "default_neuroedge_key_32b!", "utf8");
    this.survivalCheck();
  }

  survivalCheck() {
    logger.log("[LocalDB] Local database initialized");
  }

  private encrypt(data: any) {
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, this.encryptionKey.slice(0, 16));
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  private decrypt(encrypted: string) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.encryptionKey, this.encryptionKey.slice(0, 16));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  }

  async set(key: string, value: any) {
    const encrypted = this.encrypt(value);
    this.store[key] = encrypted;
    return true;
  }

  async get(key: string) {
    const encrypted = this.store[key];
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  async delete(key: string) {
    delete this.store[key];
    return true;
  }
}

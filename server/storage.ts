import { type Factory, type InsertFactory, factories } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  updateFactory(id: string, factory: Partial<InsertFactory>): Promise<Factory | undefined>;
  deleteFactory(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllFactories(): Promise<Factory[]> {
    return await db.select().from(factories);
  }

  async getFactory(id: string): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory || undefined;
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const [factory] = await db
      .insert(factories)
      .values(insertFactory)
      .returning();
    return factory;
  }

  async updateFactory(id: string, updates: Partial<InsertFactory>): Promise<Factory | undefined> {
    const [factory] = await db
      .update(factories)
      .set(updates)
      .where(eq(factories.id, id))
      .returning();
    return factory || undefined;
  }

  async deleteFactory(id: string): Promise<boolean> {
    const result = await db
      .delete(factories)
      .where(eq(factories.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

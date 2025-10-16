import { type Factory, type InsertFactory, factories, type Network, type InsertNetwork, networks } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  updateFactory(id: string, factory: Partial<InsertFactory>): Promise<Factory | undefined>;
  deleteFactory(id: string): Promise<boolean>;
  
  getAllNetworks(): Promise<Network[]>;
  getNetwork(id: string): Promise<Network | undefined>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  updateNetwork(id: string, network: Partial<InsertNetwork>): Promise<Network | undefined>;
  deleteNetwork(id: string): Promise<boolean>;
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

  async getAllNetworks(): Promise<Network[]> {
    return await db.select().from(networks);
  }

  async getNetwork(id: string): Promise<Network | undefined> {
    const [network] = await db.select().from(networks).where(eq(networks.id, id));
    return network || undefined;
  }

  async createNetwork(insertNetwork: InsertNetwork): Promise<Network> {
    const [network] = await db
      .insert(networks)
      .values(insertNetwork)
      .returning();
    return network;
  }

  async updateNetwork(id: string, updates: Partial<InsertNetwork>): Promise<Network | undefined> {
    const [network] = await db
      .update(networks)
      .set(updates)
      .where(eq(networks.id, id))
      .returning();
    return network || undefined;
  }

  async deleteNetwork(id: string): Promise<boolean> {
    const result = await db
      .delete(networks)
      .where(eq(networks.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

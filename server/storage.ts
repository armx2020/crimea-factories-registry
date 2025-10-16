import { type Factory, type InsertFactory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllFactories(): Promise<Factory[]>;
  getFactory(id: string): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  updateFactory(id: string, factory: Partial<InsertFactory>): Promise<Factory | undefined>;
  deleteFactory(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private factories: Map<string, Factory>;

  constructor() {
    this.factories = new Map();
  }

  async getAllFactories(): Promise<Factory[]> {
    return Array.from(this.factories.values());
  }

  async getFactory(id: string): Promise<Factory | undefined> {
    return this.factories.get(id);
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const id = randomUUID();
    const factory: Factory = { 
      ...insertFactory, 
      id,
      latitude: insertFactory.latitude || null,
      longitude: insertFactory.longitude || null,
      photo1: insertFactory.photo1 || null,
      photo2: insertFactory.photo2 || null,
      photo3: insertFactory.photo3 || null,
    };
    this.factories.set(id, factory);
    return factory;
  }

  async updateFactory(id: string, updates: Partial<InsertFactory>): Promise<Factory | undefined> {
    const factory = this.factories.get(id);
    if (!factory) return undefined;
    
    const updatedFactory = { ...factory, ...updates };
    this.factories.set(id, updatedFactory);
    return updatedFactory;
  }

  async deleteFactory(id: string): Promise<boolean> {
    return this.factories.delete(id);
  }
}

export const storage = new MemStorage();

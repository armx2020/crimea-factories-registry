import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const factories = pgTable("factories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  city: text("city").notNull(),
  model: text("model").notNull(),
  address: text("address").notNull(),
  capacity: integer("capacity").notNull(),
  yearlyOutput: integer("yearly_output").notNull(),
  description: text("description").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  photo1: text("photo1"),
  photo2: text("photo2"),
  photo3: text("photo3"),
});

export const insertFactorySchema = createInsertSchema(factories).omit({
  id: true,
});

export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type Factory = typeof factories.$inferSelect;

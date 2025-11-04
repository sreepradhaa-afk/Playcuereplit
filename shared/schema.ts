import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Game types and schemas
export type GameCategory = "alone" | "offline" | "room";

export interface Game {
  id: string;
  name: string;
  description: string;
  category: GameCategory;
  icon: string;
}

export const gameCategories = {
  alone: "Play Alone",
  offline: "Play Together (Offline)",
  room: "Play Together (Join Room)",
} as const;

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

export type PictionaryDifficulty = "Easy" | "Medium" | "Hard";

export interface PictionaryWord {
  id: string;
  word: string;
  difficulty: PictionaryDifficulty;
  category: string;
}

export const pictionaryWordSchema = z.object({
  id: z.string(),
  word: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  category: z.string(),
});

export type PictionaryWordSelect = PictionaryWord;

export type CharadesDifficulty = "Easy" | "Medium" | "Hard";

export interface CharadesWord {
  id: string;
  cueWords: string;
  difficulty: CharadesDifficulty;
  category: string;
}

export const charadesWordSchema = z.object({
  id: z.string(),
  cueWords: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  category: z.string(),
});

export type CharadesWordSelect = CharadesWord;

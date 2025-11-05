import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User word history table (track which words each user has seen)
export const userWordHistory = pgTable("user_word_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameType: varchar("game_type").notNull(), // "pictionary", "charades", "password", "taboo"
  wordId: varchar("word_id").notNull(),
  seenAt: timestamp("seen_at").defaultNow(),
});

export const insertUserWordHistorySchema = createInsertSchema(userWordHistory).omit({
  id: true,
  seenAt: true,
});

export type InsertUserWordHistory = z.infer<typeof insertUserWordHistorySchema>;
export type UserWordHistory = typeof userWordHistory.$inferSelect;

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

export type PasswordDifficulty = "Easy" | "Medium" | "Hard";

export interface PasswordWord {
  id: string;
  cueWord: string;
  difficulty: PasswordDifficulty;
  category: string;
}

export const passwordWordSchema = z.object({
  id: z.string(),
  cueWord: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  category: z.string(),
});

export type PasswordWordSelect = PasswordWord;

export interface TabooWord {
  id: string;
  cueWord: string;
  tabooWords: string[];
}

export const tabooWordSchema = z.object({
  id: z.string(),
  cueWord: z.string(),
  tabooWords: z.array(z.string()),
});

export type TabooWordSelect = TabooWord;

export interface ColordleColor {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

export interface ColordleGame {
  id: string;
  targetColors: {
    color1: string;
    color2: string;
    color3: string;
    percentage1: number;
    percentage2: number;
    percentage3: number;
  };
  targetRGB: {
    r: number;
    g: number;
    b: number;
  };
  guesses: ColordleGuess[];
  completed: boolean;
  won: boolean;
}

export interface ColordleGuess {
  color1: string;
  color2: string;
  color3: string;
  resultRGB: {
    r: number;
    g: number;
    b: number;
  };
  accuracy: number;
}

export const colordleGameSchema = z.object({
  id: z.string(),
  targetColors: z.object({
    color1: z.string(),
    color2: z.string(),
    color3: z.string(),
    percentage1: z.number(),
    percentage2: z.number(),
    percentage3: z.number(),
  }),
  targetRGB: z.object({
    r: z.number(),
    g: z.number(),
    b: z.number(),
  }),
  guesses: z.array(z.object({
    color1: z.string(),
    color2: z.string(),
    color3: z.string(),
    resultRGB: z.object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
    }),
    accuracy: z.number(),
  })),
  completed: z.boolean(),
  won: z.boolean(),
});

export type ColordleGameSelect = ColordleGame;

export interface NumbleGame {
  id: string;
  targetCode: string;
  codeLength: number;
  guesses: NumbleGuess[];
  completed: boolean;
  won: boolean;
}

export interface NumbleGuess {
  code: string;
  feedback: Array<'correct' | 'wrong-position' | 'wrong'>;
}

export const numbleGameSchema = z.object({
  id: z.string(),
  targetCode: z.string(),
  codeLength: z.number().min(3).max(6),
  guesses: z.array(z.object({
    code: z.string(),
    feedback: z.array(z.enum(['correct', 'wrong-position', 'wrong'])),
  })),
  completed: z.boolean(),
  won: z.boolean(),
});

export type NumbleGameSelect = NumbleGame;

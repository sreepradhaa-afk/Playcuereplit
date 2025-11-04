import { type User, type InsertUser, type PictionaryWord, type PictionaryDifficulty } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPictionaryWords(): Promise<PictionaryWord[]>;
  getPictionaryWordsByFilter(difficulty?: PictionaryDifficulty | "All", categories?: string[]): Promise<PictionaryWord[]>;
  getPictionaryCategories(): Promise<string[]>;
}

function parsePictionaryCSV(): PictionaryWord[] {
  const csvPath = join(process.cwd(), "attached_assets", "pictionary_words_1762278792900.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  
  const words: PictionaryWord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [id, word, difficulty, category] = line.split(",");
    words.push({
      id: id.trim(),
      word: word.trim(),
      difficulty: difficulty.trim() as PictionaryDifficulty,
      category: category.trim(),
    });
  }
  
  return words;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pictionaryWords: PictionaryWord[];

  constructor() {
    this.users = new Map();
    this.pictionaryWords = parsePictionaryCSV();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPictionaryWords(): Promise<PictionaryWord[]> {
    return this.pictionaryWords;
  }

  async getPictionaryWordsByFilter(
    difficulty?: PictionaryDifficulty | "All",
    categories?: string[]
  ): Promise<PictionaryWord[]> {
    let filtered = this.pictionaryWords;

    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter((word) => word.difficulty === difficulty);
    }

    if (categories && categories.length > 0) {
      filtered = filtered.filter((word) => categories.includes(word.category));
    }

    return filtered;
  }

  async getPictionaryCategories(): Promise<string[]> {
    const categoriesSet = new Set(this.pictionaryWords.map((word) => word.category));
    return Array.from(categoriesSet).sort();
  }
}

export const storage = new MemStorage();

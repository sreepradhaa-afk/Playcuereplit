import { type User, type UpsertUser, type InsertUserWordHistory, type UserWordHistory, type PictionaryWord, type PictionaryDifficulty, type CharadesWord, type CharadesDifficulty, type PasswordWord, type PasswordDifficulty, type TabooWord, type ColordleGame, type NumbleGame, userWordHistory as userWordHistoryTable, users as usersTable } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { passwordWords as importedPasswordWords, tabooWords as importedTabooWords } from "./games-data";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";

// Database client
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
import { createColordleGame, processGuess as processColordleGuess, updateGameWithGuess as updateColordleGame } from "./colordle-utils";
import { createNumbleGame, processGuess as processNumbleGuess, updateGameWithGuess as updateNumbleGame } from "./numble-utils";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User word history operations
  addUserWordHistory(history: InsertUserWordHistory): Promise<UserWordHistory>;
  getUserSeenWordIds(userId: string, gameType: string): Promise<string[]>;
  
  getPictionaryWords(): Promise<PictionaryWord[]>;
  getPictionaryWordsByFilter(difficulty?: PictionaryDifficulty | "All", categories?: string[]): Promise<PictionaryWord[]>;
  getPictionaryCategories(): Promise<string[]>;
  
  getCharadesWords(): Promise<CharadesWord[]>;
  getCharadesWordsByFilter(difficulty?: CharadesDifficulty | "All", categories?: string[]): Promise<CharadesWord[]>;
  getCharadesCategories(): Promise<string[]>;
  
  getPasswordWords(): Promise<PasswordWord[]>;
  getPasswordWordsByFilter(difficulty?: PasswordDifficulty | "All", categories?: string[]): Promise<PasswordWord[]>;
  getPasswordCategories(): Promise<string[]>;
  
  getTabooWords(): Promise<TabooWord[]>;
  
  createColordleGame(): Promise<ColordleGame>;
  getColordleGame(id: string): Promise<ColordleGame | undefined>;
  submitColordleGuess(gameId: string, guess: { color1: string; color2: string; color3: string }): Promise<ColordleGame | undefined>;
  
  createNumbleGame(codeLength: number): Promise<NumbleGame>;
  getNumbleGame(id: string): Promise<NumbleGame | undefined>;
  submitNumbleGuess(gameId: string, guessCode: string): Promise<NumbleGame | undefined>;
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

function parseCharadesCSV(): CharadesWord[] {
  const csvPath = join(process.cwd(), "attached_assets", "charades_final_words_1762280667075.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  
  const words: CharadesWord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [id, cueWords, difficulty, category] = line.split(",");
    words.push({
      id: id.trim(),
      cueWords: cueWords.trim(),
      difficulty: difficulty.trim() as CharadesDifficulty,
      category: category.trim(),
    });
  }
  
  return words;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userWordHistory: Map<string, UserWordHistory>;
  private pictionaryWords: PictionaryWord[];
  private charadesWords: CharadesWord[];
  private passwordWords: PasswordWord[];
  private tabooWords: TabooWord[];
  private colordleGames: Map<string, ColordleGame>;
  private numbleGames: Map<string, NumbleGame>;

  constructor() {
    this.users = new Map();
    this.userWordHistory = new Map();
    this.pictionaryWords = parsePictionaryCSV();
    this.charadesWords = parseCharadesCSV();
    this.passwordWords = importedPasswordWords;
    this.tabooWords = importedTabooWords;
    this.colordleGames = new Map();
    this.numbleGames = new Map();
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    // Query from PostgreSQL database
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      id: userData.id!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    
    // Insert or update in PostgreSQL database using ON CONFLICT
    await db.insert(usersTable).values(user)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: now,
        },
      });
    
    return user;
  }

  // User word history operations
  async addUserWordHistory(history: InsertUserWordHistory): Promise<UserWordHistory> {
    const id = randomUUID();
    const record: UserWordHistory = {
      id,
      ...history,
      seenAt: new Date(),
    };
    
    // Insert into PostgreSQL database
    await db.insert(userWordHistoryTable).values({
      id,
      userId: history.userId,
      gameType: history.gameType,
      wordId: history.wordId,
      seenAt: new Date(),
    });
    
    return record;
  }

  async getUserSeenWordIds(userId: string, gameType: string): Promise<string[]> {
    // Query from PostgreSQL database
    const records = await db
      .select({ wordId: userWordHistoryTable.wordId })
      .from(userWordHistoryTable)
      .where(
        and(
          eq(userWordHistoryTable.userId, userId),
          eq(userWordHistoryTable.gameType, gameType)
        )
      );
    
    return records.map((record) => record.wordId);
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

  async getCharadesWords(): Promise<CharadesWord[]> {
    return this.charadesWords;
  }

  async getCharadesWordsByFilter(
    difficulty?: CharadesDifficulty | "All",
    categories?: string[]
  ): Promise<CharadesWord[]> {
    let filtered = this.charadesWords;

    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter((word) => word.difficulty === difficulty);
    }

    if (categories && categories.length > 0) {
      filtered = filtered.filter((word) => categories.includes(word.category));
    }

    return filtered;
  }

  async getCharadesCategories(): Promise<string[]> {
    const categoriesSet = new Set(this.charadesWords.map((word) => word.category));
    return Array.from(categoriesSet).sort();
  }

  async getPasswordWords(): Promise<PasswordWord[]> {
    return this.passwordWords;
  }

  async getPasswordWordsByFilter(
    difficulty?: PasswordDifficulty | "All",
    categories?: string[]
  ): Promise<PasswordWord[]> {
    let filtered = this.passwordWords;

    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter((word) => word.difficulty === difficulty);
    }

    if (categories && categories.length > 0) {
      filtered = filtered.filter((word) => categories.includes(word.category));
    }

    return filtered;
  }

  async getPasswordCategories(): Promise<string[]> {
    const categoriesSet = new Set(this.passwordWords.map((word) => word.category));
    return Array.from(categoriesSet).sort();
  }

  async getTabooWords(): Promise<TabooWord[]> {
    return this.tabooWords;
  }

  async createColordleGame(): Promise<ColordleGame> {
    const game = createColordleGame();
    this.colordleGames.set(game.id, game);
    return game;
  }

  async getColordleGame(id: string): Promise<ColordleGame | undefined> {
    return this.colordleGames.get(id);
  }

  async submitColordleGuess(
    gameId: string,
    guess: { color1: string; color2: string; color3: string }
  ): Promise<ColordleGame | undefined> {
    const game = this.colordleGames.get(gameId);
    if (!game || game.completed) {
      return undefined;
    }

    const guessResult = processColordleGuess(game, guess);
    const updatedGame = updateColordleGame(game, guessResult);
    
    this.colordleGames.set(gameId, updatedGame);
    return updatedGame;
  }
  
  async createNumbleGame(codeLength: number): Promise<NumbleGame> {
    const game = createNumbleGame(codeLength);
    this.numbleGames.set(game.id, game);
    return game;
  }

  async getNumbleGame(id: string): Promise<NumbleGame | undefined> {
    return this.numbleGames.get(id);
  }

  async submitNumbleGuess(
    gameId: string,
    guessCode: string
  ): Promise<NumbleGame | undefined> {
    const game = this.numbleGames.get(gameId);
    if (!game || game.completed) {
      return undefined;
    }

    const guessResult = processNumbleGuess(game, guessCode);
    const updatedGame = updateNumbleGame(game, guessResult);
    
    this.numbleGames.set(gameId, updatedGame);
    return updatedGame;
  }
}

export const storage = new MemStorage();

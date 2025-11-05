import type { Game, PasswordWord, TabooWord } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

export const gamesData: Game[] = [
  {
    id: "numble",
    name: "Numble",
    description: "Crack the code! Guess the secret number sequence in 6 tries.",
    category: "alone",
    icon: "lock",
  },
  {
    id: "colordle",
    name: "Colordle",
    description: "Decode the perfect color blend. Mix, match, and master hues!",
    category: "alone",
    icon: "palette",
  },
  {
    id: "globetrix",
    name: "Globetrix",
    description: "Navigate the world, guess by guess. Your geography adventure awaits!",
    category: "alone",
    icon: "globe",
  },
  {
    id: "pictionary",
    name: "Pictionary",
    description: "Draw and guess! Perfect for unleashing creativity and laughter.",
    category: "offline",
    icon: "brush",
  },
  {
    id: "charades",
    name: "Charades",
    description: "Act it out! Classic party game that gets everyone moving.",
    category: "offline",
    icon: "drama",
  },
  {
    id: "password",
    name: "Password",
    description: "Give one-word clues to help your partner guess the secret word.",
    category: "offline",
    icon: "filetext",
  },
  {
    id: "taboo",
    name: "Taboo",
    description: "Describe without forbidden words. Test your vocabulary skills!",
    category: "offline",
    icon: "ban",
  },
  {
    id: "wavelength",
    name: "Wavelength",
    description: "Sync minds with your team. Find the perfect spot on the spectrum.",
    category: "room",
    icon: "radio",
  },
  {
    id: "blankslate",
    name: "Blankslate",
    description: "Match answers with just one other player. Think alike, but not too alike!",
    category: "room",
    icon: "filetext",
  },
  {
    id: "imposter",
    name: "Guess the Imposter",
    description: "Find who doesn't belong! Deduce the imposter through clever questions.",
    category: "room",
    icon: "users",
  },
];

function parsePasswordWords(): PasswordWord[] {
  const csvPath = join(process.cwd(), "attached_assets", "Password_words_1762282369184.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  
  const words: PasswordWord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    if (parts.length >= 4) {
      words.push({
        id: parts[0],
        cueWord: parts[1],
        difficulty: parts[2] as "Easy" | "Medium" | "Hard",
        category: parts[3],
      });
    }
  }
  
  return words;
}

export const passwordWords = parsePasswordWords();

function parseTabooWords(): TabooWord[] {
  const csvPath = join(process.cwd(), "server", "data", "taboo_words.csv");
  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  
  const words: TabooWord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    if (parts.length >= 7) {
      const tabooWords = [parts[2], parts[3], parts[4], parts[5], parts[6]].filter(w => w);
      words.push({
        id: parts[0],
        cueWord: parts[1],
        tabooWords,
      });
    }
  }
  
  return words;
}

export const tabooWords = parseTabooWords();

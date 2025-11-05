import { readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { blankslateWords, imposterWords, wavelengthWords } from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function loadGameWords() {
  console.log("Loading game words into database...");
  
  // Load Blankslate words
  const blankslatePath = join(process.cwd(), "attached_assets", "Blankslate_words_1762328389279.csv");
  const blankslateContent = readFileSync(blankslatePath, "utf-8");
  const blankslateLines = blankslateContent.trim().split("\n");
  
  const blankslateData = [];
  for (let i = 1; i < blankslateLines.length; i++) {
    const line = blankslateLines[i].trim();
    if (!line) continue;
    
    const [id, cueWord] = line.split(",");
    blankslateData.push({ id, cueWord });
  }
  
  // Insert Blankslate words (on conflict do nothing to avoid duplicates)
  if (blankslateData.length > 0) {
    await db.insert(blankslateWords).values(blankslateData).onConflictDoNothing();
    console.log(`Loaded ${blankslateData.length} Blankslate words`);
  }
  
  // Load Imposter words
  const imposterPath = join(process.cwd(), "attached_assets", "Imposter_categories_1762328399759.csv");
  const imposterContent = readFileSync(imposterPath, "utf-8");
  const imposterLines = imposterContent.trim().split("\n");
  
  const imposterData = [];
  for (let i = 1; i < imposterLines.length; i++) {
    const line = imposterLines[i].trim();
    if (!line) continue;
    
    const [id, cueWord, imposterWord] = line.split(",");
    imposterData.push({ id, cueWord, imposterWord });
  }
  
  // Insert Imposter words
  if (imposterData.length > 0) {
    await db.insert(imposterWords).values(imposterData).onConflictDoNothing();
    console.log(`Loaded ${imposterData.length} Imposter word pairs`);
  }
  
  // Load Wavelength words
  const wavelengthPath = join(process.cwd(), "attached_assets", "Wavelength_categories_1762328433988.csv");
  const wavelengthContent = readFileSync(wavelengthPath, "utf-8");
  const wavelengthLines = wavelengthContent.trim().split("\n");
  
  const wavelengthData = [];
  for (let i = 1; i < wavelengthLines.length; i++) {
    const line = wavelengthLines[i].trim();
    if (!line) continue;
    
    const [id, leftSpectrum, rightSpectrum] = line.split(",");
    wavelengthData.push({ id, leftSpectrum, rightSpectrum });
  }
  
  // Insert Wavelength words
  if (wavelengthData.length > 0) {
    await db.insert(wavelengthWords).values(wavelengthData).onConflictDoNothing();
    console.log(`Loaded ${wavelengthData.length} Wavelength spectrum pairs`);
  }
  
  console.log("Game words loaded successfully!");
}

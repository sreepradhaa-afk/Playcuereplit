import { ColordleGame, ColordleGuess, ColordleColor } from "@shared/schema";
import { randomUUID } from "crypto";

// Available colors with RGB values
export const COLORDLE_COLORS: ColordleColor[] = [
  { name: "Red", hex: "#FF0000", r: 255, g: 0, b: 0 },
  { name: "Blue", hex: "#0000FF", r: 0, g: 0, b: 255 },
  { name: "Green", hex: "#00FF00", r: 0, g: 255, b: 0 },
  { name: "Yellow", hex: "#FFFF00", r: 255, g: 255, b: 0 },
  { name: "Orange", hex: "#FFA500", r: 255, g: 165, b: 0 },
  { name: "Purple", hex: "#800080", r: 128, g: 0, b: 128 },
  { name: "Pink", hex: "#FFC0CB", r: 255, g: 192, b: 203 },
  { name: "Brown", hex: "#A52A2A", r: 165, g: 42, b: 42 },
  { name: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { name: "Cyan", hex: "#00FFFF", r: 0, g: 255, b: 255 },
  { name: "Magenta", hex: "#FF00FF", r: 255, g: 0, b: 255 },
  { name: "Lime", hex: "#BFFF00", r: 191, g: 255, b: 0 },
  { name: "Teal", hex: "#008080", r: 0, g: 128, b: 128 },
  { name: "Navy", hex: "#000080", r: 0, g: 0, b: 128 },
];

// Generate random percentages that sum to 100
function generateRandomPercentages(): [number, number, number] {
  // Generate first percentage (30-60%)
  const p1 = Math.floor(Math.random() * 31) + 30;
  
  // Generate second percentage (20-50% of remaining)
  const remaining = 100 - p1;
  const min2 = Math.max(15, Math.floor(remaining * 0.25));
  const max2 = Math.min(40, Math.floor(remaining * 0.75));
  const p2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
  
  // Third percentage is whatever remains
  const p3 = 100 - p1 - p2;
  
  // Shuffle to randomize order
  const percentages = [p1, p2, p3];
  for (let i = percentages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [percentages[i], percentages[j]] = [percentages[j], percentages[i]];
  }
  
  return percentages as [number, number, number];
}

// Mix RGB colors based on percentages
export function mixRGBColors(
  color1: ColordleColor,
  color2: ColordleColor,
  color3: ColordleColor,
  p1: number,
  p2: number,
  p3: number
): { r: number; g: number; b: number } {
  const r = Math.round((color1.r * p1 + color2.r * p2 + color3.r * p3) / 100);
  const g = Math.round((color1.g * p1 + color2.g * p2 + color3.g * p3) / 100);
  const b = Math.round((color1.b * p1 + color2.b * p2 + color3.b * p3) / 100);
  
  return { r, g, b };
}

// Calculate RGB distance (Euclidean distance in RGB space)
function calculateRGBDistance(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Convert RGB distance to accuracy percentage
// Maximum possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
export function calculateAccuracy(
  targetRGB: { r: number; g: number; b: number },
  guessRGB: { r: number; g: number; b: number }
): number {
  const maxDistance = 441.67; // sqrt(3 * 255^2)
  const distance = calculateRGBDistance(targetRGB, guessRGB);
  const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100);
  
  return Math.round(accuracy * 10) / 10; // Round to 1 decimal place
}

// Create a new Colordle game
export function createColordleGame(): ColordleGame {
  // Select 3 unique random colors
  const shuffledColors = [...COLORDLE_COLORS].sort(() => Math.random() - 0.5);
  const [color1, color2, color3] = shuffledColors.slice(0, 3);
  
  // Generate random percentages
  const [p1, p2, p3] = generateRandomPercentages();
  
  // Calculate target RGB
  const targetRGB = mixRGBColors(color1, color2, color3, p1, p2, p3);
  
  return {
    id: randomUUID(),
    targetColors: {
      color1: color1.name,
      color2: color2.name,
      color3: color3.name,
      percentage1: p1,
      percentage2: p2,
      percentage3: p3,
    },
    targetRGB,
    guesses: [],
    completed: false,
    won: false,
  };
}

// Process a guess
export function processGuess(
  game: ColordleGame,
  guessColors: { color1: string; color2: string; color3: string }
): ColordleGuess {
  // Find color objects
  const c1 = COLORDLE_COLORS.find(c => c.name === guessColors.color1);
  const c2 = COLORDLE_COLORS.find(c => c.name === guessColors.color2);
  const c3 = COLORDLE_COLORS.find(c => c.name === guessColors.color3);
  
  if (!c1 || !c2 || !c3) {
    throw new Error("Invalid color selection");
  }
  
  // Mix guess colors with equal proportions (33.33% each)
  const resultRGB = mixRGBColors(c1, c2, c3, 33.33, 33.33, 33.34);
  
  // Calculate accuracy
  const accuracy = calculateAccuracy(game.targetRGB, resultRGB);
  
  return {
    color1: guessColors.color1,
    color2: guessColors.color2,
    color3: guessColors.color3,
    resultRGB,
    accuracy,
  };
}

// Check if game is won (accuracy >= 95%)
export function checkWin(accuracy: number): boolean {
  return accuracy >= 95.0;
}

// Update game with new guess
export function updateGameWithGuess(
  game: ColordleGame,
  guess: ColordleGuess
): ColordleGame {
  const newGuesses = [...game.guesses, guess];
  const won = checkWin(guess.accuracy);
  const completed = won || newGuesses.length >= 6;
  
  return {
    ...game,
    guesses: newGuesses,
    completed,
    won,
  };
}

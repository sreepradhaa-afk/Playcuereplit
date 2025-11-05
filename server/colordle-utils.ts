import type { ColordleGame, ColordleGuess } from "@shared/schema";
import { randomUUID } from "crypto";

// Available colors for Colordle
export const AVAILABLE_COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Lime", hex: "#84CC16" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Brown", hex: "#92400E" },
  { name: "Navy", hex: "#1E3A8A" },
];

// Generate a new Colordle game with random color composition
export function generateColordleGame(): ColordleGame {
  // Select 3 unique random colors
  const shuffled = [...AVAILABLE_COLORS].sort(() => Math.random() - 0.5);
  const selectedColors = shuffled.slice(0, 3);

  // Generate random percentages that sum to 100
  let percentage1 = Math.floor(Math.random() * 61) + 20; // 20-80%
  let percentage2 = Math.floor(Math.random() * (81 - percentage1)) + 10; // At least 10%
  let percentage3 = 100 - percentage1 - percentage2;

  // Ensure all percentages are at least 10%
  if (percentage3 < 10) {
    percentage1 -= (10 - percentage3);
    percentage3 = 10;
  }

  return {
    id: randomUUID(),
    targetColor: {
      color1: selectedColors[0].name,
      color2: selectedColors[1].name,
      color3: selectedColors[2].name,
      percentage1,
      percentage2,
      percentage3,
    },
    guesses: [],
    completed: false,
    won: false,
  };
}

// Calculate accuracy of a guess compared to target
// This is a simplified version that only checks color matching, not percentages
// For a full game, you would need to know the guessed percentages too
export function calculateGuessAccuracy(
  targetColor: ColordleGame["targetColor"],
  guessColors: { color1: string; color2: string; color3: string }
): ColordleGuess {
  // Check if colors are correct and in correct position
  const color1Correct = guessColors.color1 === targetColor.color1;
  const color2Correct = guessColors.color2 === targetColor.color2;
  const color3Correct = guessColors.color3 === targetColor.color3;

  // Check if colors are in the target but wrong position
  const targetColors = [targetColor.color1, targetColor.color2, targetColor.color3];
  const color1InTarget = !color1Correct && targetColors.includes(guessColors.color1);
  const color2InTarget = !color2Correct && targetColors.includes(guessColors.color2);
  const color3InTarget = !color3Correct && targetColors.includes(guessColors.color3);

  // Calculate overall color accuracy based on correct positions and color matching
  // This gives a score for how close the guess is to the target
  let accuracy = 0;
  
  // Give full points (33.33%) for each color in the correct position
  if (color1Correct) accuracy += 33.33;
  if (color2Correct) accuracy += 33.33;
  if (color3Correct) accuracy += 33.34;
  
  // Give partial points (16.67%) for colors that are in the mix but wrong position
  if (color1InTarget) accuracy += 16.67;
  if (color2InTarget) accuracy += 16.67;
  if (color3InTarget) accuracy += 16.66;

  return {
    color1: guessColors.color1,
    color2: guessColors.color2,
    color3: guessColors.color3,
    accuracy: Math.round(accuracy),
    feedback: {
      color1: color1Correct ? "correct" : color1InTarget ? "wrong-position" : "wrong",
      color2: color2Correct ? "correct" : color2InTarget ? "wrong-position" : "wrong",
      color3: color3Correct ? "correct" : color3InTarget ? "wrong-position" : "wrong",
    },
  };
}

// Check if game is won (all colors in correct positions)
export function checkWin(guess: ColordleGuess): boolean {
  return (
    guess.feedback.color1 === "correct" &&
    guess.feedback.color2 === "correct" &&
    guess.feedback.color3 === "correct"
  );
}

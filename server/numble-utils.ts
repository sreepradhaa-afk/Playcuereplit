import { NumbleGame, NumbleGuess } from "@shared/schema";
import { randomUUID } from "crypto";

// Generate a random code of specified length
function generateRandomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// Create a new Numble game
export function createNumbleGame(codeLength: number): NumbleGame {
  if (codeLength < 3 || codeLength > 6) {
    throw new Error("Code length must be between 3 and 6");
  }
  
  return {
    id: randomUUID(),
    targetCode: generateRandomCode(codeLength),
    codeLength,
    guesses: [],
    completed: false,
    won: false,
  };
}

// Process a guess and return feedback
export function processGuess(
  game: NumbleGame,
  guessCode: string
): NumbleGuess {
  if (guessCode.length !== game.codeLength) {
    throw new Error(`Guess must be ${game.codeLength} digits`);
  }
  
  if (!/^\d+$/.test(guessCode)) {
    throw new Error("Guess must contain only digits");
  }
  
  const feedback: Array<'correct' | 'wrong-position' | 'wrong'> = [];
  const targetDigits = game.targetCode.split('');
  const guessDigits = guessCode.split('');
  
  // Track which positions have been matched
  const targetMatched = new Array(game.codeLength).fill(false);
  const guessMatched = new Array(game.codeLength).fill(false);
  
  // First pass: mark correct positions
  for (let i = 0; i < game.codeLength; i++) {
    if (guessDigits[i] === targetDigits[i]) {
      feedback[i] = 'correct';
      targetMatched[i] = true;
      guessMatched[i] = true;
    }
  }
  
  // Second pass: mark wrong positions
  for (let i = 0; i < game.codeLength; i++) {
    if (guessMatched[i]) continue; // Already marked as correct
    
    let foundWrongPosition = false;
    for (let j = 0; j < game.codeLength; j++) {
      if (!targetMatched[j] && guessDigits[i] === targetDigits[j]) {
        feedback[i] = 'wrong-position';
        targetMatched[j] = true;
        foundWrongPosition = true;
        break;
      }
    }
    
    if (!foundWrongPosition) {
      feedback[i] = 'wrong';
    }
  }
  
  return {
    code: guessCode,
    feedback,
  };
}

// Check if game is won
export function checkWin(guess: NumbleGuess): boolean {
  return guess.feedback.every(f => f === 'correct');
}

// Update game with new guess
export function updateGameWithGuess(
  game: NumbleGame,
  guess: NumbleGuess
): NumbleGame {
  const newGuesses = [...game.guesses, guess];
  const won = checkWin(guess);
  const completed = won || newGuesses.length >= 6;
  
  return {
    ...game,
    guesses: newGuesses,
    completed,
    won,
  };
}

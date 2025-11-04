import type { Game } from "@shared/schema";

export const gamesData: Game[] = [
  // Play Alone Games
  {
    id: "wordlink",
    name: "WordLink",
    description: "Start from one word and end in another, by changing one letter at a time. Lower the turns, maximum points!",
    category: "alone",
    icon: "link",
  },
  {
    id: "colordle",
    name: "Colordle",
    description: "Guess the mix of target color. The target color is composed of three unique colors mixed together, in different ratios.",
    category: "alone",
    icon: "palette",
  },
  {
    id: "globetrix",
    name: "Globetrix",
    description: "Guess the target country across the globe. After each guess, see distance, direction and proximity from your guess to the target location.",
    category: "alone",
    icon: "globe",
  },
  // Play Offline Games
  {
    id: "pictionary",
    name: "Pictionary",
    description: "Draw prompts while your team guesses. Express creativity and test your artistic skills in this classic drawing game!",
    category: "offline",
    icon: "brush",
  },
  {
    id: "charades",
    name: "Charades",
    description: "Act out words and phrases without speaking. Let your body do the talking in this hilarious party game!",
    category: "offline",
    icon: "drama",
  },
  {
    id: "password",
    name: "Password",
    description: "Give one-word clues to help your partner guess the secret password. Communication is key!",
    category: "offline",
    icon: "lock",
  },
  {
    id: "taboo",
    name: "Taboo",
    description: "Describe words without using forbidden terms. Think fast and choose your words carefully!",
    category: "offline",
    icon: "ban",
  },
  // Join Room Games
  {
    id: "wavelength",
    name: "Wavelength",
    description: "Tune into your teammates' wavelength and guess where they're pointing on the spectrum. Perfect teamwork wins!",
    category: "room",
    icon: "radio",
  },
  {
    id: "blankslate",
    name: "Blankslate",
    description: "Fill in the blank and match with exactly one other player. Think alike, but not too alike!",
    category: "room",
    icon: "filetext",
  },
  {
    id: "guess-the-imposter",
    name: "Guess the Imposter",
    description: "Find the imposter among you! Ask questions, gather clues, and vote out the suspicious player.",
    category: "room",
    icon: "users",
  },
];

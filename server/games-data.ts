import type { Game } from "@shared/schema";

export const gamesData: Game[] = [
  // Play Alone Games
  {
    id: "wordlink",
    name: "WordLink",
    description: "Transform words letter by letter. Fewer moves, bigger scores!",
    category: "alone",
    icon: "link",
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
  // Play Offline Games
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
    icon: "lock",
  },
  {
    id: "taboo",
    name: "Taboo",
    description: "Describe without forbidden words. Test your vocabulary skills!",
    category: "offline",
    icon: "ban",
  },
  // Join Room Games
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
    id: "guess-the-imposter",
    name: "Guess the Imposter",
    description: "Find who doesn't belong! Deduce the imposter through clever questions.",
    category: "room",
    icon: "users",
  },
];

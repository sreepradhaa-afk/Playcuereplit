import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gamesData } from "./games-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all games
  app.get("/api/games", (_req, res) => {
    res.json(gamesData);
  });

  // Pictionary endpoints
  app.get("/api/pictionary/words", async (_req, res) => {
    const words = await storage.getPictionaryWords();
    res.json(words);
  });

  app.get("/api/pictionary/categories", async (_req, res) => {
    const categories = await storage.getPictionaryCategories();
    res.json(categories);
  });

  app.post("/api/pictionary/words/filter", async (req, res) => {
    const { difficulty, categories } = req.body;
    const words = await storage.getPictionaryWordsByFilter(difficulty, categories);
    res.json(words);
  });

  // Charades endpoints
  app.get("/api/charades/words", async (_req, res) => {
    const words = await storage.getCharadesWords();
    res.json(words);
  });

  app.get("/api/charades/categories", async (_req, res) => {
    const categories = await storage.getCharadesCategories();
    res.json(categories);
  });

  app.post("/api/charades/words/filter", async (req, res) => {
    const { difficulty, categories } = req.body;
    const words = await storage.getCharadesWordsByFilter(difficulty, categories);
    res.json(words);
  });

  // Password endpoints
  app.get("/api/password/words", async (_req, res) => {
    const words = await storage.getPasswordWords();
    res.json(words);
  });

  app.get("/api/password/categories", async (_req, res) => {
    const categories = await storage.getPasswordCategories();
    res.json(categories);
  });

  app.post("/api/password/words/filter", async (req, res) => {
    const { difficulty, categories } = req.body;
    const words = await storage.getPasswordWordsByFilter(difficulty, categories);
    res.json(words);
  });

  // Taboo endpoints
  app.get("/api/taboo/words", async (_req, res) => {
    const words = await storage.getTabooWords();
    res.json(words);
  });

  // Colordle endpoints
  app.post("/api/colordle/game", async (_req, res) => {
    const game = await storage.createColordleGame();
    // Send targetRGB (what players need to match) but hide the solution (colors + percentages)
    const { targetColors, ...clientGame } = game;
    res.json(clientGame);
  });

  app.get("/api/colordle/game/:id", async (req, res) => {
    const game = await storage.getColordleGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    // Send targetRGB (what they're matching) but only reveal solution colors/percentages when complete
    if (game.completed) {
      res.json(game);
    } else {
      const { targetColors, ...clientGame } = game;
      res.json(clientGame);
    }
  });

  app.post("/api/colordle/game/:id/guess", async (req, res) => {
    const { color1, color2, color3 } = req.body;
    const game = await storage.submitColordleGuess(req.params.id, { color1, color2, color3 });
    if (!game) {
      return res.status(404).json({ error: "Game not found or already completed" });
    }
    // Send targetRGB (what they're matching) but only reveal solution colors/percentages when complete
    if (game.completed) {
      res.json(game);
    } else {
      const { targetColors, ...clientGame } = game;
      res.json(clientGame);
    }
  });

  // Numble endpoints
  app.post("/api/numble/game", async (req, res) => {
    const { codeLength } = req.body;
    const game = await storage.createNumbleGame(codeLength || 4);
    // Don't send the solution to the client until game is complete
    const { targetCode, ...clientGame } = game;
    res.json(clientGame);
  });

  app.get("/api/numble/game/:id", async (req, res) => {
    const game = await storage.getNumbleGame(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    // Only send targetCode if game is completed
    if (game.completed) {
      res.json(game);
    } else {
      const { targetCode, ...clientGame } = game;
      res.json(clientGame);
    }
  });

  app.post("/api/numble/game/:id/guess", async (req, res) => {
    const { code } = req.body;
    const game = await storage.submitNumbleGuess(req.params.id, code);
    if (!game) {
      return res.status(404).json({ error: "Game not found or already completed" });
    }
    // Only send solution if game is completed
    if (game.completed) {
      res.json(game);
    } else {
      const { targetCode, ...clientGame } = game;
      res.json(clientGame);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

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

  const httpServer = createServer(app);

  return httpServer;
}

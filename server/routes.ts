import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gamesData } from "./games-data";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication (required for Replit Auth)
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  app.post("/api/pictionary/words/filter", async (req: any, res) => {
    const { difficulty, categories } = req.body;
    let words = await storage.getPictionaryWordsByFilter(difficulty, categories);
    
    // Filter out previously shown words for authenticated users
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const seenWordIds = await storage.getUserSeenWordIds(userId, "pictionary");
      words = words.filter(word => !seenWordIds.includes(word.id));
    }
    
    res.json(words);
  });

  // Track shown words for authenticated users
  app.post("/api/pictionary/words/mark-shown", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wordId } = req.body;
      await storage.addUserWordHistory({
        userId,
        gameType: "pictionary",
        wordId,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking word as shown:", error);
      res.status(500).json({ message: "Failed to mark word as shown" });
    }
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

  app.post("/api/charades/words/filter", async (req: any, res) => {
    const { difficulty, categories } = req.body;
    let words = await storage.getCharadesWordsByFilter(difficulty, categories);
    
    // Filter out previously shown words for authenticated users
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const seenWordIds = await storage.getUserSeenWordIds(userId, "charades");
      words = words.filter(word => !seenWordIds.includes(word.id));
    }
    
    res.json(words);
  });

  // Track shown words for authenticated users
  app.post("/api/charades/words/mark-shown", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wordId } = req.body;
      await storage.addUserWordHistory({
        userId,
        gameType: "charades",
        wordId,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking word as shown:", error);
      res.status(500).json({ message: "Failed to mark word as shown" });
    }
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

  app.post("/api/password/words/filter", async (req: any, res) => {
    const { difficulty, categories } = req.body;
    let words = await storage.getPasswordWordsByFilter(difficulty, categories);
    
    // Filter out previously shown words for authenticated users
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const seenWordIds = await storage.getUserSeenWordIds(userId, "password");
      words = words.filter(word => !seenWordIds.includes(word.id));
    }
    
    res.json(words);
  });

  // Track shown words for authenticated users
  app.post("/api/password/words/mark-shown", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wordId } = req.body;
      await storage.addUserWordHistory({
        userId,
        gameType: "password",
        wordId,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking word as shown:", error);
      res.status(500).json({ message: "Failed to mark word as shown" });
    }
  });

  // Taboo endpoints
  app.get("/api/taboo/words", async (_req, res) => {
    const words = await storage.getTabooWords();
    res.json(words);
  });

  app.get("/api/taboo/categories", async (_req, res) => {
    const categories = await storage.getTabooCategories();
    res.json(categories);
  });

  app.post("/api/taboo/words/filter", async (req: any, res) => {
    const { difficulty, categories } = req.body;
    let words = await storage.getTabooWordsByFilter(difficulty, categories);
    
    // Filter out previously shown words for authenticated users
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const seenWordIds = await storage.getUserSeenWordIds(userId, "taboo");
      words = words.filter(word => !seenWordIds.includes(word.id));
    }
    
    res.json(words);
  });

  // Track shown words for authenticated users
  app.post("/api/taboo/words/mark-shown", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { wordId } = req.body;
      await storage.addUserWordHistory({
        userId,
        gameType: "taboo",
        wordId,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking word as shown:", error);
      res.status(500).json({ message: "Failed to mark word as shown" });
    }
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

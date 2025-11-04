import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gamesData } from "./games-data";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all games
  app.get("/api/games", (_req, res) => {
    res.json(gamesData);
  });

  const httpServer = createServer(app);

  return httpServer;
}

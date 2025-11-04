import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard } from "@/components/game-card";
import type { Game, GameCategory } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface GameGridProps {
  selectedCategory: GameCategory | "all";
}

export function GameGrid({ selectedCategory }: GameGridProps) {
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const filteredGames = selectedCategory === "all"
    ? games
    : games.filter((game) => game.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {filteredGames.map((game, index) => (
          <motion.div
            key={game.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
          >
            <GameCard game={game} index={index} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

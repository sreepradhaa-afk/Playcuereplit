import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";
import { gameCategories } from "@shared/schema";
import {
  Link,
  Palette,
  Globe,
  Brush,
  Drama,
  Lock,
  Ban,
  Radio,
  FileText,
  Users,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Link,
  palette: Palette,
  globe: Globe,
  brush: Brush,
  drama: Drama,
  lock: Lock,
  ban: Ban,
  radio: Radio,
  filetext: FileText,
  users: Users,
};

export function GameCard({ game }: { game: Game }) {
  const IconComponent = iconMap[game.icon] || Users;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full cursor-pointer hover-elevate active-elevate-2 overflow-hidden group" data-testid={`card-game-${game.id}`}>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-chart-2/30 transition-all duration-300">
                <IconComponent className="w-8 h-8 text-primary" />
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {gameCategories[game.category]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <h3 className="text-xl font-display font-semibold text-foreground" data-testid={`text-game-name-${game.id}`}>
            {game.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-game-description-${game.id}`}>
            {game.description}
          </p>

          <div className="pt-2">
            <motion.div
              className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300"
              whileHover={{ x: 4 }}
            >
              <span>Play now</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

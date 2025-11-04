import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Game } from "@shared/schema";
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

interface GameCardProps {
  game: Game;
  index: number;
}

export function GameCard({ game, index }: GameCardProps) {
  const IconComponent = iconMap[game.icon] || Users;
  const isPurple = index % 2 === 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card 
        className="h-full cursor-pointer hover-elevate active-elevate-2 overflow-hidden p-0 border-0"
        data-testid={`card-game-${game.id}`}
      >
        <div
          className={`
            h-full overflow-hidden relative
            ${isPurple 
              ? 'bg-gradient-to-br from-primary via-primary to-primary/90' 
              : 'bg-gradient-to-br from-chart-2 via-chart-2 to-chart-2/90'
            }
          `}
        >
          {/* Decorative circles in background */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/4 -translate-x-1/4" />
          
          <div className="relative z-10 p-6 md:p-8 space-y-6 h-full flex flex-col">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 flex-1">
              <h3 
                className="text-xl md:text-2xl font-display font-bold text-white" 
                data-testid={`text-game-name-${game.id}`}
              >
                {game.name}
              </h3>
              <p 
                className="text-sm md:text-base text-white/80 line-clamp-2" 
                data-testid={`text-game-description-${game.id}`}
              >
                {game.description}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

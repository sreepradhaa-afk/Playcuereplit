import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-foreground">
              PlayCue
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#games"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-games"
            >
              Games
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-about"
            >
              About
            </a>
            <a
              href="#how-to-play"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-how-to-play"
            >
              How to Play
            </a>
          </div>

          <Button variant="outline" size="sm" data-testid="button-login">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}

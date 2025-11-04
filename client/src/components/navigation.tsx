import { Button } from "@/components/ui/button";
import logoImage from "@assets/Playcue logo website_1762276856628.png";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="PlayCue Logo" 
              className="h-8 md:h-10 w-auto"
              data-testid="img-logo"
            />
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

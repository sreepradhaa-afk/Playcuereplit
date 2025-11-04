import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "wouter";
import logoImage from "@assets/Playcue logo website_1762276856628.png";
import { Brush, Drama, Lock, Link as LinkIcon, Palette, Globe, Ban, Radio, FileText, Users } from "lucide-react";

const gameCategories = [
  {
    title: "Play Alone",
    description: "Challenge yourself solo",
    games: [
      { id: "wordlink", name: "WordLink", icon: LinkIcon },
      { id: "colordle", name: "Colordle", icon: Palette },
      { id: "globetrix", name: "Globetrix", icon: Globe },
    ],
  },
  {
    title: "Play Together Offline",
    description: "Local party games",
    games: [
      { id: "pictionary", name: "Pictionary", icon: Brush },
      { id: "charades", name: "Charades", icon: Drama },
      { id: "password", name: "Password", icon: Lock },
      { id: "taboo", name: "Taboo", icon: Ban },
    ],
  },
  {
    title: "Join Room",
    description: "Play online with friends",
    games: [
      { id: "wavelength", name: "Wavelength", icon: Radio },
      { id: "blankslate", name: "Blankslate", icon: FileText },
      { id: "guess-the-imposter", name: "Guess the Imposter", icon: Users },
    ],
  },
];

export function Navigation() {
  const developedGames = ["pictionary", "charades", "password"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img 
                src={logoImage} 
                alt="PlayCue Logo" 
                className="h-8 md:h-10 w-auto"
                data-testid="img-logo"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger data-testid="button-games-dropdown">
                    Games
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-4">
                      <div className="grid grid-cols-3 gap-4">
                        {gameCategories.map((category) => (
                          <div key={category.title} className="space-y-3">
                            <div className="space-y-1">
                              <h4 className="text-sm font-display font-semibold">
                                {category.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {category.games.map((game) => {
                                const Icon = game.icon;
                                const href = developedGames.includes(game.id)
                                  ? `/game/${game.id}`
                                  : `/game/coming-soon/${game.id}`;
                                
                                return (
                                  <Link key={game.id} href={href}>
                                    <div
                                      className="flex items-center gap-2 p-2 rounded-md hover-elevate active-elevate-2 cursor-pointer"
                                      data-testid={`link-game-${game.id}`}
                                    >
                                      <Icon className="w-4 h-4 text-primary" />
                                      <span className="text-sm">{game.name}</span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/feedback">
              <span
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-feedback"
              >
                Feedback
              </span>
            </Link>
          </div>

          <Button variant="outline" size="sm" data-testid="button-login">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}

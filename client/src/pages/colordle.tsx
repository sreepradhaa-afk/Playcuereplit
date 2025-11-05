import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Info, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { ColordleGame } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Available colors matching backend COLORDLE_COLORS
const COLORDLE_COLORS = [
  { name: "Red", hex: "#FF0000", r: 255, g: 0, b: 0 },
  { name: "Blue", hex: "#0000FF", r: 0, g: 0, b: 255 },
  { name: "Green", hex: "#00FF00", r: 0, g: 255, b: 0 },
  { name: "Yellow", hex: "#FFFF00", r: 255, g: 255, b: 0 },
  { name: "Orange", hex: "#FFA500", r: 255, g: 165, b: 0 },
  { name: "Purple", hex: "#800080", r: 128, g: 0, b: 128 },
  { name: "Pink", hex: "#FFC0CB", r: 255, g: 192, b: 203 },
  { name: "Brown", hex: "#A52A2A", r: 165, g: 42, b: 42 },
  { name: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { name: "White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
  { name: "Cyan", hex: "#00FFFF", r: 0, g: 255, b: 255 },
  { name: "Magenta", hex: "#FF00FF", r: 255, g: 0, b: 255 },
  { name: "Lime", hex: "#BFFF00", r: 191, g: 255, b: 0 },
  { name: "Teal", hex: "#008080", r: 0, g: 128, b: 128 },
  { name: "Navy", hex: "#000080", r: 0, g: 0, b: 128 },
];

export default function Colordle() {
  useSEO({
    title: "Play Colordle Online | RGB Color Mixing Puzzle Game - PlayCue",
    description: "Play Colordle - mix 3 colors to match the target RGB! Guess the right color combination in 6 tries. Fun color mixing puzzle game!",
    keywords: "colordle, color mixing, RGB game, color puzzle, color guessing, daily puzzle",
  });

  const { toast } = useToast();
  const [game, setGame] = useState<ColordleGame | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/colordle/game");
      return await response.json() as ColordleGame;
    },
    onSuccess: (data) => {
      setGame(data);
      setCurrentGuess([]);
    },
  });

  const submitGuessMutation = useMutation({
    mutationFn: async (guess: { color1: string; color2: string; color3: string }) => {
      if (!game) throw new Error("No active game");
      const response = await apiRequest("POST", `/api/colordle/game/${game.id}/guess`, guess);
      return await response.json() as ColordleGame;
    },
    onSuccess: (data) => {
      setGame(data);
      setCurrentGuess([]);
      
      if (data.completed) {
        setShowResultDialog(true);
      }
    },
  });

  const handleStartGame = () => {
    createGameMutation.mutate();
  };

  const handleColorClick = (colorName: string) => {
    if (!game || game.completed) return;
    
    if (currentGuess.length < 3) {
      setCurrentGuess([...currentGuess, colorName]);
    }
  };

  const handleRemoveLastColor = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 3) {
      toast({
        title: "Select 3 colors",
        description: "Please select exactly 3 colors for your guess",
        variant: "destructive",
      });
      return;
    }

    submitGuessMutation.mutate({
      color1: currentGuess[0],
      color2: currentGuess[1],
      color3: currentGuess[2],
    });
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!game || game.completed) return;
      
      if (e.key === "Enter" && currentGuess.length === 3) {
        handleSubmitGuess();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleRemoveLastColor();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [game, currentGuess]);

  const getColorHex = (colorName: string) => {
    return COLORDLE_COLORS.find(c => c.name === colorName)?.hex || "#000000";
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "bg-green-500";
    if (accuracy >= 70) return "bg-yellow-500";
    if (accuracy >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <Link href="/" data-testid="link-home">
              <Button variant="ghost" className="hover-elevate" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowHowToPlay(true)}
              data-testid="button-how-to-play"
            >
              <Info className="mr-2 h-4 w-4" />
              How to Play
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-title">
              Colordle
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-description">
              Mix 3 colors to match the target RGB in 6 tries!
            </p>
          </div>
        </motion.div>

        {!game ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 max-w-md mx-auto">
              <div className="space-y-6 text-center">
                <p className="text-muted-foreground">
                  Start a new game to guess today's color combination!
                </p>
                <Button
                  onClick={handleStartGame}
                  className="w-full"
                  size="lg"
                  disabled={createGameMutation.isPending}
                  data-testid="button-start-game"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {createGameMutation.isPending ? "Starting..." : "Start Game"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Target Color Display */}
            <Card className="p-6">
              <h3 className="text-xl font-display font-semibold mb-4 text-center" data-testid="text-target-color-title">
                Target Color
              </h3>
              <div className="flex justify-center" data-testid="target-color-chart">
                <div 
                  className="w-48 h-48 rounded-full border-4 border-border flex items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: rgbToHex(game.targetRGB.r, game.targetRGB.g, game.targetRGB.b)
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium bg-background/80 px-3 py-1 rounded backdrop-blur-sm">
                      Match this color!
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-sm text-muted-foreground" data-testid="text-attempts">
                  Attempts: {game.guesses.length} / 6
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-primary via-purple-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(game.guesses.length / 6) * 100}%` }}
                    data-testid="progress-bar"
                  />
                </div>
              </div>
            </Card>

            {/* Previous Guesses Grid */}
            <Card className="p-6">
              <h3 className="text-xl font-display font-semibold mb-4" data-testid="text-previous-guesses-title">
                Your Guesses
              </h3>
              
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => {
                  const guess = game.guesses[index];
                  const isCurrentRow = index === game.guesses.length && !game.completed;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 ${isCurrentRow ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}
                      data-testid={`guess-row-${index}`}
                    >
                      <div className="flex-1 flex gap-2">
                        {guess ? (
                          <>
                            <div
                              className="flex-1 h-16 rounded-md border-2 border-border"
                              style={{ backgroundColor: getColorHex(guess.color1) }}
                              data-testid={`guess-${index}-color-1`}
                            />
                            <div
                              className="flex-1 h-16 rounded-md border-2 border-border"
                              style={{ backgroundColor: getColorHex(guess.color2) }}
                              data-testid={`guess-${index}-color-2`}
                            />
                            <div
                              className="flex-1 h-16 rounded-md border-2 border-border"
                              style={{ backgroundColor: getColorHex(guess.color3) }}
                              data-testid={`guess-${index}-color-3`}
                            />
                          </>
                        ) : isCurrentRow && currentGuess.length > 0 ? (
                          <>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-16 rounded-md ${
                                  currentGuess[i] 
                                    ? 'border-4 border-yellow-500' 
                                    : 'border-2 border-dashed border-muted-foreground/30 bg-muted'
                                }`}
                                style={currentGuess[i] ? { backgroundColor: getColorHex(currentGuess[i]) } : {}}
                                data-testid={`current-guess-slot-${i}`}
                              />
                            ))}
                          </>
                        ) : (
                          <>
                            <div className="flex-1 h-16 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted" />
                            <div className="flex-1 h-16 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted" />
                            <div className="flex-1 h-16 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted" />
                          </>
                        )}
                      </div>
                      
                      {guess && (
                        <div 
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAccuracyColor(guess.accuracy)}`}
                          data-testid={`guess-${index}-accuracy`}
                        >
                          {guess.accuracy.toFixed(1)}%
                        </div>
                      )}
                      
                      {!guess && !isCurrentRow && (
                        <div className="w-16 h-16" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Current Selection and Controls */}
            {!game.completed && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-display font-semibold" data-testid="text-current-selection-title">
                    Current Selection ({currentGuess.length}/3)
                  </h3>
                  {currentGuess.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLastColor}
                      data-testid="button-remove-last"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Last
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 mb-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-20 rounded-lg flex items-center justify-center ${
                        currentGuess[i] 
                          ? 'border-4 border-yellow-500' 
                          : 'border-2 border-dashed border-muted-foreground/30 bg-muted'
                      }`}
                      style={currentGuess[i] ? { backgroundColor: getColorHex(currentGuess[i]) } : {}}
                      data-testid={`selection-slot-${i}`}
                    >
                      {!currentGuess[i] && (
                        <span className="text-muted-foreground font-semibold">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmitGuess}
                  className="w-full"
                  size="lg"
                  disabled={submitGuessMutation.isPending || currentGuess.length !== 3}
                  data-testid="button-submit-guess"
                >
                  ENTER
                </Button>
              </Card>
            )}

            {/* Color Palette */}
            {!game.completed && (
              <Card className="p-6">
                <h3 className="text-xl font-display font-semibold mb-4" data-testid="text-color-palette-title">
                  Color Palette
                </h3>
                
                <div className="grid grid-cols-5 gap-3">
                  {COLORDLE_COLORS.map((color) => {
                    const isSelected = currentGuess.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleColorClick(color.name)}
                        className={`aspect-square rounded-lg hover-elevate active-elevate-2 transition-all ${
                          isSelected ? 'ring-4 ring-yellow-500 ring-offset-2' : 'border-2 border-border'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        data-testid={`color-${color.name.toLowerCase()}`}
                        disabled={currentGuess.length >= 3 && !isSelected}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Click colors to add them to your guess. Press Backspace to remove the last color.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent data-testid="dialog-how-to-play">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold" data-testid="text-how-to-play-title">
              How to Play Colordle
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-foreground">
                Your goal is to mix 3 colors to match the target RGB color shown at the top. You have 6 attempts to get as close as possible!
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">How It Works:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Click 3 colors from the palette to create your guess</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">2.</span>
                      <span>The game mixes your 3 colors equally (33.33% each) into a single RGB color</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">3.</span>
                      <span>You get an accuracy score showing how close your mixed color is to the target</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Win by getting 95% accuracy or higher!</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Tips:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Look at the target color carefully - is it warm or cool?</li>
                    <li>• Try different combinations to see how colors mix</li>
                    <li>• Use your previous guesses to guide your next attempt</li>
                    <li>• Remember: mixing colors in RGB is different from mixing paint!</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent data-testid="dialog-result">
          <DialogHeader>
            <DialogTitle className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4" data-testid="text-result-title">
                {game?.won ? "🎉 You Won!" : "Game Over"}
              </h2>
            </DialogTitle>
            <DialogDescription className="text-center space-y-4">
              {game?.won ? (
                <div>
                  <p className="text-foreground text-lg mb-4">
                    Congratulations! You matched the target color with {game.guesses[game.guesses.length - 1].accuracy.toFixed(1)}% accuracy!
                  </p>
                  <p className="text-muted-foreground">
                    You solved it in {game.guesses.length} {game.guesses.length === 1 ? 'guess' : 'guesses'}!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-foreground text-lg mb-4">
                    Nice try! The target color was:
                  </p>
                  {game?.targetRGB && (
                    <div className="flex justify-center mb-4">
                      <div 
                        className="w-32 h-32 rounded-lg border-4 border-border"
                        style={{ backgroundColor: rgbToHex(game.targetRGB.r, game.targetRGB.g, game.targetRGB.b) }}
                        data-testid="revealed-target-color"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Your best accuracy was {game && game.guesses.length > 0 ? Math.max(...game.guesses.map(g => g.accuracy)).toFixed(1) : 0}%
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    setShowResultDialog(false);
                    handleStartGame();
                  }}
                  className="flex-1"
                  size="lg"
                  data-testid="button-play-again"
                >
                  Play Again
                </Button>
                <Link href="/" className="flex-1" data-testid="link-home-dialog">
                  <Button variant="outline" className="w-full" size="lg" data-testid="button-home">
                    Home
                  </Button>
                </Link>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

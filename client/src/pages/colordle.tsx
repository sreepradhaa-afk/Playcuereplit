import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Send, Info } from "lucide-react";
import { Link } from "wouter";
import type { ColordleGame, ColordleGuess } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Green", hex: "#22C55E" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Lime", hex: "#84CC16" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Brown", hex: "#92400E" },
  { name: "Navy", hex: "#1E3A8A" },
];

export default function Colordle() {
  useSEO({
    title: "Play Colordle Online | Color Combination Puzzle Game - PlayCue",
    description: "Play Colordle - guess the 3-color combination in 6 tries! Identify which colors are in the mix and their correct order. Fun Wordle-style color puzzle game!",
    keywords: "colordle, color game, puzzle game, color guessing, wordle colors, daily puzzle, guess the color",
  });

  const { toast } = useToast();
  const [game, setGame] = useState<ColordleGame | null>(null);
  const [selectedColor1, setSelectedColor1] = useState<string>("");
  const [selectedColor2, setSelectedColor2] = useState<string>("");
  const [selectedColor3, setSelectedColor3] = useState<string>("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/colordle/game");
      return await response.json() as ColordleGame;
    },
    onSuccess: (data) => {
      setGame(data);
      setSelectedColor1("");
      setSelectedColor2("");
      setSelectedColor3("");
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
      setSelectedColor1("");
      setSelectedColor2("");
      setSelectedColor3("");
      
      if (data.completed) {
        setShowResultDialog(true);
      }
    },
  });

  const handleStartGame = () => {
    createGameMutation.mutate();
  };

  const handleSubmitGuess = () => {
    if (!selectedColor1 || !selectedColor2 || !selectedColor3) {
      toast({
        title: "Select all colors",
        description: "Please select 3 different colors for your guess",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate colors
    const colors = [selectedColor1, selectedColor2, selectedColor3];
    const uniqueColors = new Set(colors);
    if (uniqueColors.size !== 3) {
      toast({
        title: "Colors must be unique",
        description: "Please select 3 different colors",
        variant: "destructive",
      });
      return;
    }

    submitGuessMutation.mutate({
      color1: selectedColor1,
      color2: selectedColor2,
      color3: selectedColor3,
    });
  };

  const getColorHex = (colorName: string) => {
    return AVAILABLE_COLORS.find(c => c.name === colorName)?.hex || "#000000";
  };

  const getFeedbackBorderClass = (feedback: 'correct' | 'wrong-position' | 'wrong') => {
    if (feedback === 'correct') return 'border-4 border-green-500';
    if (feedback === 'wrong-position') return 'border-4 border-yellow-500';
    return 'border-2 border-border';
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
              Guess the 3-color combination in the correct order within 6 tries!
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
            <Card className="p-6">
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground mb-2" data-testid="text-attempts">
                  Attempts: {game.guesses.length} / 6
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary via-purple-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(game.guesses.length / 6) * 100}%` }}
                    data-testid="progress-bar"
                  />
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-display font-semibold" data-testid="text-your-guess-title">
                  Your Guess
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="label-color-1">
                      Color 1
                    </label>
                    <Select value={selectedColor1} onValueChange={setSelectedColor1}>
                      <SelectTrigger className="w-full" data-testid="select-color-1">
                        <SelectValue placeholder="Select first color" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_COLORS.map((color) => (
                          <SelectItem key={color.name} value={color.name} data-testid={`option-color-1-${color.name.toLowerCase()}`}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="label-color-2">
                      Color 2
                    </label>
                    <Select value={selectedColor2} onValueChange={setSelectedColor2}>
                      <SelectTrigger className="w-full" data-testid="select-color-2">
                        <SelectValue placeholder="Select second color" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_COLORS.map((color) => (
                          <SelectItem key={color.name} value={color.name} data-testid={`option-color-2-${color.name.toLowerCase()}`}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" data-testid="label-color-3">
                      Color 3
                    </label>
                    <Select value={selectedColor3} onValueChange={setSelectedColor3}>
                      <SelectTrigger className="w-full" data-testid="select-color-3">
                        <SelectValue placeholder="Select third color" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_COLORS.map((color) => (
                          <SelectItem key={color.name} value={color.name} data-testid={`option-color-3-${color.name.toLowerCase()}`}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedColor1 && selectedColor2 && selectedColor3 && (
                  <div className="flex gap-2 p-4 bg-muted rounded-lg" data-testid="preview-selected-colors">
                    <div
                      className="flex-1 h-16 rounded"
                      style={{ backgroundColor: getColorHex(selectedColor1) }}
                      data-testid="preview-color-1"
                    />
                    <div
                      className="flex-1 h-16 rounded"
                      style={{ backgroundColor: getColorHex(selectedColor2) }}
                      data-testid="preview-color-2"
                    />
                    <div
                      className="flex-1 h-16 rounded"
                      style={{ backgroundColor: getColorHex(selectedColor3) }}
                      data-testid="preview-color-3"
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmitGuess}
                  className="w-full"
                  size="lg"
                  disabled={submitGuessMutation.isPending || game.completed || !selectedColor1 || !selectedColor2 || !selectedColor3}
                  data-testid="button-submit-guess"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Submit Guess
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-display font-semibold" data-testid="text-previous-guesses-title">
                  Previous Guesses
                </h3>
                
                {game.guesses.length === 0 ? (
                  <Card className="p-6">
                    <p className="text-center text-muted-foreground" data-testid="text-no-guesses">
                      No guesses yet. Make your first guess!
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {game.guesses.map((guess, index) => (
                      <Card key={index} className="p-4" data-testid={`guess-${index}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium" data-testid={`guess-number-${index}`}>
                            Guess {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Accuracy:</span>
                            <div className="px-3 py-1 rounded-full bg-primary/20 text-primary font-bold" data-testid={`guess-accuracy-${index}`}>
                              {guess.accuracy}%
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div
                            className={`flex-1 h-12 rounded ${getFeedbackBorderClass(guess.feedback.color1)}`}
                            style={{ backgroundColor: getColorHex(guess.color1) }}
                            title={guess.feedback.color1}
                            data-testid={`guess-${index}-color-1`}
                          />
                          <div
                            className={`flex-1 h-12 rounded ${getFeedbackBorderClass(guess.feedback.color2)}`}
                            style={{ backgroundColor: getColorHex(guess.color2) }}
                            title={guess.feedback.color2}
                            data-testid={`guess-${index}-color-2`}
                          />
                          <div
                            className={`flex-1 h-12 rounded ${getFeedbackBorderClass(guess.feedback.color3)}`}
                            style={{ backgroundColor: getColorHex(guess.color3) }}
                            title={guess.feedback.color3}
                            data-testid={`guess-${index}-color-3`}
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground text-center" data-testid={`guess-${index}-feedback-legend`}>
                          <span className="text-green-500">●</span> Correct position
                          <span className="mx-2">|</span>
                          <span className="text-yellow-500">●</span> Wrong position
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                Guess the secret 3-color combination in 6 tries. You need to identify which 3 colors are in the mix AND their correct order (positions 1, 2, and 3).
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Feedback System:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border-4 border-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Green border:</strong> Correct color in the correct position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border-4 border-yellow-500 mt-1 flex-shrink-0" />
                      <span><strong>Yellow border:</strong> Correct color but in the wrong position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border-2 border-muted mt-1 flex-shrink-0" />
                      <span><strong>No highlight:</strong> Color not in the target combination</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Accuracy Score:</h4>
                  <p className="text-sm">
                    Each guess shows an accuracy percentage based on how many colors you got right and how many are in correct positions. 100% means you won!
                  </p>
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
                  <p className="text-lg mb-4" data-testid="text-won-message">
                    Congratulations! You found the color combination in {game.guesses.length} {game.guesses.length === 1 ? 'try' : 'tries'}!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-4" data-testid="text-lost-message">
                    Better luck next time! The target combination was:
                  </p>
                  {game && (
                    <div className="flex gap-2 justify-center mb-4" data-testid="revealed-colors">
                      <div
                        className="w-16 h-16 rounded border-2 border-border"
                        style={{ backgroundColor: getColorHex(game.targetColor.color1) }}
                        title={game.targetColor.color1}
                      />
                      <div
                        className="w-16 h-16 rounded border-2 border-border"
                        style={{ backgroundColor: getColorHex(game.targetColor.color2) }}
                        title={game.targetColor.color2}
                      />
                      <div
                        className="w-16 h-16 rounded border-2 border-border"
                        style={{ backgroundColor: getColorHex(game.targetColor.color3) }}
                        title={game.targetColor.color3}
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3">
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

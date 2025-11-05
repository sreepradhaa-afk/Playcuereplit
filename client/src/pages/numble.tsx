import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Info, Delete } from "lucide-react";
import { Link } from "wouter";
import type { NumbleGame } from "@shared/schema";
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

type GameState = "setup" | "playing";

export default function Numble() {
  useSEO({
    title: "Play Numble Online | Number Guessing Puzzle Game - PlayCue",
    description: "Play Numble - guess the secret number code in 6 tries! Wordle-style feedback for numbers. Choose 3-6 digit codes. Fun number puzzle game!",
    keywords: "numble, number game, number puzzle, wordle numbers, code breaking, number guessing",
  });

  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [codeLength, setCodeLength] = useState<number>(4);
  const [game, setGame] = useState<NumbleGame | null>(null);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async (length: number) => {
      const response = await apiRequest("POST", "/api/numble/game", { codeLength: length });
      return await response.json() as NumbleGame;
    },
    onSuccess: (data) => {
      setGame(data);
      setCurrentGuess("");
      setGameState("playing");
    },
  });

  const submitGuessMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!game) throw new Error("No active game");
      const response = await apiRequest("POST", `/api/numble/game/${game.id}/guess`, { code });
      return await response.json() as NumbleGame;
    },
    onSuccess: (data) => {
      setGame(data);
      setCurrentGuess("");
      
      if (data.completed) {
        setShowResultDialog(true);
      }
    },
  });

  const handleStartGame = () => {
    createGameMutation.mutate(codeLength);
  };

  const handleDigitClick = (digit: number) => {
    if (!game || game.completed || currentGuess.length >= game.codeLength) return;
    setCurrentGuess(currentGuess + digit.toString());
  };

  const handleBackspace = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleSubmitGuess = () => {
    if (!game || currentGuess.length !== game.codeLength) {
      toast({
        title: "Invalid guess",
        description: `Please enter exactly ${game?.codeLength} digits`,
        variant: "destructive",
      });
      return;
    }

    submitGuessMutation.mutate(currentGuess);
  };

  const handlePlayAgain = () => {
    setShowResultDialog(false);
    setGameState("setup");
    setGame(null);
    setCurrentGuess("");
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!game || game.completed || gameState !== "playing") return;
      
      if (e.key >= '0' && e.key <= '9') {
        handleDigitClick(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter" && currentGuess.length === game.codeLength) {
        handleSubmitGuess();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [game, currentGuess, gameState]);

  const getFeedbackColor = (feedback: 'correct' | 'wrong-position' | 'wrong') => {
    switch (feedback) {
      case 'correct':
        return 'border-green-500 bg-green-500/10';
      case 'wrong-position':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'wrong':
        return 'border-gray-400 bg-gray-400/10';
    }
  };

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
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
                Numble
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-description">
                Guess the secret number code in 6 tries!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-semibold text-center">
                    Select Code Length
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 4, 5, 6].map((length) => (
                      <Button
                        key={length}
                        variant={codeLength === length ? "default" : "outline"}
                        onClick={() => setCodeLength(length)}
                        className="h-16 text-lg font-semibold"
                        data-testid={`button-code-length-${length}`}
                      >
                        {length}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {codeLength} digits selected
                  </p>
                </div>

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
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              onClick={handlePlayAgain}
              className="hover-elevate"
              data-testid="button-back-to-setup"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Game
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHowToPlay(true)}
              data-testid="button-how-to-play-game"
            >
              <Info className="mr-2 h-4 w-4" />
              How to Play
            </Button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-game-title">
              Numble - {game.codeLength} Digits
            </h1>
            <p className="text-muted-foreground" data-testid="text-attempts">
              Attempts: {game.guesses.length} / 6
            </p>
            <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-primary via-purple-500 to-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${(game.guesses.length / 6) * 100}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Guess Grid */}
          <Card className="p-6">
            <h3 className="text-xl font-display font-semibold mb-4" data-testid="text-guesses-title">
              Your Guesses
            </h3>
            
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, rowIndex) => {
                const guess = game.guesses[rowIndex];
                const isCurrentRow = rowIndex === game.guesses.length && !game.completed;
                
                return (
                  <div 
                    key={rowIndex} 
                    className={`flex gap-2 justify-center ${isCurrentRow ? 'ring-2 ring-primary rounded-lg p-2' : ''}`}
                    data-testid={`text-guess-row-${rowIndex}`}
                  >
                    {Array.from({ length: game.codeLength }).map((_, digitIndex) => {
                      const digit = guess?.code[digitIndex];
                      const feedback = guess?.feedback[digitIndex];
                      const currentDigit = isCurrentRow ? currentGuess[digitIndex] : null;
                      
                      return (
                        <div
                          key={digitIndex}
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-md flex items-center justify-center text-2xl font-bold transition-all ${
                            digit && feedback
                              ? `border-4 ${getFeedbackColor(feedback)}`
                              : currentDigit
                              ? 'border-4 border-primary bg-primary/10'
                              : 'border-2 border-dashed border-muted-foreground/30 bg-muted'
                          }`}
                          data-testid={`guess-${rowIndex}-digit-${digitIndex}`}
                        >
                          {digit || currentDigit || ''}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Current Input Display */}
          {!game.completed && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold" data-testid="text-current-guess-title">
                  Current Guess ({currentGuess.length}/{game.codeLength})
                </h3>
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {Array.from({ length: game.codeLength }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center text-3xl font-bold ${
                      currentGuess[i] 
                        ? 'border-4 border-primary bg-primary/10' 
                        : 'border-2 border-dashed border-muted-foreground/30 bg-muted'
                    }`}
                    data-testid={`current-digit-${i}`}
                  >
                    {currentGuess[i] || ''}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSubmitGuess}
                className="w-full"
                size="lg"
                disabled={submitGuessMutation.isPending || currentGuess.length !== game.codeLength}
                data-testid="button-submit-guess"
              >
                ENTER
              </Button>
            </Card>
          )}

          {/* Number Pad */}
          {!game.completed && (
            <Card className="p-6">
              <h3 className="text-xl font-display font-semibold mb-4 text-center">
                Number Pad
              </h3>
              
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <Button
                    key={digit}
                    variant="outline"
                    onClick={() => handleDigitClick(digit)}
                    className="h-16 text-2xl font-bold hover-elevate active-elevate-2"
                    disabled={currentGuess.length >= game.codeLength}
                    data-testid={`button-digit-${digit}`}
                  >
                    {digit}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={handleBackspace}
                  className="h-16 hover-elevate active-elevate-2"
                  disabled={currentGuess.length === 0}
                  data-testid="button-backspace"
                >
                  <Delete className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDigitClick(0)}
                  className="h-16 text-2xl font-bold hover-elevate active-elevate-2"
                  disabled={currentGuess.length >= game.codeLength}
                  data-testid="button-digit-0"
                >
                  0
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Use number keys or click digits. Press Backspace to remove. Press Enter to submit.
              </p>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showHowToPlay} onOpenChange={setShowHowToPlay}>
        <DialogContent data-testid="dialog-how-to-play">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold" data-testid="text-how-to-play-title">
              How to Play Numble
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-foreground">
                Guess the secret number code in 6 attempts. Each guess gives you colored feedback!
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">How It Works:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Choose a code length (3-6 digits) and start the game</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Enter your guess using the number pad or keyboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">3.</span>
                      <span>After each guess, you'll see colored borders showing feedback</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Feedback Colors:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-4 border-green-500 bg-green-500/10"></div>
                      <span><strong>Green:</strong> Correct digit in correct position</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-4 border-yellow-500 bg-yellow-500/10"></div>
                      <span><strong>Yellow:</strong> Correct digit in wrong position</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border-4 border-gray-400 bg-gray-400/10"></div>
                      <span><strong>Gray:</strong> Digit not in the code</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Tips:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Use your first guess to test different digits</li>
                    <li>• Pay attention to which digits appear in yellow - they're correct but misplaced</li>
                    <li>• You have 6 attempts to crack the code</li>
                    <li>• Use keyboard shortcuts: number keys, Backspace, and Enter</li>
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
                {game.won ? "🎉 You Won!" : "Game Over"}
              </h2>
            </DialogTitle>
            <DialogDescription className="text-center space-y-4">
              <AnimatePresence mode="wait">
                {game.won ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <p className="text-foreground text-lg mb-4">
                      Congratulations! You cracked the code!
                    </p>
                    <p className="text-muted-foreground">
                      You solved it in {game.guesses.length} {game.guesses.length === 1 ? 'guess' : 'guesses'}!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <p className="text-foreground text-lg mb-4">
                      Nice try! The secret code was:
                    </p>
                    {game.targetCode && (
                      <div className="flex gap-2 justify-center mb-4">
                        {game.targetCode.split('').map((digit, i) => (
                          <div 
                            key={i}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-4 border-primary bg-primary/20 flex items-center justify-center text-2xl font-bold"
                            data-testid={`revealed-digit-${i}`}
                          >
                            {digit}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      Better luck next time!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handlePlayAgain}
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

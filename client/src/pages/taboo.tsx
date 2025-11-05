import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, SkipForward, Timer, Check, Trophy } from "lucide-react";
import { Link } from "wouter";
import type { TabooWord } from "@shared/schema";
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
type Difficulty = "easy" | "medium" | "hard";

export default function Taboo() {
  useSEO({
    title: "Play Taboo Online | Word Description Party Game - PlayCue",
    description: "Play Taboo online! Describe words without using forbidden taboo words. Perfect party game with timed rounds and scoring. Challenge your vocabulary skills now!",
    keywords: "taboo game, word game, party games, family games, describe words, forbidden words",
  });

  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [wordCount, setWordCount] = useState<number>(10);
  const [filteredWords, setFilteredWords] = useState<TabooWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [showScoreDialog, setShowScoreDialog] = useState(false);

  const { data: allWords = [] } = useQuery<TabooWord[]>({
    queryKey: ["/api/taboo/words"],
  });

  // Shuffle and select words when game starts
  const handleStartGame = () => {
    if (allWords.length === 0) {
      toast({
        title: "No words available",
        description: "Please wait for words to load.",
        variant: "destructive",
      });
      return;
    }

    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, wordCount);
    setFilteredWords(selected);
    setCurrentWordIndex(0);
    setScore(0);
    setTimeLeft(60);
    setGameState("playing");
    setIsTimerRunning(true);
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleGameEnd = () => {
    setIsTimerRunning(false);
    setShowScoreDialog(true);
  };

  const handleCorrect = () => {
    const points = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15;
    setScore(score + points);
    
    if (currentWordIndex + 1 < filteredWords.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      handleGameEnd();
    }
  };

  const handleSkip = () => {
    if (currentWordIndex + 1 < filteredWords.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      handleGameEnd();
    }
  };

  const handlePlayAgain = () => {
    setShowScoreDialog(false);
    setGameState("setup");
  };

  const currentWord = filteredWords[currentWordIndex];
  const progress = filteredWords.length > 0 
    ? ((currentWordIndex + 1) / filteredWords.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" data-testid="link-home">
            <Button variant="ghost" className="mb-6 hover-elevate" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-title">
              Taboo
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-description">
              Describe the word without using the forbidden taboo words!
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === "setup" ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-semibold mb-4" data-testid="text-setup-title">
                      Game Settings
                    </h2>
                    <p className="text-muted-foreground mb-6" data-testid="text-instructions">
                      Choose your difficulty and how many words you want to play with. You'll have 60 seconds to describe as many as you can!
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3" data-testid="label-difficulty">
                        Difficulty
                      </label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={difficulty === "easy" ? "default" : "outline"}
                          onClick={() => setDifficulty("easy")}
                          className="flex-1"
                          data-testid="button-difficulty-easy"
                        >
                          Easy (5 pts)
                        </Button>
                        <Button
                          type="button"
                          variant={difficulty === "medium" ? "default" : "outline"}
                          onClick={() => setDifficulty("medium")}
                          className="flex-1"
                          data-testid="button-difficulty-medium"
                        >
                          Medium (10 pts)
                        </Button>
                        <Button
                          type="button"
                          variant={difficulty === "hard" ? "default" : "outline"}
                          onClick={() => setDifficulty("hard")}
                          className="flex-1"
                          data-testid="button-difficulty-hard"
                        >
                          Hard (15 pts)
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" data-testid="label-word-count">
                        Number of Words
                      </label>
                      <Select
                        value={wordCount.toString()}
                        onValueChange={(value) => setWordCount(parseInt(value))}
                      >
                        <SelectTrigger className="w-full" data-testid="select-word-count">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5" data-testid="option-word-count-5">5 Words</SelectItem>
                          <SelectItem value="10" data-testid="option-word-count-10">10 Words</SelectItem>
                          <SelectItem value="15" data-testid="option-word-count-15">15 Words</SelectItem>
                          <SelectItem value="20" data-testid="option-word-count-20">20 Words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartGame}
                    className="w-full"
                    size="lg"
                    data-testid="button-start-game"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold font-display" data-testid="text-timer">
                        {timeLeft}s
                      </span>
                    </div>
                    <div className="text-lg" data-testid="text-score">
                      Score: <span className="font-bold text-primary">{score}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid="text-progress">
                    {currentWordIndex + 1} / {filteredWords.length}
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-6">
                  <div
                    className="bg-gradient-to-r from-primary via-purple-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    data-testid="progress-bar"
                  />
                </div>
              </Card>

              {currentWord && (
                <motion.div
                  key={currentWord.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-12">
                    <div className="text-center space-y-8">
                      <div>
                        <h3 className="text-6xl md:text-7xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-cue-word">
                          {currentWord.cueWord}
                        </h3>
                      </div>

                      <div className="border-t border-b border-border py-6">
                        <h4 className="text-xl font-semibold mb-4 text-destructive" data-testid="text-taboo-label">
                          Don't Say:
                        </h4>
                        <div className="space-y-3">
                          {currentWord.tabooWords.map((word, index) => (
                            <div
                              key={index}
                              className="text-2xl font-medium text-muted-foreground"
                              data-testid={`text-taboo-word-${index}`}
                            >
                              {word}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      size="lg"
                      className="text-lg"
                      data-testid="button-skip"
                    >
                      <SkipForward className="mr-2 h-5 w-5" />
                      Skip
                    </Button>
                    <Button
                      onClick={handleCorrect}
                      size="lg"
                      className="text-lg"
                      data-testid="button-correct"
                    >
                      <Check className="mr-2 h-5 w-5" />
                      Got It!
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent data-testid="dialog-score">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-orange-500/20">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-display font-bold" data-testid="text-final-score-title">
                Game Over!
              </h2>
            </DialogTitle>
            <DialogDescription className="text-center space-y-4">
              <div className="py-6">
                <div className="text-5xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-final-score">
                  {score} points
                </div>
                <p className="text-muted-foreground mt-2" data-testid="text-words-completed">
                  You got {Math.round(score / (difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15))} words correct!
                </p>
              </div>
              <div className="flex gap-3">
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

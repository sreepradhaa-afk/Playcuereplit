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
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, SkipForward, RotateCcw, Timer } from "lucide-react";
import { Link } from "wouter";
import type { PictionaryWord, PictionaryDifficulty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type GameState = "setup" | "playing";

export default function Pictionary() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [difficulty, setDifficulty] = useState<PictionaryDifficulty | "All">("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredWords, setFilteredWords] = useState<PictionaryWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/pictionary/categories"],
  });

  const filterWordsMutation = useMutation({
    mutationFn: async (params: { difficulty: PictionaryDifficulty | "All"; categories: string[] }) => {
      const response = await apiRequest("POST", "/api/pictionary/words/filter", params);
      return await response.json() as PictionaryWord[];
    },
    onSuccess: (data) => {
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setFilteredWords(shuffled);
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePlayNow = async () => {
    if (categories.length === 0) {
      toast({
        title: "Loading categories",
        description: "Please wait for categories to load before starting the game.",
        variant: "destructive",
      });
      return;
    }

    const result = await filterWordsMutation.mutateAsync({
      difficulty,
      categories: selectedCategories.length > 0 ? selectedCategories : categories,
    });

    if (result.length === 0) {
      toast({
        title: "No words found",
        description: "No words match your selected filters. Please try different difficulty or categories.",
        variant: "destructive",
      });
      return;
    }

    setGameState("playing");
    setCurrentWordIndex(0);
    setTimeLeft(60);
    setIsTimerRunning(true);
  };

  const handleNextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setTimeLeft(60);
    }
  };

  const handleEndGame = () => {
    setGameState("setup");
    setIsTimerRunning(false);
    setCurrentWordIndex(0);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent" data-testid="text-game-title">
              Pictionary
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-game-subtitle">
              Draw and guess! One player draws while others guess the word.
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-semibold">How to Play</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">1.</span>
                  <span>Choose difficulty level and categories you want to play with</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">2.</span>
                  <span>Click "Play Now" to start the game</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">3.</span>
                  <span>The drawer sees the word and has 60 seconds to draw it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">4.</span>
                  <span>Other players try to guess what's being drawn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">5.</span>
                  <span>Click "Next Word" to move to the next word</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="difficulty-select">
                  Difficulty Level
                </label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as PictionaryDifficulty | "All")}>
                  <SelectTrigger id="difficulty-select" data-testid="select-difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Categories {selectedCategories.length > 0 && `(${selectedCategories.length} selected)`}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 rounded-md border">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        data-testid={`checkbox-category-${category}`}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedCategories.length === 0 ? "All categories will be included" : ""}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handlePlayNow}
              disabled={filterWordsMutation.isPending}
              data-testid="button-play-now"
            >
              <Play className="w-5 h-5 mr-2" />
              {filterWordsMutation.isPending ? "Loading..." : "Play Now"}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const currentWord = filteredWords[currentWordIndex];

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-display font-semibold">No words available</h2>
          <p className="text-muted-foreground">Something went wrong. Please go back and try again.</p>
          <Button onClick={handleEndGame} data-testid="button-back-to-setup">
            Back to Setup
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-5 h-5" />
            <span className="text-2xl font-mono font-semibold" data-testid="text-timer">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground" data-testid="text-word-count">
            Word {currentWordIndex + 1} of {filteredWords.length}
          </div>
        </div>

        <Card className="p-12 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold" data-testid="badge-difficulty">
                {currentWord.difficulty}
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent" data-testid="text-current-word">
                {currentWord.word}
              </h2>
              <p className="text-lg text-muted-foreground" data-testid="text-category">
                {currentWord.category}
              </p>
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handleEndGame}
            data-testid="button-end-game"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            End Game
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleNextWord}
            disabled={currentWordIndex >= filteredWords.length - 1}
            data-testid="button-next-word"
          >
            Next Word
            <SkipForward className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

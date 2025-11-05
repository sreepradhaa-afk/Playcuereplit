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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, SkipForward, Timer, Check, ChevronDown, Trophy } from "lucide-react";
import { Link } from "wouter";
import type { PasswordWord, PasswordDifficulty } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/useAuth";

type GameState = "setup" | "playing";

export default function Password() {
  useSEO({
    title: "Play Password Game Online | Word Clue Party Game - PlayCue",
    description: "Play the Password game online! Give one-word clues to help your partner guess the secret word. Perfect party game with 15 categories and multiple difficulty levels.",
    keywords: "password game, word game, clue game, party games, family games, guessing game",
  });

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [difficulty, setDifficulty] = useState<PasswordDifficulty | "All">("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState<number>(10);
  const [filteredWords, setFilteredWords] = useState<PasswordWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Track shown words for authenticated users
  const markWordShownMutation = useMutation({
    mutationFn: async (wordId: string) => {
      const response = await apiRequest("POST", "/api/password/words/mark-shown", { wordId });
      return await response.json();
    },
  });

  // Track word when shown
  useEffect(() => {
    if (gameState === "playing" && filteredWords.length > 0 && isAuthenticated) {
      const currentWord = filteredWords[currentWordIndex];
      if (currentWord) {
        markWordShownMutation.mutate(currentWord.id);
      }
    }
  }, [currentWordIndex, gameState, filteredWords, isAuthenticated]);

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/password/categories"],
  });

  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(categories);
    }
  }, [categories, selectedCategories.length]);

  const filterWordsMutation = useMutation({
    mutationFn: async (params: { difficulty: PasswordDifficulty | "All"; categories: string[] }) => {
      const response = await apiRequest("POST", "/api/password/words/filter", params);
      return await response.json() as PasswordWord[];
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      toast({
        title: "Time's Up!",
        description: `You scored ${score} points`,
      });
      setTimeout(() => {
        handleEndGame();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, score]);

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
      categories: selectedCategories,
    });

    if (result.length === 0) {
      toast({
        title: "No words found",
        description: "No words match your selected filters. Please try different difficulty or categories.",
        variant: "destructive",
      });
      return;
    }

    const shuffled = [...result].sort(() => Math.random() - 0.5);
    const limitedWords = shuffled.slice(0, wordCount);
    setFilteredWords(limitedWords);

    setGameState("playing");
    setCurrentWordIndex(0);
    setScore(0);
    setTimeLeft(60);
    setIsTimerRunning(true);
  };

  const handleGotRight = () => {
    const points = currentWord.difficulty === "Easy" ? 5 : currentWord.difficulty === "Medium" ? 10 : 15;
    const newScore = score + points;
    setScore(newScore);
    advanceToNextWord(newScore);
  };

  const handleSkip = () => {
    advanceToNextWord(score);
  };

  const advanceToNextWord = (finalScore: number) => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setIsTimerRunning(false);
      toast({
        title: "Game Complete!",
        description: `You scored ${finalScore} points`,
      });
      setTimeout(() => {
        handleEndGame();
      }, 2000);
    }
  };

  const handleEndGame = () => {
    setGameState("setup");
    setIsTimerRunning(false);
    setCurrentWordIndex(0);
    setScore(0);
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
            <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Password
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Give one-word clues to help your partner guess the secret word!
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-semibold">How to Play</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">1.</span>
                  <span>Choose difficulty level, categories, and number of words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">2.</span>
                  <span>Click "Play Now" to start the game</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">3.</span>
                  <span>You have 1 minute total to complete all words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">4.</span>
                  <span>One player gives one-word clues while the other guesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-semibold">5.</span>
                  <span>Click "Got Right" or "Skip" to move to the next word</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="difficulty-select">
                  Difficulty Level
                </label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as PasswordDifficulty | "All")}>
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
                  Categories ({selectedCategories.length} selected)
                </label>
                <Popover open={categoryDropdownOpen} onOpenChange={setCategoryDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      data-testid="button-category-dropdown"
                    >
                      <span className="text-sm">
                        {selectedCategories.length === 0 
                          ? "Select categories" 
                          : selectedCategories.length === categories.length
                          ? "All categories selected"
                          : `${selectedCategories.length} selected`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="max-h-64 overflow-y-auto p-4 space-y-2">
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
                            className="text-sm cursor-pointer flex-1"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="word-count-select">
                  Number of Words
                </label>
                <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(parseInt(value))}>
                  <SelectTrigger id="word-count-select" data-testid="select-word-count">
                    <SelectValue placeholder="Select number of words" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 words</SelectItem>
                    <SelectItem value="10">10 words</SelectItem>
                    <SelectItem value="15">15 words</SelectItem>
                    <SelectItem value="20">20 words</SelectItem>
                  </SelectContent>
                </Select>
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
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-xl font-semibold text-primary" data-testid="text-score">
              {score}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-12 text-center space-y-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-orange-500/5">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 rounded-full bg-background">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {currentWord.category}
                  </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-orange-500 bg-clip-text text-transparent" data-testid="text-current-word">
                  {currentWord.cueWord}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentWord.difficulty === "Easy" 
                      ? "bg-green-500/20 text-green-700 dark:text-green-400" 
                      : currentWord.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}>
                    {currentWord.difficulty}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currentWord.difficulty === "Easy" ? "5" : currentWord.difficulty === "Medium" ? "10" : "15"} points
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleSkip}
            disabled={!isTimerRunning}
            data-testid="button-skip"
            className="text-lg"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip
          </Button>
          <Button
            size="lg"
            onClick={handleGotRight}
            disabled={!isTimerRunning}
            data-testid="button-got-right"
            className="text-lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Got Right
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleEndGame}
            data-testid="button-end-game"
          >
            End Game
          </Button>
        </div>
      </div>
    </div>
  );
}

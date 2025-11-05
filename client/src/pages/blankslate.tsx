import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Copy, Trophy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Room {
  id: string;
  code: string;
  hostId: string;
  gameType: string;
  status: string;
  currentWordIndex: string;
  gameState: any;
}

interface Player {
  id: string;
  userId: string;
  username: string;
  score: string;
  currentAnswer: string | null;
}

interface BlankslateWord {
  id: string;
  cueWord: string;
}

export default function Blankslate() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<"start" | "lobby" | "playing" | "scoring" | "finished">("start");
  const [joinCode, setJoinCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [words, setWords] = useState<BlankslateWord[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answer, setAnswer] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { lastMessage, sendMessage } = useWebSocket(
    currentRoom?.code || null,
    user?.id || null
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "room-update":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        break;
      case "game-started":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        setWords(lastMessage.payload.words);
        setGamePhase("playing");
        setTimeLeft(30);
        setHasSubmitted(false);
        setAnswer("");
        break;
      case "player-answered":
        setPlayers(lastMessage.payload.players);
        break;
      case "word-changed":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        setTimeLeft(30);
        setHasSubmitted(false);
        setAnswer("");
        break;
      case "scores-updated":
        setPlayers(lastMessage.payload.players);
        setGamePhase("scoring");
        break;
      case "game-ended":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        setGamePhase("finished");
        break;
    }
  }, [lastMessage]);

  // Timer countdown
  useEffect(() => {
    if (gamePhase !== "playing" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - calculate scores
          if (currentRoom && user?.id === currentRoom.hostId) {
            calculateScores();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rooms/create", { gameType: "blankslate" });
      return await response.json() as { room: Room };
    },
    onSuccess: (data) => {
      setCurrentRoom(data.room);
      setGamePhase("lobby");
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/rooms/join", { code });
      return await response.json() as { room: Room; players: Player[] };
    },
    onSuccess: (data) => {
      setCurrentRoom(data.room);
      setPlayers(data.players);
      setGamePhase("lobby");
    },
  });

  const handleCopyCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      toast({
        title: "Code copied!",
        description: "Share this code with friends to join.",
      });
    }
  };

  const handleStartGame = () => {
    if (players.length < 3) {
      toast({
        title: "Need more players",
        description: "At least 3 players are required to start.",
        variant: "destructive",
      });
      return;
    }
    sendMessage("start-game", { roomCode: currentRoom?.code });
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim() || !currentRoom || !user) return;
    setHasSubmitted(true);
    sendMessage("submit-answer", {
      roomCode: currentRoom.code,
      userId: user.id,
      answer: answer.trim(),
    });
  };

  const calculateScores = () => {
    if (!currentRoom || !players) return;

    // Count answers
    const answerCounts = new Map<string, string[]>();
    players.forEach((player) => {
      if (player.currentAnswer) {
        const answer = player.currentAnswer.toLowerCase();
        if (!answerCounts.has(answer)) {
          answerCounts.set(answer, []);
        }
        answerCounts.get(answer)!.push(player.userId);
      }
    });

    // Calculate new scores
    const scoreUpdates = players.map((player) => {
      let newScore = parseInt(player.score || "0");
      if (player.currentAnswer) {
        const answer = player.currentAnswer.toLowerCase();
        const count = answerCounts.get(answer)?.length || 0;
        if (count === 2) {
          newScore += 10; // Exactly 2 players - get 10 points
        }
      }
      return { userId: player.userId, score: newScore };
    });

    sendMessage("update-score", {
      roomCode: currentRoom.code,
      scores: scoreUpdates,
    });
  };

  const handleNextWord = () => {
    const currentIndex = parseInt(currentRoom?.currentWordIndex || "0");
    if (currentIndex >= words.length - 1) {
      // Game over
      sendMessage("end-game", { roomCode: currentRoom?.code });
    } else {
      setGamePhase("playing");
      sendMessage("next-word", { roomCode: currentRoom?.code });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You must be logged in to play Blankslate.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentWord = words[parseInt(currentRoom?.currentWordIndex || "0")];
  const isHost = user?.id === currentRoom?.hostId;

  // Start screen
  if (gamePhase === "start") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Blankslate</CardTitle>
            <CardDescription>
              Fill in the blank! Score points by matching with exactly one other player.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Everyone sees the same word with a blank (e.g., "Sea________")</li>
                <li>Type your answer to complete the word</li>
                <li>You have 30 seconds per word</li>
                <li>If exactly 2 players give the same answer, they each get +10 points</li>
                <li>If more than 2 players match or you're unique, you get 0 points</li>
                <li>The player with the most points at the end wins!</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => createRoomMutation.mutate()}
                disabled={createRoomMutation.isPending}
                data-testid="button-host-room"
              >
                Host a Room
              </Button>
              <div className="space-y-2">
                <Input
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  data-testid="input-room-code"
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => joinRoomMutation.mutate(joinCode)}
                  disabled={!joinCode || joinRoomMutation.isPending}
                  data-testid="button-join-room"
                >
                  Join Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lobby screen
  if (gamePhase === "lobby") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Room Lobby</CardTitle>
                <CardDescription>Waiting for players...</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                <Copy className="w-4 h-4 mr-2" />
                {currentRoom?.code}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">
                  Players ({players.length})
                </h3>
              </div>
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
                    data-testid={`player-${player.userId}`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        {player.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.username}</span>
                    {player.userId === currentRoom?.hostId && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {isHost && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartGame}
                disabled={players.length < 3}
                data-testid="button-start-game"
              >
                Start Game
              </Button>
            )}
            {!isHost && (
              <p className="text-center text-muted-foreground">
                Waiting for host to start the game...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing screen
  if (gamePhase === "playing") {
    const answeredCount = players.filter((p) => p.currentAnswer).length;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Blankslate</CardTitle>
              <div className="text-2xl font-bold" data-testid="text-timer">
                {timeLeft}s
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12">
              <div className="text-4xl font-bold mb-4" data-testid="text-word">
                {currentWord?.cueWord}
              </div>
              <p className="text-muted-foreground">
                Fill in the blank with your answer
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={hasSubmitted}
                maxLength={50}
                data-testid="input-answer"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !hasSubmitted) {
                    handleSubmitAnswer();
                  }
                }}
              />
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || hasSubmitted}
                data-testid="button-submit-answer"
              >
                {hasSubmitted ? "Answer Submitted" : "Submit Answer"}
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {answeredCount} / {players.length} players answered
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scoring screen
  if (gamePhase === "scoring") {
    const answerGroups = new Map<string, Player[]>();
    players.forEach((player) => {
      if (player.currentAnswer) {
        const answer = player.currentAnswer.toLowerCase();
        if (!answerGroups.has(answer)) {
          answerGroups.set(answer, []);
        }
        answerGroups.get(answer)!.push(player);
      }
    });

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Round Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {Array.from(answerGroups.entries()).map(([answer, playerGroup]) => (
                <div key={answer} className="p-4 rounded-md bg-muted/50">
                  <div className="font-semibold mb-2">{answer}</div>
                  <div className="flex flex-wrap gap-2">
                    {playerGroup.map((player) => (
                      <span
                        key={player.id}
                        className="text-sm bg-background px-2 py-1 rounded"
                      >
                        {player.username}
                        {playerGroup.length === 2 && " (+10)"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {isHost && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleNextWord}
                data-testid="button-next-word"
              >
                {parseInt(currentRoom?.currentWordIndex || "0") >= words.length - 1
                  ? "End Game"
                  : "Next Word"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Finished screen
  if (gamePhase === "finished") {
    const sortedPlayers = [...players].sort(
      (a, b) => parseInt(b.score || "0") - parseInt(a.score || "0")
    );

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <CardTitle>Game Over!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 rounded-md bg-muted/50"
                  data-testid={`leaderboard-${index + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Avatar>
                      <AvatarFallback>
                        {player.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.username}</span>
                  </div>
                  <span className="text-xl font-bold">{player.score} pts</span>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.location.reload()}
              data-testid="button-play-again"
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

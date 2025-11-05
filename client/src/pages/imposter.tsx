import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Trophy, Users, Eye } from "lucide-react";
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
  role: string | null;
  currentAnswer: string | null;
  hasVoted: string;
}

interface ImposterWord {
  id: string;
  cueWord: string;
  imposterWord: string;
}

export default function Imposter() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<"start" | "lobby" | "playing" | "voting" | "scoring" | "finished">("start");
  const [joinCode, setJoinCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [words, setWords] = useState<ImposterWord[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const [myRole, setMyRole] = useState<string | null>(null);
  const [revealedImposterUserId, setRevealedImposterUserId] = useState<string | null>(null);

  const { lastMessage, sendMessage } = useWebSocket(
    currentRoom?.code || null,
    user?.id || null
  );

  // Derived values
  const isHost = user?.id === currentRoom?.hostId;
  const currentPlayer = players.find((p) => p.userId === user?.id);
  const isImposter = myRole === "imposter";

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "room-update":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        break;
      case "role-assigned":
        setMyRole(lastMessage.payload.role);
        break;
      case "game-started":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        setWords(lastMessage.payload.words);
        setGamePhase("playing");
        setTimeLeft(60);
        setHasVoted(false);
        setSelectedVote(null);
        setVoteResults({});
        setRevealedImposterUserId(null);
        break;
      case "voting-started":
        setGamePhase("voting");
        setHasVoted(false);
        setSelectedVote(null);
        setVoteResults({});
        break;
      case "vote-cast":
        setPlayers(lastMessage.payload.players);
        break;
      case "voting-results":
        setVoteResults(lastMessage.payload.voteResults);
        setRevealedImposterUserId(lastMessage.payload.imposterUserId);
        setGamePhase("scoring");
        break;
      case "scores-updated":
        setPlayers(lastMessage.payload.players);
        break;
      case "word-changed":
        setCurrentRoom(lastMessage.payload.room);
        setPlayers(lastMessage.payload.players);
        setTimeLeft(60);
        setHasVoted(false);
        setSelectedVote(null);
        setVoteResults({});
        setRevealedImposterUserId(null);
        setGamePhase("playing");
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
          // Time's up - start voting
          if (currentRoom && user?.id === currentRoom.hostId) {
            sendMessage("start-voting", { roomCode: currentRoom.code });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  // Auto-calculate votes when everyone has voted
  useEffect(() => {
    if (gamePhase !== "voting" || !currentRoom || !isHost) return;
    
    const votedCount = players.filter((p) => p.hasVoted === "true").length;
    if (votedCount === players.length && players.length > 0) {
      // All players have voted - calculate results
      setTimeout(() => {
        sendMessage("calculate-votes", { roomCode: currentRoom.code });
      }, 500); // Small delay to ensure all votes are processed
    }
  }, [gamePhase, players, currentRoom, isHost]);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rooms/create", { gameType: "imposter" });
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
    if (players.length < 4) {
      toast({
        title: "Need more players",
        description: "At least 4 players are required to start.",
        variant: "destructive",
      });
      return;
    }
    sendMessage("start-game", { roomCode: currentRoom?.code });
  };

  const handleVote = () => {
    if (!selectedVote || !currentRoom || !user) return;
    setHasVoted(true);
    sendMessage("vote-imposter", {
      roomCode: currentRoom.code,
      userId: user.id,
      votedUserId: selectedVote,
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
              You must be logged in to play Guess the Imposter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/auth/login'}
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/'}
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWord = words[parseInt(currentRoom?.currentWordIndex || "0")];

  // Start screen
  if (gamePhase === "start") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Guess the Imposter</CardTitle>
            <CardDescription>
              Find the imposter among you! One player gets a different word and must blend in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>One player is randomly chosen as the imposter</li>
                <li>Normal players see the "cue word" (e.g., "Apple")</li>
                <li>The imposter sees a different "imposter word" (e.g., "Orange")</li>
                <li>You have 60 seconds to discuss and figure out who has the different word</li>
                <li>After time is up, everyone votes for who they think is the imposter</li>
                <li>Voting is anonymous - you'll see vote counts but not who voted for whom</li>
                <li>If the majority correctly identifies the imposter: majority gets +10 points, minority who voted correctly gets +2 points</li>
                <li>If the imposter is not identified by majority: imposter gets +20 points</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => createRoomMutation.mutate()}
                disabled={createRoomMutation.isPending}
                data-testid="button-create-room"
              >
                Create Room
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
                      <Badge variant="default">Host</Badge>
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
                disabled={players.length < 4}
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
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guess the Imposter</CardTitle>
              <div className="text-2xl font-bold" data-testid="text-timer">
                {timeLeft}s
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12 space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Eye className="w-6 h-6" />
                {isImposter && (
                  <Badge variant="destructive">You are the Imposter!</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your word:</p>
                <div className="text-4xl font-bold" data-testid="text-word">
                  {isImposter ? currentWord?.imposterWord : currentWord?.cueWord}
                </div>
              </div>
              <p className="text-muted-foreground mt-4">
                {isImposter 
                  ? "Blend in! Try to act like you have the same word as everyone else."
                  : "Discuss the word carefully - one of you has a different word!"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                <h4 className="font-semibold text-sm">Players in this round:</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {players.map((player) => (
                  <Badge
                    key={player.id}
                    variant="outline"
                    data-testid={`player-badge-${player.userId}`}
                  >
                    {player.username}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Voting screen
  if (gamePhase === "voting") {
    const votedCount = players.filter((p) => p.hasVoted === "true").length;
    const otherPlayers = players.filter((p) => p.userId !== user?.id);

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Vote for the Imposter</CardTitle>
            <CardDescription>
              Who do you think has a different word?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {otherPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-4 rounded-md cursor-pointer border-2 transition-all ${
                    selectedVote === player.userId
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted/50 hover-elevate"
                  }`}
                  onClick={() => !hasVoted && setSelectedVote(player.userId)}
                  data-testid={`vote-option-${player.userId}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {player.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium flex-1">{player.username}</span>
                  {selectedVote === player.userId && (
                    <Badge>Selected</Badge>
                  )}
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleVote}
              disabled={!selectedVote || hasVoted}
              data-testid="button-submit-vote"
            >
              {hasVoted ? "Vote Submitted" : "Submit Vote"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {votedCount} / {players.length} players voted
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scoring screen
  if (gamePhase === "scoring") {
    const imposter = players.find((p) => p.userId === revealedImposterUserId);
    const sortedVotes = Object.entries(voteResults)
      .sort((a, b) => b[1] - a[1])
      .map(([userId, count]) => ({
        player: players.find((p) => p.userId === userId),
        count,
      }));

    const mostVoted = sortedVotes[0];
    const imposterIdentified = mostVoted?.player?.userId === revealedImposterUserId && mostVoted.count > players.length / 2;

    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Round Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-md bg-muted/50 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">The imposter was:</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {imposter?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-lg">{imposter?.username}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Words:</p>
                <div className="flex gap-4 mt-1">
                  <span>Cue word: <strong>{currentWord?.cueWord}</strong></span>
                  <span>Imposter word: <strong>{currentWord?.imposterWord}</strong></span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Voting Results (Anonymous):</h4>
              {sortedVotes.map(({ player, count }) => (
                <div
                  key={player?.id}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`vote-result-${player?.userId}`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {player?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player?.username}</span>
                    {player?.userId === imposter?.userId && (
                      <Badge variant="destructive">Imposter</Badge>
                    )}
                  </div>
                  <span className="font-semibold">{count} votes</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-md bg-primary/10 border border-primary/20">
              <p className="font-semibold text-center">
                {imposterIdentified
                  ? "The imposter was identified! Majority voters get +10 points, minority correct voters get +2 points."
                  : "The imposter was not identified! Imposter gets +20 points."}
              </p>
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
                  <span className="text-xl font-bold" data-testid={`score-${player.userId}`}>
                    {player.score} pts
                  </span>
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

import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface WSMessage {
  type: string;
  payload: any;
}

// Store WebSocket connections by room code
const roomConnections = new Map<string, Set<WebSocket>>();

// Store user ID to WebSocket mapping
const userSockets = new Map<string, WebSocket>();

export function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    let currentUserId: string | null = null;
    let currentRoomCode: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case "join-room": {
            const { roomCode, userId } = message.payload;
            currentUserId = userId;
            currentRoomCode = roomCode;
            
            // Add connection to room
            if (!roomConnections.has(roomCode)) {
              roomConnections.set(roomCode, new Set());
            }
            roomConnections.get(roomCode)!.add(ws);
            
            // Map user to socket
            userSockets.set(userId, ws);
            
            // Get updated room data
            const room = await storage.getRoomByCode(roomCode);
            const players = await storage.getRoomPlayers(room!.id);
            
            // Broadcast updated player list to all in room
            broadcastToRoom(roomCode, {
              type: "room-update",
              payload: { room, players },
            });
            break;
          }
          
          case "start-game": {
            const { roomCode } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              await storage.updateRoomStatus(room.id, "playing");
              const players = await storage.getRoomPlayers(room.id);
              
              // Get game words based on game type
              let words: any[] = [];
              if (room.gameType === "blankslate") {
                words = await storage.getBlankslateWords();
              } else if (room.gameType === "imposter") {
                words = await storage.getImposterWords();
              }
              
              // For imposter, assign one random player as imposter (store in role column, not currentAnswer)
              if (room.gameType === "imposter" && players.length > 0) {
                const imposterIndex = Math.floor(Math.random() * players.length);
                // Clear all player roles first
                for (const player of players) {
                  await storage.updatePlayerRole(room.id, player.userId, "normal");
                }
                // Assign imposter role to random player
                await storage.updatePlayerRole(room.id, players[imposterIndex].userId, "imposter");
                
                // Send role assignment individually to each player (not broadcast)
                const updatedPlayers = await storage.getRoomPlayers(room.id);
                for (const player of updatedPlayers) {
                  const playerSocket = userSockets.get(player.userId);
                  if (playerSocket && playerSocket.readyState === WebSocket.OPEN) {
                    playerSocket.send(JSON.stringify({
                      type: "role-assigned",
                      payload: { role: player.role },
                    }));
                  }
                }
              }
              
              const updatedRoom = await storage.getRoomByCode(roomCode);
              const updatedPlayers = await storage.getRoomPlayers(room.id);
              
              // Send game start without role information (roles sent separately above)
              broadcastToRoom(roomCode, {
                type: "game-started",
                payload: { 
                  room: updatedRoom, 
                  players: updatedPlayers.map(p => ({ ...p, role: null })), // Hide roles from broadcast
                  words 
                },
              });
            }
            break;
          }
          
          case "submit-answer": {
            const { roomCode, userId, answer } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              await storage.updatePlayerAnswer(room.id, userId, answer);
              const players = await storage.getRoomPlayers(room.id);
              
              broadcastToRoom(roomCode, {
                type: "player-answered",
                payload: { players },
              });
            }
            break;
          }
          
          case "start-voting": {
            const { roomCode } = message.payload;
            
            broadcastToRoom(roomCode, {
              type: "voting-started",
              payload: {},
            });
            break;
          }
          
          case "vote-imposter": {
            const { roomCode, userId, votedUserId } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              await storage.updatePlayerVote(room.id, userId, true);
              // Store vote in current answer temporarily
              await storage.updatePlayerAnswer(room.id, userId, `vote:${votedUserId}`);
              
              const players = await storage.getRoomPlayers(room.id);
              
              broadcastToRoom(roomCode, {
                type: "vote-cast",
                payload: { players: players.map(p => ({ ...p, role: null, currentAnswer: null })) },
              });
            }
            break;
          }
          
          case "calculate-votes": {
            const { roomCode } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              const players = await storage.getRoomPlayers(room.id);
              
              // Find who the imposter is
              const imposter = players.find(p => p.role === "imposter");
              const imposterUserId = imposter?.userId || null;
              
              // Count votes
              const voteCount: Record<string, number> = {};
              players.forEach(player => {
                if (player.currentAnswer && player.currentAnswer.startsWith("vote:")) {
                  const votedId = player.currentAnswer.substring(5);
                  voteCount[votedId] = (voteCount[votedId] || 0) + 1;
                }
              });
              
              // Send voting results with imposter reveal
              broadcastToRoom(roomCode, {
                type: "voting-results",
                payload: { 
                  voteResults: voteCount,
                  imposterUserId,
                },
              });
            }
            break;
          }
          
          case "next-word": {
            const { roomCode } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              const currentIndex = parseInt(room.currentWordIndex || '0');
              await storage.updateRoomWordIndex(room.id, currentIndex + 1);
              await storage.clearPlayerAnswers(room.id);
              
              const updatedRoom = await storage.getRoomByCode(roomCode);
              const players = await storage.getRoomPlayers(room.id);
              
              broadcastToRoom(roomCode, {
                type: "word-changed",
                payload: { room: updatedRoom, players },
              });
            }
            break;
          }
          
          case "end-game": {
            const { roomCode } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              await storage.updateRoomStatus(room.id, "finished");
              const updatedRoom = await storage.getRoomByCode(roomCode);
              const players = await storage.getRoomPlayers(room.id);
              
              broadcastToRoom(roomCode, {
                type: "game-ended",
                payload: { room: updatedRoom, players },
              });
            }
            break;
          }
          
          case "update-score": {
            const { roomCode, scores } = message.payload;
            const room = await storage.getRoomByCode(roomCode);
            
            if (room) {
              // Update scores for all players
              for (const scoreUpdate of scores) {
                await storage.updatePlayerScore(room.id, scoreUpdate.userId, scoreUpdate.score);
              }
              
              const players = await storage.getRoomPlayers(room.id);
              
              broadcastToRoom(roomCode, {
                type: "scores-updated",
                payload: { players },
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", async () => {
      // Remove from room connections
      if (currentRoomCode && roomConnections.has(currentRoomCode)) {
        roomConnections.get(currentRoomCode)!.delete(ws);
        if (roomConnections.get(currentRoomCode)!.size === 0) {
          roomConnections.delete(currentRoomCode);
        }
      }
      
      // Remove from user sockets
      if (currentUserId) {
        userSockets.delete(currentUserId);
      }
      
      // Optionally remove player from room on disconnect
      // This ensures disconnected players don't stay in the lobby
      if (currentRoomCode && currentUserId) {
        try {
          const room = await storage.getRoomByCode(currentRoomCode);
          if (room && room.status === "lobby") {
            await storage.removePlayerFromRoom(room.id, currentUserId);
            const updatedPlayers = await storage.getRoomPlayers(room.id);
            broadcastToRoom(currentRoomCode, {
              type: "room-update",
              payload: { room, players: updatedPlayers },
            });
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      }
    });
  });

  return wss;
}

function broadcastToRoom(roomCode: string, message: WSMessage) {
  const connections = roomConnections.get(roomCode);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }
}

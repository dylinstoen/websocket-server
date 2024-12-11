class Player {
    constructor(socketID, name) {
        this.name = name;
        this.socketID = socketID;
        this.isHost = false;
        this.isReady = false;
        this.playerPhase = Player.PLAYER_PHASES.ACTION;
        this.isConnected = true;
        this.turnOrder = null;
        this.hand = [];
        this.metadata = {};
    }
    static PLAYER_PHASES = {
        WAITING: 'waiting',
        ACTION: 'action'
    }
}
class GameState {
    constructor() {
      this.currentTurn = 0;
      this.gamePhase = GameState.GAME_PHASES.LOBBY;
      this.discardPile = [];
      this.playOrder = [];
      this.players = {};
      this.playersReady = 0;
    }
    static GAME_PHASES = {
        LOBBY: 'lobby',
        GAME: 'game',
        ENDED: 'ended'
    };
  }
class Room {
    constructor(roomCode, unitySocketId) {
      this.roomCode = roomCode;
      this.unityClientSocketId = unitySocketId;
      this.gameState = new GameState();
    }
  }

module.exports = {Room, Player};
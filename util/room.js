class Player {
    constructor(socketID) {
        this.isHost = false;
        this.isReady = false;
        this.socketID = socketID;
        this.hand = [];
    }
}
class GameState {
    constructor() {
      this.currentTurn = 0;
      this.gamePhase = 'waiting';
      this.discardPile = [];
      this.playOrder = [];
      this.players = {};
    }
  }
class Room {
    constructor(roomCode, unitySocketId) {
      this.roomCode = roomCode;
      this.unityClientSocketId = unitySocketId;
      this.gameState = new GameState();
    }
  }

module.exports = {Room, Player};
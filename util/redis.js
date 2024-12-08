const {Room, Player} = require('./room');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

redis.on('error', (err) => {
    console.error('Redis error:', err);
});
redis.on('connect', () => {
    console.log('Connected to Redis');
});
async function setRoom(roomCode, room) {
    await redis.set(`room:${roomCode}`, JSON.stringify(room));
}
async function getRoom(roomCode) {
    const data = await redis.get(`room:${roomCode}`);
    if(data) {
        return JSON.parse(data);
    }
    return null;
}
async function joinRoom(roomCode, nickname, socketId) {
    const data = await redis.get(`room:${roomCode}`);
    if(data) {
        const parsedData = JSON.parse(data);
        if(parsedData.gameState.players[nickname]) {
            return "error_name_taken";
        }
        parsedData.gameState.players[nickname] = new Player(socketId);
        parsedData.gameState.players[nickname].isReady = false;
        if(Object.keys(parsedData.gameState.players).length === 1) {
            parsedData.gameState.players[nickname].isHost = true;
        }
        redis.set(`room:${roomCode}`, JSON.stringify(parsedData));
        return "player_joined_ack";
    } else {
        return "error_invalid_room";
    }
}
async function createRoom(roomCode, unitySocketId) {
    const room = new Room(roomCode, unitySocketId);
    await redis.set(`room:${room.roomCode}`, JSON.stringify(room));
  }

module.exports = { createRoom, joinRoom, getRoom, setRoom };
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-streams-adapter');
const Redis = require('ioredis');
const { createRedisUtils  } = require('./util/redis');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const subClient = pubClient.duplicate();
const redisUtils = createRedisUtils(pubClient);

io.adapter(createAdapter(pubClient, subClient));

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('host_room', async () => {
    const {status, roomCode} = await redisUtils.createRoom(socket.id);
    if(status !== "success") {
      socket.emit('error_room_creation', status);
      return;
    }
    socket.join("room:" + roomCode);
    socket.emit('host_room_ack', roomCode);
  });

  socket.on('join_room', async (data) => {
    const status = await redisUtils.joinRoom(data.roomCode, data.nickname, socket.id);
    if (status !== "success") {
      socket.emit(status);
      return;
    }
    socket.join("room:" + roomCode);
    const room = await redisUtils.getRoom(roomCode);
    socket.to(room.unityClientSocketId).emit('room_update', room);
    socket.emit('player_joined_ack', data);
  });

  socket.on('reconnection', async ({ roomCode, nickname }) => {
    console.log(nickname + ' is reconnecting to room:', roomCode);
    const data = await redisUtils.getRoom(roomCode);
    if (data) {
        const player = data.gameState.players[nickname];
        player.isConnected = true;
        player.socketID = socket.id;
        await redisUtils.setRoom(roomCode, data);
        socket.join("room:" + roomCode);
        socket.emit('reconnection_ack', { room: data, nickname: nickname });
    } else {
        socket.emit('error_invalid_room');
    }
});

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    // Find the room the disconnected player belongs to
    const activeRooms = await redisUtils.redis.keys("room:*");
    for (const roomKey of activeRooms) {
        const room = await redisUtils.getRoom(roomKey.replace("room:", ""));
        if (!room) continue;
        // Check if the disconnected client is the Unity client
        if(room.unityClientSocketId === socket.id) {
            console.log(`Unity client in room ${room.roomCode} disconnected.`);
            await redisUtils.deleteRoom(room.roomCode);
            return
        }
        // Check if the disconnected client is a player
        const players = room.gameState.players;
        for (const playerName in players) {
            const player = players[playerName];
            if (player.socketID === socket.id) {
                player.isConnected = false;
                console.log(`Player ${playerName} in room ${room.roomCode} marked as disconnected.`);
                await redisUtils.setRoom(room.roomCode, room);
                return;
            }
        }
    }
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log('Server running on http://localhost:3003');
});

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const {generateRandomString} = require('./helper');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static('public'));


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('host_room', async () => {
    const roomcode = generateRandomString(4);
    socket.join(roomcode);
    socket.emit('room_created', roomcode);
  });
  socket.on('join_room', async (data) => {
    const { roomcode, nickname } = data;
    socket.join(roomcode);
  });
});

socket.on("disconnect", () => {
  console.log("Client disconnected:", socket.id);
  for (const roomCode in rooms) {
    const room = rooms[roomCode];
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      io.to(roomCode).emit("playerLeft", { nickname: removedPlayer.nickname });
      if (room.players.length === 0 && room.host === socket.id) {
        delete rooms[roomCode];
        console.log(`Room ${roomCode} deleted`);
      }
      break;
    }
  }
});
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log('Server running on http://localhost:3003');
});
const express = require('express');
const { createServer, get } = require('http');
const { Server } = require('socket.io');

const {generateRandomString} = require('./util/general');
const { createRoom, joinRoom, getRoom, setRoom } = require('./util/redis');
const { Socket } = require('dgram');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/join.html');
});
app.get('/ready', (req, res) => {
  res.sendFile(__dirname + '/public/ready.html');
});
app.get('/game', (req, res) => {
  res.sendFile(__dirname + '/public/game.html');
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('host_room', async () => {
    const roomCode = generateRandomString(4);
    socket.join("Room:" + roomCode);
    await createRoom(roomCode, socket.id);
    socket.emit('room_created', roomCode);
  });
  socket.on('join_room', async (data) => {
    const { roomCode, nickname } = data;
    const response = await joinRoom(roomCode, nickname, socket.id);
    if (response === "error_name_taken") {
      socket.emit('error_name_taken');
      return;
    }
    if (response === "error_invalid_room") {
      socket.emit('error_invalid_room');
      return;
    }
    socket.join("Room:" + roomCode);
    socket.emit('player_joined_ack', { roomCode, nickname });
    const room = await getRoom(roomCode);
    socket.to(room.unityClientSocketId).emit('room_update', room);
  });

  socket.on('player_ready', async (data) => {
    const { roomCode, nickname } = data;
    const room = await getRoom(roomCode);
    const player = room.gameState.players[nickname];
    player.isReady = true;
    const allReady = Object.values(room.gameState.players).every((p) => p.isReady);
    if (allReady) {
        const host = Object.values(room.gameState.players).find((p) => p.isHost);
        if (host) {
          socket.to(host.socketID).emit('all_players_ready');
        }
    }
    await setRoom(roomCode, room);
    socket.to(room.unityClientSocketId).emit('player_ready', nickname);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log('Server running on http://localhost:3003');
});

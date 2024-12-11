// MUST BE SPA Due to socket logic where it disconnects and reconnects everytime a new page is loaded
document.addEventListener("DOMContentLoaded", function () {
  const socket = io();
  const joinSection = document.getElementById("join-section");
  const lobbySection = document.getElementById("lobby-section");
  const gameSection = document.getElementById("game-section");
  const waitingSection = document.getElementById("waiting");


  const joinButton = document.getElementById("join-button");
  const startButton = document.getElementById("lobby-start-button");

  let roomCode = localStorage.getItem("roomCode") || null;
  let nickname = localStorage.getItem("nickname") || null;
  let isRecconecting = false;

  function switchSection(from, to) {
    from.classList.remove("active");
    from.classList.add("hidden");
    to.classList.add("active");
    to.classList.remove("hidden");
  }

  // Auto fill room code and nickname if they exist in local storage
  socket.on("connect", () => {
    console.log("Connected to server.");
    if (roomCode && nickname) {
      document.getElementById("room-code").value = roomCode;
      document.getElementById("nickname").value = nickname;
      joinButton.textContent = "Reconnect";
      isRecconecting = true;
    } else {
      console.log("No previous session found. Awaiting user input.");
    }
  });
  socket.on("reconnection_ack", ({ room, nickname }) => {

    switch (room.gamePhase) {
      case "lobby":
        switchSection(joinSection, lobbySection);
        if (room.players[nickname].isReady && room.players[nickname].isHost){
          waitingSection.classList.add("hidden");
          startButton.classList.remove("hidden");
        } else {
            waitingSection.classList.remove("hidden");
            startButton.classList.add("hidden");
        }
        break;
      case "game":
        switchSection(joinSection, gameSection);
        break;
      case "ended":
        localStorage.clear();
        break;
    }
  });

  joinButton.addEventListener("click", () => {
    roomCode = document.getElementById("room-code").value.toUpperCase();
    nickname = document.getElementById("nickname").value;
    if(isRecconecting){
        socket.emit("reconnection", { roomCode, nickname });
        return;
    }
    if (roomCode && nickname) {
      socket.emit("join_room", { roomCode, nickname });
      localStorage.setItem("roomCode", roomCode);
      localStorage.setItem("nickname", nickname);
    } else {
      alert("Please fill out both fields!");
    }
  });

  socket.on("player_joined_ack", () => {
    switchSection(joinSection, lobbySection);
  });

  socket.on("error_name_taken", () => {
    alert("Nickname is already taken, please choose another.");
  });

  socket.on("error_invalid_room", () => {
    alert("Invalid room code, please check and try again.");
  });

  startButton.addEventListener("click", () => {
    socket.emit("start_game", { roomCode });
  });

  socket.on("game_started", () => {
    console.log("Game has started!");
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from server.");
  });
});

document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    const joinButton = document.querySelector('#join-game-button');
    if(joinButton) {
        document.querySelector('#join-game-button').addEventListener('click', function () {
            const roomCode = document.querySelector('#form-roomcode').value.toUpperCase();
            const nickname = document.querySelector('#form-name').value;
            joinRoom(roomCode, nickname);
        });
    }
    function joinRoom(roomCode, nickname) {
        socket.emit('join_room', { roomCode, nickname });
        socket.on('player_joined_ack', (data) => {
            sessionStorage.setItem('roomCode', data.roomCode);
            sessionStorage.setItem('nickname', data.nickname);
            window.location.href = 'ready.html';
        });
        socket.on('error_name_taken', () => {
            alert('Nickname is already taken, please choose another one.');
        });
        socket.on('error_invalid_room', () => {
            alert('Invalid room code. Please check and try again.');
        });
    }
    const startGameButton = document.querySelector('#start-game-button');
    if (startGameButton) {
        socket.on('all_players_ready', () => {
            startGameButton.classList.remove('hidden');
            console.log('All players ready!');
        });
        startGameButton.addEventListener('click', function () {
            const roomCode = sessionStorage.getItem('roomCode');
        });
    }
    const readyButton = document.querySelector('#ready-up-button');
    if(readyButton) {
        document.querySelector('#ready-up-button').addEventListener('click', function ()  {
            const roomCode = sessionStorage.getItem('roomCode');
            const nickname = sessionStorage.getItem('nickname');
            readyRoom(roomCode, nickname);
            window.location.href = 'game.html';
        });
    }
    function readyRoom(roomCode, nickname) {
        socket.emit('player_ready', { roomCode, nickname });
    }


});

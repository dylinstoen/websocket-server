document.addEventListener("DOMContentLoaded", function () {
    const socket = io();

    // Reference the elements for the join form and game screen
    const joinForm = document.querySelector('#room-code-form');
    const readyUpScreen = document.querySelector('#ready-up-screen');

    document.querySelector('#join-game-button').addEventListener('click', function () {
        const roomcode = document.querySelector('#form-roomcode').value.toUpperCase();
        const nickname = document.querySelector('#form-name').value;
        joinRoom(roomcode, nickname);
    });
    function joinRoom(roomcode, nickname) {
        socket.emit('join_room', { roomcode, nickname });
        socket.on('player_joined_ack', (data) => {
            console.log(`Joined room: ${data.roomCode} as ${data.nickname}`);
            joinForm.style.display = 'none';
            readyUpScreen.style.display = 'block';
        });
        socket.on('error_name_taken', () => {
            console.error('Nickname already taken.');
            alert('Nickname is already taken, please choose another one.');
        });
        socket.on('error_invalid_room', () => {
            console.error('Invalid room code.');
            alert('Invalid room code. Please check and try again.');
        });
    }
    document.querySelector('#ready-up-button').addEventListener('click', () => {
        if (!roomCode || !nickname) {
            alert('Room code or nickname is missing!');
            return;
        }
        readyUpScreen.style.display = 'none';
        playerReadyScreen.classList.remove('hidden');
        playerReadyScreen.style.display = 'block';
    });
});

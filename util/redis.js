const {Room, Player} = require('./room');
const {generateRandomString} = require('./general');
/**
 * Create a new Redis utility instance using existing Redis clients
 * @param {Redis} redis - The Redis client instance
 */
function createRedisUtils(redis) {
    const MAX_ROOMS = 456976;
    async function createRoom(unitySocketId) {
        try {
            const activeRooms = await redis.keys('room:*');
            if (activeRooms.length >= MAX_ROOMS) {
                console.log("Server is full");
                return {status: "server is full", roomCode: null};
            }
            let roomCode = generateRandomString(4);
            while(await redis.exists(`room:${roomCode}`)) {
                roomCode = generateRandomString(4);
            }
            const room = new Room(roomCode, unitySocketId);
            await redis.set(`room:${roomCode}`, JSON.stringify(room));
            console.log(`Room ${roomCode} created for 30 seconds`);
            return {status: "success", roomCode: roomCode};
        } catch(error) {
            console.error("Error creating room:", error);
            return {status: error, roomCode: null};
        }
    }

    async function joinRoom(roomCode, nickname, socketId) {
        try{
            if (data) {
                const data = await getRoom(roomCode);
                if (data.gameState.players[nickname]) {
                    return 'error_name_taken';
                }
                data.gameState.players[nickname] = new Player(socketId);
                data.gameState.playOrder.push(nickname);
                if (Object.keys(parsedData.gameState.players).length === 1) {
                    parsedData.gameState.players[nickname].isHost = true;
                }
                await setRoom(roomCode, data);
                return 'success';
            } else {
                return 'error_invalid_room';
            }
        } catch(error) {
            console.error("Error joining room:", error);
            return "error_invalid_room";
        }
    }

    async function getRoom(roomCode) {
        const data = await redis.get(`room:${roomCode}`);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    async function deleteRoom(roomCode, room) {
        await redis.del(`room:${roomCode}`);
    }
    async function setRoom(roomCode, room) {
        await redis.set(`room:${roomCode}`, JSON.stringify(room));
    }

    return { createRoom, joinRoom, getRoom, setRoom, deleteRoom };
}

module.exports = { createRedisUtils };
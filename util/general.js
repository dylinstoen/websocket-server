// Helper to generate random room codes
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result.toUpperCase();
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 9);
}

module.exports = { generateRandomString, generateUserId };
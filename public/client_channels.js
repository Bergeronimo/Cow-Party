import { state } from './state.js';

const initClientChannels = (socket) => {
    // transmit updated player positions
    setInterval(() => {
        const myPlayer = state.players[socket.id];
        socket.emit('client player update', myPlayer);
    }, 1000 / 15);

    // transmit consumed food dots
    setInterval(() => {
        socket.emit('client consumed food dots', state.eatenFoodIDs);
        state.eatenFoodIDs = [];
    }, 1000 / 8);
}

export { initClientChannels };
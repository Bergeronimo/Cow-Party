import { state } from './state.js';

const initClientChannels = (socket) => {
    // transmit updated circle positions
    setInterval(() => {
        const myCircle = state.circles[socket.id];
        socket.emit('client player update', myCircle);
    }, 1000 / 15);

    // transmit consumed food dots
    setInterval(() => {
        socket.emit('client consumed food dots', state.eatenFoodIDs);
        state.eatenFoodIDs = [];
    }, 1000 / 8);
}

export { initClientChannels };
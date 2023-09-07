import { state } from './state.js';

const initServerChannels = (socket) => {
    socket.on('server update circles', (data) => {
        if (socket.id in state.circles) {
            data[socket.id] = state.circles[socket.id];
            state.circles = data;
        }
        else {
            state.circles = data;
        }
    });

    socket.on('server consumed food dot ids', (allEatenFoodDotIds) => {
        allEatenFoodDotIds.forEach((eatenFoodDotId) => {
            if (state.foodDots.hasOwnProperty(eatenFoodDotId)) {
                delete state.foodDots[eatenFoodDotId];
            }
        });
    });

    socket.on('server set all food dots', (allFoodDots) => {
        state.foodDots = allFoodDots;
    });



    socket.on('server new food dot kv',
        /**
         * Server sends a new food dot key-value pair list
         * @param {Array} foodDotKVs
         * @returns {undefined}
         */
        (foodDotKV) => {
            if (!foodDotKV) {
                return;
            }
            let key = foodDotKV["key"];
            let foodDot = foodDotKV["value"];
            state.foodDots[key] = foodDot;
        });
}

export { initServerChannels };
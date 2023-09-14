import { state } from './state.js';
import { mooSounds } from './assets.js';

const initServerChannels = (socket) => {
    socket.on('server update players', (data) => {
        if (socket.id in state.players) {
            data[socket.id] = state.players[socket.id];
            state.players = data;
        }
        else {
            state.players = data;
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

    socket.on('server moo', (data) => {
        console.log(`server moo: ${data["id"]} ${data["moo"]}`);
        if (data["id"] === socket.id) {
            return;
        }
        let moo = data["moo"];
        let mooSound = mooSounds[moo];
        mooSound.currentTime = 0;
        mooSound.play();
    });

    socket.on('server update_round_time_remaining', (round_time_remaining) => {
        state.round_time_remaining = round_time_remaining;

        const timerElement = document.getElementById('timer');
        const text = `round time remaining: ${round_time_remaining}`;
        timerElement.textContent = text;
    });

    socket.on('server update_time_until_next_round', (time_until_next_round) => {
        console.log("server update_time_until_next_round");
        state.round_in_progress = true;
        state.time_until_next_round = time_until_next_round;

        const timerElement = document.getElementById('timer');
        const text = `next round in: ${time_until_next_round} second(s)`;
        timerElement.textContent = text;
    });

    socket.on('server game_ended', (winner_id) => {
        let winner_id2 = 100;
        state.round_in_progress = false;

        const gameStateElement = document.getElementById('game-state');
        const text = `BREAK TIME`;
        gameStateElement.textContent = text;

        // hide the timer element
        const timerElement = document.getElementById('timer');
        timerElement.textContent = '';

        const winAnnouncement = document.getElementById('win-announcement');
        winAnnouncement.display = 'block';
        winAnnouncement.innerHTML = `somebody won`;

        // make it hide after 5 seconds
        setTimeout(() => {
            winAnnouncement.display = 'none';
            winAnnouncement.innerHTML = '';
        }, 5000);
    });

    // server round_start
    socket.on('server round_start', (winner_id) => {
        state.round_in_progress = true;

        const gameStateElement = document.getElementById('game-state');
        const text = `ROUND START`;
        gameStateElement.textContent = text;

        // after 2 seconds, hide the round start
        setTimeout(() => {
            gameStateElement.textContent = `GAME IN PROGRESS`;
        }, 2000);
    });

    socket.on('server set all players', (allPlayers) => {
        state.players = allPlayers;
    });

    socket.on('server set all food dots', (allFoodDots) => {
        state.foodDots = allFoodDots;
    });


    //     io.emit('server timer', timer);


}

export { initServerChannels };
/*
    this is a headless bot, it connects and plays, but doesnt draw or play sounds, and doesnt care about other players

    TODO:
    multiple bot behaviours
    - random walk
    - walk towards a random foot dot
    - walk towards closest food dot
*/
const io = require('socket.io-client');

const socket = io.connect('http://98.197.238.51:3000');

class State {
    constructor() {
        this.players = {};
        this.foodDots = {};

        this.round_in_progress = false;
    }
}
const state = new State();

const SPEED = 180.0;
const foodDotColor = "#00FF00";
const foodDotRadius = 8;
const worldWidth = 640;
const worldHeight = 480;
const footstepInterval = 6;
class Constants {
    static get SPEED() {
        return SPEED;
    }

    static get foodDotColor() {
        return foodDotColor;
    }

    static get foodDotRadius() {
        return foodDotRadius;
    }

    static get worldWidth() {
        return worldWidth;
    }

    static get worldHeight() {
        return worldHeight;
    }

    static get footstepInterval() {
        return footstepInterval;
    }
}

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

    socket.on('server set all players', (allPlayers) => {
        state.players = allPlayers;
    });

    socket.on('server set all food dots', (allFoodDots) => {
        state.foodDots = allFoodDots;
    });

}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let lastTime = Date.now();
let target_position = { x: 0, y: 0 };
// set target to middle
target_position.x = Constants.worldWidth / 2;
target_position.y = Constants.worldHeight / 2;
function step() {
    {
        // check distance to target position
        let player = state.players[socket.id];
        if (player) {
            const distance = Math.sqrt(
                Math.pow(player.x - target_position.x, 2) + Math.pow(player.y - target_position.y, 2)
            );

            if (distance < (player.radius + 2)) {
                let min_x = player.radius;
                let max_x = Constants.worldWidth - player.radius;
                let min_y = player.radius;
                let max_y = Constants.worldHeight - player.radius;
                target_position.x = getRandom(min_x, max_x);
                target_position.y = getRandom(min_y, max_y);
            }

            // move towards target position 
            // if target is to the right, set vx to be Const speed
            let x_delta = Math.abs(target_position.x - player.x);
            let y_delta = Math.abs(target_position.y - player.y);

            // if x_delta less than radius, set vx to 0
            if (x_delta > player.radius) {
                if (target_position.x > player.x) {
                    player.vx = Constants.SPEED;
                } else if (target_position.x < player.x) {
                    player.vx = -Constants.SPEED;
                } else {
                    player.vx = 0;
                }
            } else {
                player.vx = 0;
            }

            // if y_delta less than radius, set vy to 0
            if (y_delta > player.radius) {
                if (target_position.y > player.y) {
                    player.vy = Constants.SPEED;
                } else if (target_position.y < player.y) {
                    player.vy = -Constants.SPEED;
                } else {
                    player.vy = 0;
                }
            } else {
                player.vy = 0;
            }
        }
    }

    const now = Date.now();
    const delta = (now - lastTime) / 1000; // time difference in seconds
    lastTime = now;
    Object.values(state.players).forEach(player => {
        if (player) {
            player.x += player.vx * delta;
            player.y += player.vy * delta;
        }
    });

    {
        // bounds check all player
        Object.values(state.players).forEach(player => {
            if (player) {
                // left side
                if (player.x < player.radius) {
                    player.x = player.radius;
                } else if (player.x > (Constants.worldWidth - player.radius)) {
                    player.x = Constants.worldWidth - player.radius;
                }

                // top side
                if (player.y < player.radius) {
                    player.y = player.radius;
                } else if (player.y > (Constants.worldHeight - player.radius)) {
                    player.y = Constants.worldHeight - player.radius;
                }
            }
        });

    }

    // check if any foods are eaten
    {
        let player = state.players[socket.id];
        if (player) {
            for (const foodID in state.foodDots) {
                if (state.foodDots.hasOwnProperty(foodID)) {
                    const foodDot = state.foodDots[foodID];

                    // Calculate the distance between the player and the food dot
                    const distance = Math.sqrt(
                        Math.pow(player.x - foodDot.x, 2) + Math.pow(player.y - foodDot.y, 2)
                    );

                    if (distance < (player.radius + Constants.foodDotRadius)) {
                        player.radius += 2;
                        state.eatenFoodIDs.push(foodID);
                        delete state.foodDots[foodID];
                    }
                }
            }
        }

    }
}


function init() {
    initServerChannels(socket);
    initClientChannels(socket);

    // emit name
    socket.emit('client set name', "bot_player_1");
}

init();
setInterval(() => {
    step();
}, 1000 / 30);
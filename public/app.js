import { new_enum } from './utils.js';
import { keysPressed, processControls } from './controls.js';
import { startLatencyCheck } from './latency_check.js';
import { initServerChannels } from './server_channels.js';
import { initClientChannels } from './client_channels.js';
import { state } from './state.js';
import { Constants } from './constants.js';
import { draw } from './drawing.js';
import { load_images } from './assets.js';
import { socket } from './connection.js';

function step() {
    // step all circles
    Object.values(state.circles).forEach(circle => {
        if (circle) {
            circle.x += circle.vx;
            circle.y += circle.vy;
        }
    });

    // check if any foods are eaten
    const circle = state.circles[socket.id];
    if (circle) {
        for (const foodID in state.foodDots) {
            if (state.foodDots.hasOwnProperty(foodID)) {
                const foodDot = state.foodDots[foodID];

                // Calculate the distance between the circle and the food dot
                const distance = Math.sqrt(
                    Math.pow(circle.x - foodDot.x, 2) + Math.pow(circle.y - foodDot.y, 2)
                );

                if (distance < (circle.radius + Constants.foodDotRadius)) {
                    circle.radius += 2;
                    state.eatenFoodIDs.push(foodID);
                    delete state.foodDots[foodID];
                }
            }
        }
    }
}

async function init() {
    startLatencyCheck(socket);
    initServerChannels(socket);
    initClientChannels(socket);
    await load_images();
}

function loop() {
    processControls();
    step();
    draw();
    requestAnimationFrame(loop);
}

await init();
loop();

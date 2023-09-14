import { new_enum } from './utils.js';
import { keysPressed, processControls } from './controls.js';
import { startLatencyCheck } from './latency_check.js';
import { initServerChannels } from './server_channels.js';
import { initClientChannels } from './client_channels.js';
import { state } from './state.js';
import { Constants } from './constants.js';
import { draw } from './drawing.js';
import { load_images, load_sounds, mooSounds } from './assets.js';
import { socket } from './connection.js';
import { pickOneFromHashKey } from './utils.js';
import { MooSound } from './assets.js';


const MooSoundCategories = new_enum(
    "MOO_1",
    "MOO_2",
    "MOO_3",
);

const MooCategoryToSound = {
    [MooSoundCategories.MOO_1]: [
        MooSound.MOO_1_LOW,
        MooSound.MOO_1_MID,
        MooSound.MOO_1_HIGH,
    ],
    [MooSoundCategories.MOO_2]: [
        MooSound.MOO_2_LOW,
        MooSound.MOO_2_MID,
        MooSound.MOO_2_HIGH,
    ],
    [MooSoundCategories.MOO_3]: [
        MooSound.MOO_3_LOW,
        MooSound.MOO_3_MID,
        MooSound.MOO_3_HIGH,
    ],
}


function playMooSound() {
    const mooCategory = pickOneFromHashKey(socket.id, MooSoundCategories);
    const thisCategorySounds = MooCategoryToSound[mooCategory];
    const randomMooKey = Math.floor(Math.random() * thisCategorySounds.length);
    const randomMooSound = thisCategorySounds[randomMooKey];
    const sound = mooSounds[randomMooSound];

    socket.emit('client moo', randomMooSound);

    sound.currentTime = 0;
    sound.play();
}

function step() {
    // step all players
    Object.values(state.players).forEach(player => {
        if (player) {
            player.x += player.vx;
            player.y += player.vy;
        }
    });

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


    // check if any foods are eaten
    const player = state.players[socket.id];
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

                    playMooSound();

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
    await load_sounds();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const winAnnouncement = document.getElementById('win-announcement');
    winAnnouncement.display = 'none';
    winAnnouncement.innerHTML = '';
}

function loop() {
    processControls();
    step();
    draw();
    requestAnimationFrame(loop);
}

await init();
loop();
import { new_enum } from './utils.js';
import { keysPressed, processControls } from './controls.js';
import { startLatencyCheck } from './latency_check.js';
import { initServerChannels } from './server_channels.js';
import { initClientChannels } from './client_channels.js';
import { state } from './state.js';
import { Constants } from './constants.js';
import { draw } from './drawing.js';
import { load_images, load_sounds, mooSounds, playFootstepSound } from './assets.js';
import { socket } from './connection.js';
import { pickOneFromHashKey } from './utils.js';
import { MooSound } from './assets.js';
import { EffectType } from './special_effect.js';
import { Vec2 } from './vec2.js';
import { specialEffects } from './drawing.js';
import { StaticEffect, DynamicEffect, SplineEffect, UltraDynamicEffect } from './special_effect.js';
import { randomNumberBetween } from './utils.js';
import { setMusicVolume, setSoundEffectsVolume } from './assets.js';
import { particleTextures } from './assets.js';

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

let mousePos = new Vec2(0, 0);
document.addEventListener('mousemove', function (event) {
    mousePos.x = event.clientX / window.innerWidth * Constants.worldWidth;
    mousePos.y = event.clientY / window.innerHeight * Constants.worldHeight;
});

let lastTime = Date.now();
function step() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000; // time difference in seconds
    lastTime = now;
    Object.values(state.players).forEach(player => {
        if (player) {
            player.x += player.vx * delta;
            player.y += player.vy * delta;
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

    // cow footsteps
    // for each cow, check if moving, 
    // if moving, decrement the moving sound counter for the cow. 
    // if that hits zero, reset it, and plop a footprint and play a step sound
    // footprint rotation depends on cow direction
    Object.values(state.players).forEach(player => {
        if (player) {
            if (player.vx != 0 || player.vy != 0) {
                // moving
                if (player.footstepCountdown <= 0) {
                    // reset countdown
                    player.footstepCountdown = Constants.footstepInterval
                        + randomNumberBetween(-5, 5)
                        + player.radius;

                    // plop footprint
                    // // position should be a little bit random within cow radius
                    const footprintPos = new Vec2(
                        player.x + randomNumberBetween(-player.radius / 2, player.radius / 2),
                        player.y + randomNumberBetween(-player.radius / 2, player.radius / 2),
                    );

                    const footprint = new StaticEffect(
                        EffectType.FOOTPRINT,
                        100 + player.radius * 2,
                        footprintPos,
                        new Vec2(2 + player.radius, 2 + player.radius),
                        Math.atan2(player.vy, player.vx),
                        1.0,
                    );
                    specialEffects.add(footprint);

                    // normal speed is 1.0
                    // one octave down is 0.5 speed
                    // should get deeper with cow size
                    const speed = 1.0 - (player.radius / 100);
                    playFootstepSound(speed);
                } else {
                    player.footstepCountdown--;
                }
            }
        }
    });

    specialEffects.step();
}




async function init() {
    startLatencyCheck(socket);
    initServerChannels(socket);
    initClientChannels(socket);
    await load_images();
    await load_sounds();

    await new Promise(resolve => setTimeout(resolve, 1000));

    // setup win announcement
    const winAnnouncement = document.getElementById('win-announcement');
    winAnnouncement.display = 'none';
    winAnnouncement.innerHTML = '';

    // init music volume slider
    const volumeSlider = document.getElementById('music-volume-slider');
    const volumeSliderDisplay = document.getElementById('music-volume-slider-display');
    setMusicVolume(volumeSlider.value / 100);
    volumeSliderDisplay.innerHTML = `Music: ${volumeSlider.value}%`;
    volumeSlider.oninput = function () {
        volumeSliderDisplay.innerHTML = `Music: ${this.value}%`;
        setMusicVolume(this.value / 100);
    };

    // init sound effects volume slider
    const soundEffectsVolumeSlider = document.getElementById('sound-effects-volume-slider');
    const soundEffectsVolumeSliderDisplay = document.getElementById('sound-effects-volume-slider-display');
    setSoundEffectsVolume(soundEffectsVolumeSlider.value / 100);
    soundEffectsVolumeSliderDisplay.innerHTML = `Sound Effects: ${soundEffectsVolumeSlider.value}%`;
    soundEffectsVolumeSlider.oninput = function () {
        soundEffectsVolumeSliderDisplay.innerHTML = `Sound Effects: ${this.value}%`;
        setSoundEffectsVolume(this.value / 100);
    };

    // init set name button
    const setNameButton = document.getElementById('set-name');
    setNameButton.onclick = function () {
        const nameInput = document.getElementById('name-input');
        const name = nameInput.value;
        socket.emit('client set name', name);
    };
}

function loop() {
    processControls();
    step();
    draw();
    requestAnimationFrame(loop);
}

await init();
loop();
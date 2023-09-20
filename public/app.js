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
import { EffectType } from './special_effect.js';
import { Vec2 } from './vec2.js';
import { specialEffects } from './drawing.js';
import { StaticEffect, DynamicEffect, SplineEffect, UltraDynamicEffect } from './special_effect.js';
import { randomNumberBetween } from './utils.js';
import { setMusicVolume, setSoundEffectsVolume } from './assets.js';

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


setInterval(() => {
    // effect types to test
    // StaticEffect, DynamicEffect, SplineEffect, UltraDynamicEffect

    // static effect
    // const effect = new StaticEffect(
    //     EffectType.MINI_GRASS,
    //     100,
    //     mousePos.clone(),
    //     new Vec2(10, 10),
    //     0,
    //     1.0,
    // );

    // dynamic effect
    const size_vel = randomNumberBetween(-0.1, -0.01);
    const effect = new DynamicEffect(
        EffectType.MINI_GRASS,
        100,
        mousePos.clone(),
        new Vec2(10, 10),
        0,
        1.0,
        new Vec2(
            randomNumberBetween(-1, 1),
            randomNumberBetween(-1, 1),
        ),
        new Vec2(size_vel, size_vel),
        randomNumberBetween(-0.1, -0.01),
        randomNumberBetween(-0.01, -0.001),
    );

    // spline effect
    // const p1 = mousePos.clone();
    // // p2 should be a random point within 200 pixels of p1
    // const p2 = p1.clone().add(new Vec2(
    //     randomNumberBetween(-200, 200),
    //     randomNumberBetween(-200, 200),
    // ));
    // // p3 should be a random point within 200 pixels of p2
    // const p3 = p2.clone().add(new Vec2(
    //     randomNumberBetween(-200, 200),
    //     randomNumberBetween(-200, 200),
    // ));
    // const effect = new SplineEffect(
    //     EffectType.MINI_GRASS, // type
    //     100,   // counter
    //     p1, p2, p3, // points
    //     new Vec2(20, 20),// size
    //     0.0, // rot
    //     1.0,// alpha1
    //     0.01, // tvel
    //     new Vec2(-0.01, -0.01), // size vel
    //     0, // rot vel
    //     -0.01, // alpha vel
    //     0.0, // t acc
    //     new Vec2(0.0, 0.0), //size acc
    //     0.001, // rot acc
    //     0.0, // alpha acc
    // );

    specialEffects.add(effect);
}, 100);


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

    //     <div id="volume-slider-div">
    //     <input id="volume-slider" type="range" min="0" max="100" value="100" class="slider">
    //     <p id="volume-slider-display">Volume: 100%</p>
    // </div>

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
}

function loop() {
    processControls();
    step();
    draw();
    requestAnimationFrame(loop);
}

await init();
loop();
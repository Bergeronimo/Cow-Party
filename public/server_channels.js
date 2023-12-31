import { state } from './state.js';
import { mooSounds } from './assets.js';
import { Song, songs } from './assets.js';
import { audioContext, fadeOut } from './assets.js';
import { countdownSound } from './assets.js';
import { playerNameLookup } from './state.js';
import { soundEffects, SoundEffect } from './assets.js';
import { randomNumberBetween } from './utils.js';
import { Constants } from './constants.js';
import { Vec2 } from './vec2.js';
import { specialEffects } from './drawing.js';
import { StaticEffect, DynamicEffect, SplineEffect, UltraDynamicEffect } from './special_effect.js';
import { EffectType } from './special_effect.js';

const MUSIC_ENABLED = true;
const COUNTDOWN_OFFSET = 0.7;  // Offset in seconds to synchronize countdown.ogg playback with round start


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

    function playRandomSong() {
        if (MUSIC_ENABLED) {
            // stop all songs
            const volumeSlider = document.getElementById('music-volume-slider');
            const volume = volumeSlider.value / 100;
            Object.values(songs).forEach((song) => {
                song.pause();
                song.currentTime = 0;
                song.gainNode.gain.setValueAtTime(volume, audioContext.currentTime); // Reset gain back to 1
            });
            // pick a random song from the Song enum
            const songIndex = Math.floor(Math.random() * Object.keys(songs).length);
            const song = Object.values(songs)[songIndex];
            song.play();

        }
    }

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

    socket.on('server set name', (data) => {
        // io.emit('server set name', { "id": socket.id, "name": name });
        const id = data["id"];
        const name = data["name"];
        playerNameLookup.set(id, name);
    });

    socket.on('server set all player names', (allPlayerNames) => {
        // rcvs a list of [(id, name), (id2, name2)..]
        playerNameLookup.setAll(allPlayerNames);
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

        // Check if any song is currently playing
        const isAudioContextActive = audioContext.state !== 'suspended';
        const isAnySongPlaying = isAudioContextActive && Object.values(songs).some(song => !song.paused);

        if (!isAnySongPlaying) {
            playRandomSong();
        }
    });

    socket.on('server update_time_until_next_round', (time_until_next_round) => {
        console.log("server update_time_until_next_round");
        state.round_in_progress = true;
        state.time_until_next_round = time_until_next_round;

        const timerElement = document.getElementById('timer');
        const text = `next round in: ${time_until_next_round} second(s)`;
        timerElement.textContent = text;

        // Get the rounded-up duration of countdown.ogg
        const roundedDuration = Math.ceil(countdownSound.duration);

        if (time_until_next_round === roundedDuration) {
            // Calculate the delay required
            const delay = (roundedDuration - countdownSound.duration + COUNTDOWN_OFFSET) * 1000; // Convert to milliseconds

            setTimeout(() => {
                countdownSound.currentTime = 0;
                countdownSound.play();
            }, delay);
        }
    });

    socket.on('server game_ended', (winner_id) => {
        Object.values(songs).forEach((song) => {
            fadeOut(song);
        });

        state.round_in_progress = false;

        const gameStateElement = document.getElementById('game-state');
        const text = `BREAK TIME`;
        gameStateElement.textContent = text;

        // hide the timer element
        const timerElement = document.getElementById('timer');
        timerElement.textContent = '';

        const winAnnouncement = document.getElementById('win-announcement');
        winAnnouncement.display = 'block';
        // if winner_id is defined, then display the winner
        if (winner_id) {
            if (winner_id === socket.id) {
                winAnnouncement.innerHTML = `You won the round!`;
                const sound = soundEffects[SoundEffect.WIN];
                sound.currentTime = 0;
                const volumeSlider = document.getElementById('music-volume-slider');
                const volume = volumeSlider.value / 100;
                sound.volume = volume * 0.5;
                sound.play();

                // spawn a bunch of particles
                // 10 balloon particles
                // 10 confetti yellow particles
                // 10 confetti blue particles
                const p = new Vec2(
                    Constants.worldWidth / 2,
                    Constants.worldHeight / 2,
                );
                for (let index = 0; index < 20; index++) {
                    const size_vel = randomNumberBetween(-0.1, -0.01);
                    const effect = new DynamicEffect(
                        EffectType.CONFETTI_BLUE,
                        randomNumberBetween(80, 120),
                        p.clone(),
                        new Vec2(16, 16),
                        0,
                        1.0,
                        new Vec2(
                            randomNumberBetween(-2, 2),
                            randomNumberBetween(-2, 2),
                        ),
                        new Vec2(size_vel, size_vel),
                        randomNumberBetween(-0.1, -0.01),
                        randomNumberBetween(-0.01, -0.001),
                    );
                    specialEffects.add(effect);
                }
                for (let index = 0; index < 20; index++) {
                    const size_vel = randomNumberBetween(-0.1, -0.01);
                    const effect = new DynamicEffect(
                        EffectType.CONFETTI_YELLOW,
                        randomNumberBetween(80, 120),
                        p.clone(),
                        new Vec2(16, 16),
                        0,
                        1.0,
                        new Vec2(
                            randomNumberBetween(-2, 2),
                            randomNumberBetween(-2, 2),
                        ),
                        new Vec2(size_vel, size_vel),
                        randomNumberBetween(-0.1, -0.01),
                        randomNumberBetween(-0.01, -0.001),
                    );
                    specialEffects.add(effect);
                }
                for (let index = 0; index < 5; index++) {
                    const effect = new DynamicEffect(
                        EffectType.BALLOON, // type
                        randomNumberBetween(300, 400),
                        p.clone(), // pos
                        new Vec2(16, 32), // dims
                        0,
                        1.0,
                        new Vec2(
                            randomNumberBetween(-0.2, 0.2),
                            randomNumberBetween(-2, -0.5),
                        ),
                        new Vec2(0, 0),
                        0.0,
                        randomNumberBetween(-0.001, -0.0001),
                    );
                    specialEffects.add(effect);
                }
            } else {
                const winnerName = playerNameLookup.lookupPlayerName(winner_id);
                const sound = soundEffects[SoundEffect.LOSE];
                sound.currentTime = 0;
                const volumeSlider = document.getElementById('music-volume-slider');
                const volume = volumeSlider.value / 100;
                sound.volume = volume * 0.5;
                sound.play();
                if (winnerName) {
                    winAnnouncement.innerHTML = `${winnerName} won the round!`;
                } else {
                    winAnnouncement.innerHTML = `Player ${winner_id} won the round!`;
                }

                // spawn nooses
                for (let index = 0; index < 5; index++) {
                    // random position at top of screen
                    const p = new Vec2(
                        randomNumberBetween(0, Constants.worldWidth),
                        0,
                    );
                    const effect = new DynamicEffect(
                        EffectType.NOOSE, // type
                        randomNumberBetween(1000, 1200),
                        p.clone(), // pos
                        new Vec2(64, 128), // dims
                        0,
                        1.0,
                        new Vec2(
                            0.0,
                            randomNumberBetween(0.5, 1.0),
                        ),
                        new Vec2(0, 0),
                        0.0,
                        0.0,
                    );
                    specialEffects.add(effect);
                }
            }
        } else {
            winAnnouncement.innerHTML = `Somebody won...`;
        }

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

        playRandomSong();
    });

    socket.on('server set all players', (allPlayers) => {
        state.players = allPlayers;
    });

    socket.on('server set all food dots', (allFoodDots) => {
        state.foodDots = allFoodDots;
    });

    socket.on('server reject connection', (data) => {
        const serverFullElement = document.getElementById('server-full');

        // Update the content of the div and show it
        serverFullElement.textContent = 'Server is full! The page will refresh in 1 minute.';
        serverFullElement.style.display = 'block';

        // Disconnect the socket
        socket.disconnect();

        // Refresh the page after 1 minute (60000 milliseconds)
        setTimeout(() => {
            location.reload();
        }, 60000);
    });






}

export { initServerChannels };
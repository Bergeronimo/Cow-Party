import { new_enum } from './utils.js';

// IMAGES
const GrassTexture = new_enum(
    "GRASS_1",
    "GRASS_2",
    "GRASS_3",
    "GRASS_4"
);
const CowTexture = new_enum(
    "COW_1",
    "COW_2",
    "COW_3",
);
const BackgroundTexture = new_enum(
    "BACKGROUND_1",
);
const ParticleTexture = new_enum(
    "CONFETTI_YELLOW",
    "CONFETTI_BLUE",
    "BALLOON",
);

// AUDIO
const MooSound = new_enum(
    "MOO_1_LOW",
    "MOO_1_MID",
    "MOO_1_HIGH",
    "MOO_2_LOW",
    "MOO_2_MID",
    "MOO_2_HIGH",
    "MOO_3_LOW",
    "MOO_3_MID",
    "MOO_3_HIGH",
);
const Song = new_enum(
    "SONG_1",
    "SONG_2",
    "SONG_3",
);

const SoundEffect = new_enum(
    "WIN",
    "LOSE",
);

let footprintTexture = null;
let footstepSoundBuffer = null;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// image assets
let grassTextures = {};
let cowTextures = {};
let backgroundTextures = {};
let particleTextures = {};

// audio assets
let mooSounds = {};
let soundEffects = {};
let songs = {};
let countdownSound = new Audio("./assets/countdown.ogg");

function setMusicVolume(volume) {
    // iterate through values in songs, and set volume
    Object.values(songs).forEach(song => {
        song.gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    });
}

function setSoundEffectsVolume(volume) {
    // iterate through values in mooSounds, and set volume
    Object.values(mooSounds).forEach(moo => {
        moo.volume = volume;
    }
    );

    countdownSound.volume = volume;
}

function loadGrassTextures() {
    return new Promise((resolve) => {
        // load grass textures
        const enum_filename_pairs = [
            [GrassTexture.GRASS_1, "grass1.png"],
            [GrassTexture.GRASS_2, "grass2.png"],
            [GrassTexture.GRASS_3, "grass3.png"],
            [GrassTexture.GRASS_4, "grass4.png"]
        ];

        const grass_start_path = "./assets/";
        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`)
            grassTextures[key] = new Image();
            grassTextures[key].src = grass_start_path + filename;
        }

        let imagesLoaded = 0;
        for (const key in grassTextures) {
            console.log(`adding load listener for ${key}`);
            grassTextures[key].addEventListener('load', function () {
                imagesLoaded++;
                if (imagesLoaded === Object.keys(grassTextures).length) {
                    console.log("grass images loaded");
                    resolve();
                }
            });
        }
    });
}

function loadParticleTextures() {
    return new Promise((resolve) => {
        // load grass textures
        const enum_filename_pairs = [
            [ParticleTexture.BALLOON, "balloon.png"],
            [ParticleTexture.CONFETTI_BLUE, "confetti_blue.png"],
            [ParticleTexture.CONFETTI_YELLOW, "confetti_yellow.png"]
        ];

        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`)
            particleTextures[key] = new Image();
            particleTextures[key].src = "./assets/" + filename;
        }

        let imagesLoaded = 0;
        for (const key in particleTextures) {
            console.log(`adding load listener for ${key}`);
            particleTextures[key].addEventListener('load', function () {
                imagesLoaded++;
                if (imagesLoaded === Object.keys(particleTextures).length) {
                    console.log("all particle textures loaded");
                    resolve();
                }
            });
        }
    });
}


function loadCowTextures() {
    return new Promise((resolve) => {
        // load cow textures
        const enum_filename_pairs = [
            [CowTexture.COW_1, "cow1.png"],
            [CowTexture.COW_2, "cow2.png"],
            [CowTexture.COW_3, "cow3.png"],
        ];

        const cow_start_path = "./assets/";
        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`)
            cowTextures[key] = new Image();
            cowTextures[key].src = cow_start_path + filename;
        }

        let imagesLoaded = 0;
        for (const key in cowTextures) {
            console.log(`adding load listener for ${key}`);
            cowTextures[key].addEventListener('load', function () {
                imagesLoaded++;
                if (imagesLoaded === Object.keys(cowTextures).length) {
                    console.log("cow images loaded");
                    resolve();
                }
            });
        }
    });

}

function loadBackgroundTextures() {
    return new Promise((resolve) => {
        // load background textures
        const enum_filename_pairs = [
            [BackgroundTexture.BACKGROUND_1, "bg.png"],
        ];

        const bg_start_path = "./assets/";
        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`)
            backgroundTextures[key] = new Image();
            backgroundTextures[key].src = bg_start_path + filename;
        }

        let imagesLoaded = 0;
        for (const key in backgroundTextures) {
            console.log(`adding load listener for ${key}`);
            backgroundTextures[key].addEventListener('load', function () {
                imagesLoaded++;
                if (imagesLoaded === Object.keys(backgroundTextures).length) {
                    console.log("bg images loaded");
                    resolve();
                }
            });
        }
    });
}

function loadFootprint() {
    return new Promise((resolve) => {
        footprintTexture = new Image();
        footprintTexture.src = "./assets/footprint.png";

        footprintTexture.addEventListener('load', function () {
            console.log("footprint loaded");
            resolve();
        });
    });
}

function loadMoos() {
    return new Promise((resolve) => {
        // load moo sounds
        const enum_filename_pairs = [
            [MooSound.MOO_1_LOW, "moo1_low.ogg"],
            [MooSound.MOO_1_MID, "moo1_mid.ogg"],
            [MooSound.MOO_1_HIGH, "moo1_high.ogg"],
            [MooSound.MOO_2_LOW, "moo2_low.ogg"],
            [MooSound.MOO_2_MID, "moo2_mid.ogg"],
            [MooSound.MOO_2_HIGH, "moo2_high.ogg"],
            [MooSound.MOO_3_LOW, "moo3_low.ogg"],
            [MooSound.MOO_3_MID, "moo3_mid.ogg"],
            [MooSound.MOO_3_HIGH, "moo3_high.ogg"],
        ];

        const moo_start_path = "./assets/";
        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`);
            mooSounds[key] = new Audio(moo_start_path + filename);
        }

        let soundsLoaded = 0;
        for (const key in mooSounds) {
            console.log(`adding load listener for ${key}`);
            mooSounds[key].addEventListener('canplaythrough', function () {
                soundsLoaded++;
                if (soundsLoaded === Object.keys(mooSounds).length) {
                    console.log("moo sounds loaded");
                    resolve();
                }
            });
        }
    });
}

function loadSoundEffects() {
    return new Promise((resolve) => {
        // load moo sounds
        const enum_filename_pairs = [
            [SoundEffect.WIN, "win.ogg"],
            [SoundEffect.LOSE, "lose.ogg"],
        ];

        const sound_effects_start_path = "./assets/";
        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`);
            soundEffects[key] = new Audio(sound_effects_start_path + filename);
        }

        let soundsLoaded = 0;
        for (const key in soundEffects) {
            console.log(`adding load listener for ${key}`);
            soundEffects[key].addEventListener('canplaythrough', function () {
                soundsLoaded++;
                if (soundsLoaded === Object.keys(soundEffects).length) {
                    console.log("soundEffects sounds loaded");
                    resolve();
                }
            });
        }
    });
}

function loadSongs() {
    return new Promise((resolve) => {
        const enum_filename_pairs = [
            [Song.SONG_1, "music1.ogg"],
            [Song.SONG_2, "music2.ogg"],
            [Song.SONG_3, "music3.ogg"],
        ];

        for (const [key, filename] of enum_filename_pairs) {
            console.log(`setting asset source for ${filename}`);
            const song = new Audio("./assets/" + filename);

            const source = audioContext.createMediaElementSource(song);
            const gainNode = audioContext.createGain();

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            song.gainNode = gainNode;  // Save gainNode for later use

            songs[key] = song;
        }

        let soundsLoaded = 0;
        for (const key in songs) {
            console.log(`adding load listener for ${key}`);
            songs[key].addEventListener('canplaythrough', function () {
                soundsLoaded++;
                if (soundsLoaded === Object.keys(songs).length) {
                    console.log("songs loaded");
                    resolve();
                }
            });
        }
    });
}

function loadFootstepSound() {
    const url = "./assets/footstep.ogg";

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                footstepSoundBuffer = buffer;
                console.log("footstep sound loaded");
                resolve();
            })
            .catch(err => {
                console.error("Error loading footstep sound: ", err);
                reject(err);
            });
    });
}

function load_images() {
    return new Promise((resolve) => {
        Promise.all([
            loadGrassTextures(),
            loadCowTextures(),
            loadBackgroundTextures(),
            loadFootprint(),
            loadParticleTextures(),
        ]).then(() => {
            console.log("all images loaded");
            resolve();
        });
    });
}

function load_sounds() {
    return new Promise((resolve, reject) => {
        Promise.all([
            loadMoos(),
            loadSongs(),
            loadFootstepSound(),
            loadSoundEffects(),
        ]).then(() => {
            console.log("all sounds loaded");
            resolve();
        }).catch(error => {
            console.error("Error loading sounds:", error);
            reject(error);
        });
    });
}

function fadeOut(song) {
    const volumeSlider = document.getElementById('music-volume-slider');
    const volume = volumeSlider.value / 100;

    const fadeDuration = 1;  // Fade duration in seconds
    const gainNode = song.gainNode;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeDuration);

    setTimeout(() => {
        song.pause();
        song.currentTime = 0; // Reset song to start position
        gainNode.gain.setValueAtTime(1, audioContext.currentTime); // Reset gain back to 1
    }, fadeDuration * 1000);
}


function playFootstepSound(pitchFactor = 1.0) {
    if (!footstepSoundBuffer) {
        console.error("Footstep sound is not loaded yet.");
        return;
    }

    // Get the volume from the slider (value is between 0 and 100)
    const volumeSlider = document.getElementById("sound-effects-volume-slider");
    const volume = volumeSlider.value / 100 * 0.1;  // Convert it to a range between 0 and 1


    let source = audioContext.createBufferSource();
    source.buffer = footstepSoundBuffer;

    // Adjust the pitch by modifying the playback rate
    source.playbackRate.setValueAtTime(pitchFactor, audioContext.currentTime);

    // As before: Create a GainNode, set the volume, and connect everything
    let gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
}


export { GrassTexture, grassTextures };
export { CowTexture, cowTextures };
export { MooSound, mooSounds };
export { footprintTexture };
export { Song, songs };
export { BackgroundTexture, backgroundTextures };
export { load_images, load_sounds };
export { fadeOut, audioContext };
export { countdownSound };
export { setMusicVolume, setSoundEffectsVolume };
export { playFootstepSound };
export { SoundEffect, soundEffects };
export { ParticleTexture, particleTextures };
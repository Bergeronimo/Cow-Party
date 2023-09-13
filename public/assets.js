import { new_enum } from './utils.js';

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

// const moo 1 / 2 / 3, each has high, med, low


const BackgroundTexture = new_enum(
    "BACKGROUND_1",
);

let grassTextures = {};
let cowTextures = {};
let backgroundTextures = {};
let mooSounds = {};

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

function load_images() {
    return new Promise((resolve) => {
        Promise.all([
            loadGrassTextures(),
            loadCowTextures(),
            loadBackgroundTextures(),
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
            //loadJoinSound(),
        ]).then(() => {
            console.log("all sounds loaded");
            resolve();
        }).catch(error => {
            console.error("Error loading sounds:", error);
            reject(error);
        });
    });
}

export { GrassTexture, grassTextures };
export { CowTexture, cowTextures };
export { MooSound, mooSounds };
export { BackgroundTexture, backgroundTextures };
export { load_images, load_sounds };
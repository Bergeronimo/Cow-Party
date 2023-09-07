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


let grassTextures = {};
let cowTextures = {};
function load_images() {
    return new Promise((resolve) => {
        // load grass textures
        const grassTextureFileNames = ["grass1.png", "grass2.png", "grass3.png", "grass4.png"];
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
                    console.log("all images loaded");
                    resolve();
                }
            });
        }
    });
}

export { GrassTexture, grassTextures, load_images };
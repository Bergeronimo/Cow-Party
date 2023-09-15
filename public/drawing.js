import { state } from './state.js';
import { GrassTexture, grassTextures } from './assets.js';
import { CowTexture, cowTextures } from './assets.js';
import { BackgroundTexture, backgroundTextures } from './assets.js';
import { socket } from './connection.js';
import { Constants } from './constants.js';
import { stringToHash } from './utils.js';
import { pickAnIndexFromHashKey, pickOneFromHashKey } from './utils.js';
import { EffectType } from './special_effect.js';

const canvas = document.getElementById('main-canvas');
canvas.width = Constants.worldWidth;
canvas.height = Constants.worldHeight;

const ctx = canvas.getContext('2d');
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const cowTextureSizeBiases = {
    [CowTexture.COW_1]: { sx: 1.25, sy: 1.15, ox: 0.0, oy: -2.5 },  // silver
    [CowTexture.COW_2]: { sx: 1.1, sy: 1.06, ox: 2.0, oy: -2.0 },   // blue
    [CowTexture.COW_3]: { sx: 1.26, sy: 1.19, ox: 2.5, oy: -5 },    // black gold
};

class SpecialEffects {
    constructor() {
        this.effects = [];
    }

    step() {
        this.effects.forEach(effect => {
            effect.step();
        });
        this.effects = this.effects.filter(effect => effect.counter > 0);
    }

    add(effect) {
        if (this.effects.length < 100) {
            this.effects.push(effect);
        }
    }
}
const specialEffects = new SpecialEffects();

function drawCow(player, id) {
    // Draw a red bounding box around the player
    // ctx.beginPath();
    // ctx.rect(
    //     player.x - player.radius, // X coordinate of the top-left corner
    //     player.y - player.radius, // Y coordinate of the top-left corner
    //     player.radius * 2,           // Width of the rectangle
    //     player.radius * 2            // Height of the rectangle
    // );
    // ctx.strokeStyle = 'red';
    // ctx.lineWidth = 2; // Adjust the line width as needed
    // ctx.stroke();
    // ctx.closePath();


    const cowType = pickOneFromHashKey(id, Object.keys(Object.keys(CowTexture)));
    const cowTexture = cowTextures[cowType];
    const cowTextureSizeBias = cowTextureSizeBiases[cowType];
    // if cowTextureSizeBias is undefined, print
    if (cowTextureSizeBias === undefined) {
        console.log(`cowTextureSizeBias is undefined for id: ${id}, cowTypeIndex: ${cowTypeIndex}`);
    }


    let start_x = player.x - player.radius * cowTextureSizeBias.sx + cowTextureSizeBias.ox;
    let start_y = player.y - player.radius * cowTextureSizeBias.sy + cowTextureSizeBias.oy;
    try {
        ctx.drawImage(cowTexture,
            start_x, start_y, // pos
            player.radius * 2 * cowTextureSizeBias.sx, // width
            player.radius * 2 * cowTextureSizeBias.sy // height
        );
    } catch (e) {
        console.log(`id: ${id}, cowTextureIndex: ${cowTextureIndex}`);
    }

    // if the cow is you, draw a green circle around him
    if (id === socket.id) {
        ctx.beginPath();
        ctx.arc(player.x + cowTextureSizeBias.ox, player.y + cowTextureSizeBias.oy, player.radius, 0, Math.PI * 2);
        // thinner
        ctx.lineWidth = 1;
        // no fill
        // lime green
        ctx.strokeStyle = '#00FF00';
        ctx.stroke();
        ctx.closePath();
    }


    // //    circular hitbox for seeing if the asset is round
    // ctx.beginPath();
    // ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    // ctx.fillStyle = 'red';
    // ctx.fill();
    // ctx.closePath();

    // Adjust font, position, and color for the ID text
    //ctx.font = (id === socket.id) ? 'bold 12px NokiaFC22' : '12px NokiaFC22';
    // ctx.fillStyle = 'black';
    // ctx.textAlign = 'left';
    // ctx.textBaseline = 'top';
    // ctx.fillText(id, player.x - player.radius, player.y - player.radius);
}

function drawFoodDot(foodDot, id) {
    // bail if the food dot is null
    if (foodDot === null) return;

    // Draw the food dot via green dot old
    // ctx.beginPath();
    // ctx.arc(foodDot.x, foodDot.y, foodDotRadius, 0, Math.PI * 2);
    // ctx.fillStyle = foodDotColor;
    // ctx.fill();
    // ctx.closePath();

    // Draw the food dot via grass texture
    const foodDotTypeIndex = pickAnIndexFromHashKey(id, Object.keys(grassTextures));
    const texture = grassTextures[foodDotTypeIndex];
    let start_x = foodDot.x - Constants.foodDotRadius;
    let start_y = foodDot.y - Constants.foodDotRadius;
    ctx.drawImage(texture,
        start_x, start_y, Constants.foodDotRadius * 2, Constants.foodDotRadius * 2);

    // draw a red hitbox around the grass
    // ctx.beginPath();
    // ctx.rect(
    //     start_x, // X coordinate of the top-left corner
    //     start_y, // Y coordinate of the top-left corner
    //     foodDotRadius * 2,           // Width of the rectangle
    //     foodDotRadius * 2            // Height of the rectangle
    // );
    // ctx.strokeStyle = 'red';
    // ctx.lineWidth = 2; // Adjust the line width as needed
    // ctx.stroke();
    // ctx.closePath();


}

function drawSpecialEffect(effect) {
    // EffectType.MINI_GRASS -> grassTextures[0]; 
    let texture = null;
    switch (effect.type) {
        case EffectType.MINI_GRASS:
            texture = grassTextures[0];
            break;
        default:
            console.log(`drawSpecialEffect: unknown effect type: ${effect.type}`);
            return;
    }

    ctx.save();
    ctx.translate(effect.pos.x, effect.pos.y);
    ctx.rotate(effect.rot);
    ctx.globalAlpha = effect.alpha;
    ctx.drawImage(
        texture,
        -effect.size.x / 2,
        -effect.size.y / 2,
        effect.size.x,
        effect.size.y
    );
    ctx.restore();
}

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    ctx.drawImage(backgroundTextures[BackgroundTexture.BACKGROUND_1], 0, 0, canvas.width, canvas.height);

    // draw cows
    for (let id in state.players) {
        if (id === null) continue; // skip null values (deleted players
        const player = state.players[id];
        if (player) {
            drawCow(player, id);
        }
    }
    // draw food dots
    for (let id in state.foodDots) {
        const foodDot = state.foodDots[id];
        if (foodDot) {
            drawFoodDot(foodDot, id);
        }
    }

    // draw special effects
    specialEffects.effects.forEach(effect => {
        if (effect === undefined) return;
        drawSpecialEffect(effect);
    });
}


export { canvas, ctx, drawCow, drawFoodDot, draw, specialEffects, drawSpecialEffect };
import { state } from './state.js';
import { GrassTexture, grassTextures } from './assets.js';
import { CowTexture, cowTextures } from './assets.js';
import { BackgroundTexture, backgroundTextures } from './assets.js';
import { socket } from './connection.js';
import { Constants } from './constants.js';
import { stringToHash } from './utils.js';

const canvas = document.getElementById('main-canvas');
canvas.width = Constants.worldWidth;
canvas.height = Constants.worldHeight;

const ctx = canvas.getContext('2d');
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const playerCowTextureIndexCache = {};
const cowTextureSizeBiases = {
    [CowTexture.COW_1]: { sx: 1.25, sy: 1.15, ox: 0.0, oy: -2.5 },  // silver
    [CowTexture.COW_2]: { sx: 1.1, sy: 1.06, ox: 2.0, oy: -2.0 },   // blue
    [CowTexture.COW_3]: { sx: 1.26, sy: 1.19, ox: 2.5, oy: -5 },    // black gold
};

function getCowTextureIndexFromPlayerSocketId(playerSocketId) {
    if (playerCowTextureIndexCache.hasOwnProperty(playerSocketId)) {
        return playerCowTextureIndexCache[playerSocketId];
    } else {
        const hash = stringToHash(playerSocketId);
        const playerCowTextureIndex = hash % Object.keys(CowTexture).length;
        playerCowTextureIndexCache[playerSocketId] = playerCowTextureIndex;
        return playerCowTextureIndex;
    }
}

function drawCow(player, id) {
    // Draw a red bounding box around the circle
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




    const cowTextureIndex = getCowTextureIndexFromPlayerSocketId(id);
    const cowTexture = cowTextures[cowTextureIndex];
    const cowTextureSizeBias = cowTextureSizeBiases[cowTextureIndex];
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


    // //    circular hitbox for seeing if the asset is round
    // ctx.beginPath();
    // ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    // ctx.fillStyle = 'red';
    // ctx.fill();
    // ctx.closePath();

    // Adjust font, position, and color for the ID text
    ctx.font = (id === socket.id) ? 'bold 12px Arial' : '12px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(id, player.x - player.radius, player.y - player.radius);
}

function drawFoodDot(foodDot, id) {

    // Draw the food dot via green dot old
    // ctx.beginPath();
    // ctx.arc(foodDot.x, foodDot.y, foodDotRadius, 0, Math.PI * 2);
    // ctx.fillStyle = foodDotColor;
    // ctx.fill();
    // ctx.closePath();

    // Draw the food dot via grass texture
    //// pick texture based on the food dot id
    const textureIndex = id % Object.keys(GrassTexture).length;
    const texture = grassTextures[textureIndex];
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

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw background
    ctx.drawImage(backgroundTextures[BackgroundTexture.BACKGROUND_1], 0, 0, canvas.width, canvas.height);


    // draw cows
    for (let id in state.circles) {
        if (id === null) continue; // skip null values (deleted circles
        let circle = state.circles[id];
        if (circle) {
            drawCow(circle, id);
        }
    }
    // draw food dots
    for (let id in state.foodDots) {
        drawFoodDot(state.foodDots[id], id);
    }
}

export { canvas, ctx, drawCow, drawFoodDot, getCowTextureIndexFromPlayerSocketId, draw };
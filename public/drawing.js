import { state } from './state.js';
import { GrassTexture, grassTextures } from './assets.js';
import { socket } from './connection.js';
import { Constants } from './constants.js';

const canvas = document.getElementById('main-canvas');
canvas.width = 640;
canvas.height = 640;

const ctx = canvas.getContext('2d');
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

function drawCircle(circleData, id) {
    ctx.beginPath();
    ctx.arc(circleData.x, circleData.y, circleData.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    // Draw a red bounding box around the circle
    ctx.beginPath();
    ctx.rect(
        circleData.x - circleData.radius, // X coordinate of the top-left corner
        circleData.y - circleData.radius, // Y coordinate of the top-left corner
        circleData.radius * 2,           // Width of the rectangle
        circleData.radius * 2            // Height of the rectangle
    );
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2; // Adjust the line width as needed
    ctx.stroke();
    ctx.closePath();

    // Adjust font, position, and color for the ID text
    ctx.font = (id === socket.id) ? 'bold 12px Arial' : '12px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(id, circleData.x - circleData.radius, circleData.y - circleData.radius);
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
    for (let id in state.circles) {
        let circle = state.circles[id];
        if (circle) {
            drawCircle(circle, id);
        }
    }
    // draw food dots
    for (let id in state.foodDots) {
        drawFoodDot(state.foodDots[id], id);
    }
}

export { canvas, ctx, drawCircle, drawFoodDot, draw };
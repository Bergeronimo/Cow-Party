const canvas = document.getElementById('main-canvas');
canvas.width = 640;
canvas.height = 640;
const ctx = canvas.getContext('2d');


const SPEED = 1;
let circles = {};
let eatenFoodIDs = [];
let foodDots = {};
const foodDotColor = "#00FF00";
const foodDotRadius = 2;

// circles[socket.id] = {
//     x: canvas.width / 2,
//     y: canvas.height / 2,
//     radius: 20
// };

const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};





const socket = io.connect('http://98.197.238.51:3000');

document.addEventListener('keydown', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = false;
    }
});

socket.on('server update circles', (data) => {
    if (socket.id in circles) {
        data[socket.id] = circles[socket.id];
        circles = data;
    }
    else {
        circles = data;
    }
});

socket.on('server consumed food dot ids', (allEatenFoodDotIds) => {
    allEatenFoodDotIds.forEach((eatenFoodDotId) => {
        if (foodDots.hasOwnProperty(eatenFoodDotId)) {
            delete foodDots[eatenFoodDotId];
        }
    });
});

socket.on('server set all food dots', (data) => {
    foodDots = data;
});

let pingTimestamp;

// Emit ping event to the server
function sendPing() {
    pingTimestamp = Date.now();
    socket.emit('client ping', pingTimestamp);
}

// Listen for pong event from the server
socket.on('server pong', (timestamp) => {
    const latency = Date.now() - timestamp;
    document.getElementById('pingDisplay').textContent = `Ping: ${latency}ms`;
});
setInterval(sendPing, 1000);

// listen for a new food dot event
socket.on('server new food dot kv', (foodDotKV) => {
    let key = foodDotKV["key"];
    let foodDot = foodDotKV["value"];
    foodDots[key] = foodDot;
});

// transmit updated circle positions
setInterval(() => {
    const myCircle = circles[socket.id];
    socket.emit('client player update', myCircle);
}, 1000 / 15);

// transmit consumed food dots
setInterval(() => {
    socket.emit('client consumed food dots', eatenFoodIDs);
    eatenFoodIDs = [];
}, 1000 / 8);

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
    ctx.beginPath();
    ctx.arc(foodDot.x, foodDot.y, foodDotRadius, 0, Math.PI * 2);
    ctx.fillStyle = foodDotColor;
    ctx.fill();
    ctx.closePath();

}

function update() {
    if (socket.id) {
        const myCircle = circles[socket.id];
        if (myCircle) {
            // process input
            myCircle.vx = 0;
            myCircle.vy = 0;
            if (keysPressed.ArrowUp) myCircle.vy = -SPEED;
            if (keysPressed.ArrowDown) myCircle.vy = SPEED;
            if (keysPressed.ArrowLeft) myCircle.vx = -SPEED;
            if (keysPressed.ArrowRight) myCircle.vx = SPEED;
        }
    }


    // step all circles
    Object.values(circles).forEach(circle => {
        if (circle) {
            circle.x += circle.vx;
            circle.y += circle.vy;
        }
    });

    // check if any foods are eaten

    const circle = circles[socket.id];
    if (circle) {
        for (const foodID in foodDots) {
            if (foodDots.hasOwnProperty(foodID)) {
                const foodDot = foodDots[foodID];

                // Calculate the distance between the circle and the food dot
                const distance = Math.sqrt(
                    Math.pow(circle.x - foodDot.x, 2) + Math.pow(circle.y - foodDot.y, 2)
                );

                if (distance < circle.radius) {
                    circle.radius += 1;
                    eatenFoodIDs.push(foodID);
                    delete foodDots[foodID];
                }
            }
        }
    }

    // DRAW
    // draw players
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in circles) {
        let circle = circles[id];
        if (circle) {
            drawCircle(circle, id);
        }
    }
    // draw food dots
    for (let id in foodDots) {
        drawFoodDot(foodDots[id], id);
    }

    requestAnimationFrame(update);
}

update();
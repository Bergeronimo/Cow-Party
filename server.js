const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server);

const WORLD_WIDTH = 640;
const WORLD_HEIGHT = 640;

let circles = {}; // Store circle data for each client

// FOOD DOTS
let nextFoodDotId = 0;
let foodDots = {};
let allEatenFoodDotIds = [];
const maxFoodDots = 32;
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function trySpawnRandomFoodDot() {
    const keys = Object.keys(foodDots);
    if (keys.length >= maxFoodDots) {
        return;
    }
    const x = getRandom(0, WORLD_WIDTH);
    const y = getRandom(0, WORLD_HEIGHT);

    const foodDotKey = nextFoodDotId;
    nextFoodDotId += 1;

    let newFoodDot = { x, y }
    foodDots[foodDotKey] = newFoodDot;

    let foodDotKV = { "key": foodDotKey, "value": newFoodDot }
    return foodDotKV;
}

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Initialize circle for the connected client
    circles[socket.id] = {
        x: Math.random() * 500, // Random position for demonstration
        y: Math.random() * 500,
        vx: 0,
        vy: 0,
        radius: 4
    };

    // Send the updated circles data to all clients
    socket.emit('update circles', circles);
    socket.emit('server set all food dots', foodDots);

    socket.on('client player update', (data) => {
        circles[socket.id] = data; // Update the circle data for this client
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        delete circles[socket.id]; // Remove circle data for the disconnected client
        io.emit('server update circles', circles); // Broadcast updated data
    });

    socket.on('client ping', (timestamp) => {
        socket.emit('server pong', timestamp);
    });

    socket.on('client consumed food dots', (eatenFoodDotIds) => {
        eatenFoodDotIds.forEach((eatenFoodDotId) => {
            if (foodDots.hasOwnProperty(eatenFoodDotId)) {
                delete foodDots[eatenFoodDotId];
            }
        });
        allEatenFoodDotIds = allEatenFoodDotIds.concat(eatenFoodDotIds);
    });

    // update all circles 
    setInterval(() => {
        io.emit('server update circles', circles); // Broadcast updated data
    }, 1000 / 15);

    // transmit all consumed food dots 
    setInterval(() => {
        io.emit('server consumed food dot ids', allEatenFoodDotIds);
        allEatenFoodDotIds = [];
    }, 1000 / 8);
});


// periodically spawn food dots
setInterval(() => {
    let foodDotKV = trySpawnRandomFoodDot();
    io.emit('server new food dot kv', foodDotKV);

}, 1000 / 1);

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});
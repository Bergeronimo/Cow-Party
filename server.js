const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server,
    {
        cors: {
            origin: "*", // Allow all origins
            methods: ["GET", "POST"],
            credentials: true
        }
    }
);

const WORLD_WIDTH = 640;
const WORLD_HEIGHT = 640;

let players = {}; // Store player data for each client

// FOOD DOTS
let nextFoodDotId = 0;
let foodDots = {};
let allEatenFoodDotIds = [];
let round_in_progress = false;
const round_length = 15;
let round_time_remaining = round_length;
const break_length = 3;
let time_until_next_round = break_length;


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

    // Initialize player for the connected client
    players[socket.id] = {
        x: Math.random() * 500, // Random position for demonstration
        y: Math.random() * 500,
        vx: 0,
        vy: 0,
        radius: 4,
    };


    // Send the updated players data to all clients
    socket.emit('server update players', players);
    socket.emit('server set all food dots', foodDots);

    socket.on('client player update', (data) => {
        players[socket.id] = data; // Update the player data for this client
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        delete players[socket.id]; // Remove player data for the disconnected client
        io.emit('server update players', players); // Broadcast updated data
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

    //     socket.emit('client moo', randomMooSound);
    socket.on('client moo', (randomMooSound) => {
        io.emit('server moo', { "id": socket.id, "moo": randomMooSound });
    });

    // update all players 
    setInterval(() => {
        io.emit('server update players', players); // Broadcast updated data
    }, 1000 / 15);

    // transmit all consumed food dots 
    setInterval(() => {
        if (allEatenFoodDotIds.length > 0) {
            io.emit('server consumed food dot ids', allEatenFoodDotIds);
            allEatenFoodDotIds = [];
        }
    }, 1000 / 4);
});

// periodically spawn food dots
setInterval(() => {
    let foodDotKV = trySpawnRandomFoodDot();
    io.emit('server new food dot kv', foodDotKV);

}, 1000 / 1);

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});

function step() {
    if (round_in_progress == true) {
        round_time_remaining -= 1;
        io.emit('server update_round_time_remaining', round_time_remaining);

        if (round_time_remaining <= 0) {
            // sort players by size
            let sorted_players = Object.values(players).sort((a, b) => (a.radius > b.radius) ? 1 : -1);
            const top_size = sorted_players[sorted_players.length - 1].radius;
            const top_cows = sorted_players.filter(player => player.radius == top_size);
            // if more than one cow is the biggest, then add 5 seconds to the timer
            if (top_cows.length > 1) {
                round_time_remaining += 5;
            } else {
                const winner_id = top_cows[0].id;
                console.log(winner_id); //undefined
                round_in_progress = false;
                round_time_remaining = 0;
                time_until_next_round = break_length;
                io.emit('server game_ended', winner_id);
            }
        }
    } else {
        // if round not in progress, countdown till next game

        time_until_next_round -= 1;
        io.emit('server update_time_until_next_round', time_until_next_round);

        if (time_until_next_round <= 0) {
            round_in_progress = true;
            round_time_remaining = round_length;

            // reset all players
            Object.keys(players).forEach((key) => {
                players[key].x = Math.random() * 500;
                players[key].y = Math.random() * 500;
                players[key].vx = 0;
                players[key].vy = 0;
                players[key].radius = 4;
            });

            // reset all food dots
            foodDots = {};
            allEatenFoodDotIds = [];
            nextFoodDotId = 0;
            io.emit('server set all players', players);
            io.emit('server set all food dots', foodDots);
            io.emit('server round_start');
        }
    }
}
setInterval(step, 1000 / 1);
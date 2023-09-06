const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server);

let circles = {}; // Store circle data for each client

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    // Initialize circle for the connected client
    circles[socket.id] = {
        x: Math.random() * 500, // Random position for demonstration
        y: Math.random() * 500,
        radius: 20
    };

    // Send the updated circles data to all clients
    io.emit('update circles', circles);

    socket.on('move circle', (data) => {
        circles[socket.id] = data; // Update the circle data for this client
        io.emit('update circles', circles); // Broadcast updated data
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        delete circles[socket.id]; // Remove circle data for the disconnected client
        io.emit('update circles', circles); // Broadcast updated data
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('listening on *:3000');
});
let pingTimestamp;

// start latency check
const startLatencyCheck = (socket) => {
    function sendPing() {
        pingTimestamp = Date.now();
        socket.emit('client ping', pingTimestamp);
    }

    socket.on('server pong', (timestamp) => {
        const latency = Date.now() - timestamp;
        document.getElementById('pingDisplay').textContent = `Ping: ${latency}ms`;
    });

    setInterval(sendPing, 1000);
}

export { startLatencyCheck };
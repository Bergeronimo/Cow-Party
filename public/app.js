const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let circles = {};
let myCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20
};

const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

function drawCircle(circleData, id) {
    ctx.beginPath();
    ctx.arc(circleData.x, circleData.y, circleData.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    // Adjust font, position, and color for the ID text
    ctx.font = (id === socket.id) ? 'bold 12px Arial' : '12px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(id, circleData.x - circleData.radius, circleData.y - circleData.radius);
}

function update() {
    const speed = 5;

    if (keysPressed.ArrowUp) myCircle.y -= speed;
    if (keysPressed.ArrowDown) myCircle.y += speed;
    if (keysPressed.ArrowLeft) myCircle.x -= speed;
    if (keysPressed.ArrowRight) myCircle.x += speed;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in circles) {
        drawCircle(circles[id], id);
    }

    socket.emit('move circle', myCircle);
    requestAnimationFrame(update);
}

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

socket.on('update circles', (data) => {
    circles = data;
});

update();
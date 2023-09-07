import { socket } from './connection.js'
import { state } from './state.js'
import { Constants } from './constants.js'

const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

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

function processControls() {
    if (socket.id) {
        const myCircle = state.circles[socket.id];
        if (myCircle) {
            // process input
            myCircle.vx = 0;
            myCircle.vy = 0;
            if (keysPressed.ArrowUp) myCircle.vy = -Constants.SPEED;
            if (keysPressed.ArrowDown) myCircle.vy = Constants.SPEED;
            if (keysPressed.ArrowLeft) myCircle.vx = -Constants.SPEED;
            if (keysPressed.ArrowRight) myCircle.vx = Constants.SPEED;
        }
    }
}

export { keysPressed, processControls };
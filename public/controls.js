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
        //Navigation events control elements like slider without preventing default
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    if (keysPressed.hasOwnProperty(event.key)) {
        keysPressed[event.key] = false;
    }
});

// add event listeners on 
/* <div class="ui" id="movement-buttons">
<button id="up-button">Up</button>
<button id="down-button">Down</button>
<button id="left-button">Left</button>
<button id="right-button">Right</button>
</div> */

// const upButton = document.getElementById('up-button');
// const downButton = document.getElementById('down-button');
// const leftButton = document.getElementById('left-button');
// const rightButton = document.getElementById('right-button');

// // button press for phone
// upButton.addEventListener('touchstart', () => {
//     keysPressed.ArrowUp = true;
// });
// downButton.addEventListener('touchstart', () => {
//     keysPressed.ArrowDown = true;
// });
// leftButton.addEventListener('touchstart', () => {
//     keysPressed.ArrowLeft = true;
// });
// rightButton.addEventListener('touchstart', () => {
//     keysPressed.ArrowRight = true;
// });

// button release for phone
// upButton.addEventListener('touchend', () => {
//     keysPressed.ArrowUp = false;
// });
// downButton.addEventListener('touchend', () => {
//     keysPressed.ArrowDown = false;
// });
// leftButton.addEventListener('touchend', () => {
//     keysPressed.ArrowLeft = false;
// });
// rightButton.addEventListener('touchend', () => {
//     keysPressed.ArrowRight = false;
// });



function processControls() {
    if (socket.id) {
        const myPlayer = state.players[socket.id];
        if (myPlayer) {
            // process input
            myPlayer.vx = 0;
            myPlayer.vy = 0;
            if (keysPressed.ArrowUp) myPlayer.vy = -Constants.SPEED;
            if (keysPressed.ArrowDown) myPlayer.vy = Constants.SPEED;
            if (keysPressed.ArrowLeft) myPlayer.vx = -Constants.SPEED;
            if (keysPressed.ArrowRight) myPlayer.vx = Constants.SPEED;
        }
    }
}

export { keysPressed, processControls };
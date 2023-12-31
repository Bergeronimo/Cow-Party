// const { spawn } = require('child_process');
const spawn = require('cross-spawn');

const child = spawn('npm', ['run', 'start-bot']);

// 40 kills the server, 12 server limit
const NUM_INSTANCES = 4;

for (let i = 0; i < NUM_INSTANCES; i++) {
    const child = spawn('npm', ['run', 'start-bot']);

    child.stdout.on('data', (data) => {
        console.log(`[Bot ${i}] stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`[Bot ${i}] stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`[Bot ${i}] child process exited with code ${code}`);
    });
}

import { socket } from "./connection.js";
import { state } from "./state.js";

const updateConnectedPlayersUI = () => {
    // if socket is not connected, bail
    if (!socket.connected) {
        return;
    }

    const playerList = document.getElementById('player-list-ul');
    playerList.innerHTML = '';

    // bail if state.players is empty
    if (Object.keys(state.players).length === 0) {
        return;
    }
    // make a list of players by [[id, score]...]
    let players = [];
    for (const id in state.players) {
        // skip if id is undefined
        if (id === null) {
            continue;
        }
        const player = state.players[id];
        // skip if player is undefined
        if (player === null) {
            continue;
        }
        // id is "(you)" if id is socket.id
        const idd = id === socket.id ? "(you)" : id;

        const id_player_tuple = [idd, player.radius];
        players.push(id_player_tuple);
    }
    // sort by score
    players.sort((a, b) => {
        return b[1] - a[1];
    });

    // go through players and add to playerList
    for (const player of players) {
        if (!player) {
            return;
        }
        const id = player[0];
        const score = player[1];
        const li = document.createElement('li');
        // make a display string
        // id: {radius}
        // truncate the id to like 6 chars
        const idd = id.substring(0, 6);
        const str = `${idd}: ${score}`;
        li.innerText = str;
        // if the id is you, make it bold and bright green
        if (id === "(you)") {
            li.style.fontWeight = "bold";
            li.style.color = "lime";
        }
        playerList.appendChild(li);
    }


}

setInterval(updateConnectedPlayersUI, 1000 / 2);

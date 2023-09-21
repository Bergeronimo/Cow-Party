class State {
    constructor() {
        this.players = {};
        this.eatenFoodIDs = [];
        this.foodDots = {};

        this.footstepCountdown = {};


        this.round_in_progress = false;
        this.time_until_next_round = -1;
        this.round_time_remaining = -1;
    }
}
const state = new State();

class PlayerNameLookup {
    constructor() {
        this.player_id_to_name = {};
    }

    lookupPlayerName(player_id) {
        if (player_id in this.player_id_to_name) {
            return this.player_id_to_name[player_id];
        } else {
            return player_id;
        }
    }

    set(player_id, name) {
        this.player_id_to_name[player_id] = name;
    }

    setAll(allPlayersIdNamePairs) {
        for (let i = 0; i < allPlayersIdNamePairs.length; i++) {
            let id = allPlayersIdNamePairs[i][0];
            let name = allPlayersIdNamePairs[i][1];
            this.set(id, name);
        }
    }

}
const playerNameLookup = new PlayerNameLookup();

export { state };
export { playerNameLookup };
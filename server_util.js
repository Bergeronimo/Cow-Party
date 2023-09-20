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
}
const playerNameLookup = new PlayerNameLookup();

module.exports = { playerNameLookup };
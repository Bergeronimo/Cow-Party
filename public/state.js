
class State {
    constructor() {
        this.players = {};
        this.eatenFoodIDs = [];
        this.foodDots = {};

        this.round_in_progress = false;
        this.time_until_next_round = -1;
        this.round_time_remaining = -1;
    }
}

const state = new State();

export { state };
import { Vec2 } from "./vec2.js";
import { new_enum } from "./utils.js";

const EffectType = new_enum(
    "MINI_GRASS",
);

class StaticEffect {
    constructor(type, counter, pos, size, rot, alpha) {
        this.type = type;
        this.counter = counter;
        this.pos = pos;
        this.size = size;
        this.rot = rot;
        this.alpha = alpha;
    }

    step() {
        if (this.counter > 0) {
            this.counter -= 1;
        }
    }
}

class DynamicEffect {
    constructor(type, counter, pos, size, rot, alpha, vel, svel, rotvel, alpha_vel) {
        this.type = type;
        this.counter = counter;
        this.pos = pos;
        this.size = size;
        this.rot = rot;
        this.alpha = alpha;
        this.vel = vel;
        this.svel = svel;
        this.rotvel = rotvel;
        this.alpha_vel = alpha_vel;
    }

    step() {
        if (this.counter > 0) {
            this.counter -= 1;
        }

        this.pos = this.pos.add(this.vel);
        this.size = this.size.add(this.svel);
        this.rot += this.rotvel;
        this.alpha += this.alpha_vel;

        this.size = this.size.max(Vec2.ZERO);
        this.alpha = Math.min(1.0, Math.max(0.0, this.alpha));
    }
}


function calculate_bezier_point(t, point_1, point_2, point_3) {
    let one_minus_t = 1.0 - t;
    return point_1.mul(one_minus_t * one_minus_t).add(point_2.mul(2.0 * one_minus_t * t)).add(point_3.mul(t * t));
}


class SplineEffect {
    constructor(type, counter, point_1, point_2, point_3, size, rot, alpha, tvel, svel, rotvel, alpha_vel, tacc, sacc, rotacc, alpha_acc) {
        this.type = type;
        this.counter = counter;
        this.point_1 = point_1;
        this.point_2 = point_2;
        this.point_3 = point_3;
        this.t = 0.0;
        this.pos = point_1;
        this.size = size;
        this.rot = rot;
        this.alpha = alpha;
        this.tvel = tvel;
        this.svel = svel;
        this.rotvel = rotvel;
        this.alpha_vel = alpha_vel;
        this.tacc = tacc;
        this.sacc = sacc;
        this.rotacc = rotacc;
        this.alpha_acc = alpha_acc;
    }

    step() {
        if (this.counter > 0) {
            this.counter -= 1;
        }

        this.tvel += this.tacc;
        this.svel = this.svel.add(this.sacc);
        this.rotvel += this.rotacc;
        this.alpha_vel += this.alpha_acc;

        this.t += this.tvel;
        this.size = this.size.add(this.svel);
        this.rot += this.rotvel;
        this.alpha += this.alpha_vel;

        this.size = this.size.max(Vec2.ZERO);
        this.alpha = Math.min(1.0, Math.max(0.0, this.alpha));

        this.t = Math.min(1.0, Math.max(0.0, this.t));
        let new_pos = calculate_bezier_point(this.t, this.point_1, this.point_2, this.point_3);
        this.pos = new_pos;
    }
}

class UltraDynamicEffect {
    constructor(type, counter, pos, size, rot, alpha, vel, svel, rotvel, alpha_vel, acc, sacc, rotacc, alpha_acc) {
        this.type = type;
        this.counter = counter;
        this.pos = pos;
        this.size = size;
        this.rot = rot;
        this.alpha = alpha;
        this.vel = vel;
        this.svel = svel;
        this.rotvel = rotvel;
        this.alpha_vel = alpha_vel;
        this.acc = acc;
        this.sacc = sacc;
        this.rotacc = rotacc;
        this.alpha_acc = alpha_acc;
    }

    step() {
        if (this.counter > 0) {
            this.counter -= 1;
        }

        this.vel = this.vel.add(this.acc);
        this.svel = this.svel.add(this.sacc);
        this.rotvel += this.rotacc;
        this.alpha_vel += this.alpha_acc;

        this.pos = this.pos.add(this.vel);
        this.size = this.size.add(this.svel);
        this.rot += this.rotvel;
        this.alpha += this.alpha_vel;

        this.size = this.size.max(Vec2.ZERO);
        this.alpha = Math.min(1.0, Math.max(0.0, this.alpha));
    }
}




export { EffectType };
export { StaticEffect, DynamicEffect, SplineEffect, UltraDynamicEffect };
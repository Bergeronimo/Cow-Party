class Vec2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }

    static get ZERO() {
        return new Vec2(0, 0);
    }

    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    norm() {
        const mag = this.mag();
        if (mag > 0) {
            return new Vec2(this.x / mag, this.y / mag);
        }
        return this;
    }

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    mul(other) {
        return new Vec2(this.x * other, this.y * other);
    }

    div(other) {
        return new Vec2(this.x / other, this.y / other);
    }

    dot(vec2) {
        return this.x * vec2.x + this.y * vec2.y;
    }

    cross(vec2) {
        return this.x * vec2.y - this.y * vec2.x;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    max(vec2) {
        return new Vec2(Math.max(this.x, vec2.x), Math.max(this.y, vec2.y));
    }

    clamp(low, high) {
        return new Vec2(
            Math.min(Math.max(this.x, low), high),
            Math.min(Math.max(this.y, low), high)
        );
    }

    static random() {
        return new Vec2(Math.random(), Math.random());
    }

}

// // Example usage
// const vec1 = new Vec2(1, 2);
// const vec2 = new Vec2(3, 4);

// const sum = vec1.add(vec2);
// console.log(`Sum: ${sum}`);

// const magnitude = vec1.mag();
// console.log(`Magnitude: ${magnitude}`);

// const randomVec = Vec2.random();
// console.log(`Random Vec: ${randomVec}`);

export { Vec2 };
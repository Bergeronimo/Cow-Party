
const new_enum = function (...keys) {
    return Object.freeze(keys.reduce((acc, key, index) => {
        acc[key] = index;
        return acc;
    }, {}));
}

export { new_enum };
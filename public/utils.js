
const new_enum = function (...keys) {
    return Object.freeze(keys.reduce((acc, key, index) => {
        acc[key] = index;
        return acc;
    }, {}));
}

function stringToHash(s) {
    if (s === undefined) return 0;
    if (s === null) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to a 32-bit integer
    }
    return Math.abs(hash);
}

const pickAnIndexFromHashKey = (() => {
    const cache = {};
    return (hashKey, choices) => {
        if (cache.hasOwnProperty(hashKey)) {
            return cache[hashKey];
        } else {
            const hash = stringToHash(hashKey);
            const index = hash % choices.length;
            cache[hashKey] = index;
            return index;
        }
    }
})();

const pickOneFromHashKey = (() => {
    const cache = {};
    return (hashKey, choices) => {
        if (cache.hasOwnProperty(hashKey)) {
            return cache[hashKey];
        } else {
            const hash = stringToHash(hashKey);
            const index = hash % choices.length;
            cache[hashKey] = choices[index];
            return choices[index];
        }
    }
})();

export { new_enum, stringToHash, pickOneFromHashKey, pickAnIndexFromHashKey };


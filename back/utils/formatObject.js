
const pako = require('pako');

const parseCompressed = (data) => {
    const uint8Array = new Uint8Array(atob(data).split('').map(char => char.charCodeAt(0)));
    const inflatedData = pako.inflateRaw(uint8Array, { to: 'string' });
    return JSON.parse(inflatedData);
};

const deepObjectMerge = (original = {}, modifier) => {
    if (!modifier) return original;
    const copy = { ...original };
    for (const [key, value] of Object.entries(modifier)) {
        const valueIsObject = typeof value === "object" && !Array.isArray(value) && value !== null;
        if (valueIsObject && !!Object.keys(value).length) {
            copy[key] = deepObjectMerge(copy[key], value);
        } else {
            copy[key] = value;
        }
    }
    return copy;
};

module.exports = { parseCompressed, deepObjectMerge};
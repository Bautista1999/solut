// src/lib/cache.js
const cache = new Map();

// @ts-ignore
export function getFromCache(key) {
    return cache.get(key);
}

// @ts-ignore
export function setInCache(key, value) {
    cache.set(key, value);
}

// @ts-ignore
export function hasInCache(key) {
    return cache.has(key);
}

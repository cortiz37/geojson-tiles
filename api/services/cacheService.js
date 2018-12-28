'use strict';

const constants = require("../util/constants");

const LRU = require("lru-cache");
const cache = new LRU({
    max: constants.CACHE_MAX_SIZE,
    length: function (n, key) {
        try {
            return Object.keys(n.tiles).length / constants.CACHE_MEMORY_FACTOR;
        } catch (e) {
            return constants.CACHE_MEMORY_DEFAULT_RESULT;
        }
    },
    dispose: function (key, n) {
    },
    maxAge: constants.CACHE_MEMORY_EXPIRATION
});

exports.getCacheValue = function (key, storeFunction) {
    const value = cache.get(key);
    if (value) {
        return value;
    }
    let result = storeFunction();
    if (result) {
        cache.set(key, result);
    }
    return result;
};

exports.deleteCacheValue = function (keys) {
    cache.del(keys);
};

exports.deleteAllCache = function () {
    cache.reset();
};

exports.deleteCache = function (startStr = '') {
    if (!startStr) {
        return;
    }
    const keys = cache.keys();
    for (const key of keys) {
        if (key.indexOf(startStr) === 0) {
            this.del(key);
        }
    }
};
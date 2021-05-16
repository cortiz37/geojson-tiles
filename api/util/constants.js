'use strict';
require('dotenv').config();

module.exports = Object.freeze({
    JSON_VT_MAX_ZOOM: 24,
    JSON_VT_TOLERANCE: 30,
    JSON_VT_INDEX_MAX_ZOOM: 24,
    JSON_VT_INDEX_MAX_POINTS: 10000,

    FILE_EXTENSION: '.json',
    FILE_DIRECTORY: '../../data',
    FILE_ENCODING: 'utf8',

    PARAM_LAYERS: 'layers',

    TILES_TYPE_TO_FEATURE: 'Topology',
    TILES_PROPERTY_FEATURES: 'features',

    CACHE_BROWSER_MAX: 86400,
    CACHE_TILES_LAYERS: '_layers',
    CACHE_MEMORY_FACTOR: parseInt(process.env.CACHE_MEMORY_FACTOR || 200),
    CACHE_MEMORY_DEFAULT_RESULT: 0.1,
    CACHE_MEMORY_EXPIRATION: 259200,
    CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || 2),

    RENDER_FACTOR: 16.0,
    RENDER_REGEX_COLOR: ".c:([#a-zA-Z0-9]+).",
    RENDER_REGEX_WIDTH: ".w:([0-9.]+).",
    RENDER_REGEX_FONT: ".f:[a-zA-Z]+.",
    RENDER_REGEX_SIZE: ".s:([0-9.]+).",
    RENDER_DEFAULT_COLOR: "#000000",
    RENDER_DEFAULT_WIDTH: 1,
    RENDER_DEFAULT_FONT: "Arial",
    RENDER_DEFAULT_SIZE: 0.2,
    RENDER_TILES_GUIDES: process.env.RENDER_TILES_GUIDES ? process.env.RENDER_TILES_GUIDES === 'true' : false,
    RENDER_TILES_SIZE: 256,
    RENDER_MAX_TILES_SIZE: 32767,
    RENDER_TILES_CONTENT_TYPE: 'image/png',
    RENDER_TILES_TEXTS: process.env.RENDER_TILES_TEXTS ? process.env.RENDER_TILES_TEXTS === 'true' : true
});

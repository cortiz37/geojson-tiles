'use strict';

const constants = require("../util/constants");
const geojsonvt = require('../util/geojson-vt');
const cacheService = require('./cacheService');

const fs = require('fs');
const path = require('path');

exports.getTilesSpace = function (workspace, tilesId) {
    return getTilesSpaceFromFile(workspace, tilesId);
};

exports.getTilesLayerInfo = function (workspace, tilesId) {
    const id = getTilesId(workspace, tilesId);
    const _this = this;
    return cacheService.getCacheValue(id + constants.CACHE_TILES_LAYERS, function (err, value) {
        let currentTilesIndex = _this.getTilesSpace(workspace, tilesId);
        if (currentTilesIndex) {
            return {
                layers: Array.from(new Set(
                    Object.keys(currentTilesIndex.tiles)
                        .map(k => currentTilesIndex.tiles[k].features)
                        .map(f => f.map(g => g.tags.Layer))
                        .reduce((a, b) => a.concat(b), [])
                )),
                tileSize: currentTilesIndex.options.tileSize
            };
        }
    });
};

exports.clearTilesSpace = function (workspace, tilesId) {
    const id = getTilesId(workspace, tilesId);
    cacheService.deleteCacheValue(id);
};

exports.getTilesData = function (workspace, tilesId, z, x, y) {
    let currentTilesIndex = this.getTilesSpace(workspace, tilesId);
    if (currentTilesIndex) {
        return {
            data: currentTilesIndex.getTile(z, x, y),
            tileSize: currentTilesIndex.options.tileSize
        }
    }
    return false;
};

exports.allowsFeaturesByLayers = function (layers, tiles) {
    if (tiles && tiles.features) {
        let targetTiles = Object.assign({}, tiles);
        let features = tiles.features.filter(f => layers.indexOf(f.tags.Layer) >= 0);
        targetTiles[constants.TILES_PROPERTY_FEATURES] = features;
        return targetTiles;
    }
    return tiles;
};

exports.getLayersInWorkspace = function (workspace, res) {
    const workspacePath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/';
    if (fs.existsSync(workspacePath)) {
        res.json(fs.readdirSync(workspacePath)
            .filter(f => f.indexOf('.') != 0).map(f => f.substring(0, f.lastIndexOf('.') != -1 ? f.lastIndexOf('.') : f.length))
        );
        return true;
    }
    return false;
};

function getTilesSpaceFromFile(workspace, tilesId) {
    const id = getTilesId(workspace, tilesId);

    return cacheService.getCacheValue(id, function (err, value) {
        const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId + constants.FILE_EXTENSION;
        if (!fs.existsSync(tilesPath)) {
            return false;
        }
        let data = JSON.parse(fs.readFileSync(tilesPath, constants.FILE_ENCODING));
        if (data.type === constants.TILES_TYPE_TO_FEATURE) {
            const firstKey = Object.keys(data.objects)[0];
            data = topojson.feature(data, data.objects[firstKey]);
        }

        const tileSize = projectedTileSize(data);

        return geojsonvt(data, {
            maxZoom: constants.JSON_VT_MAX_ZOOM,
            tolerance: constants.JSON_VT_TOLERANCE,
            indexMaxZoom: constants.JSON_VT_INDEX_MAX_ZOOM,
            indexMaxPoints: constants.JSON_VT_INDEX_MAX_POINTS,
            simple: true,
            tileSize: tileSize
        });
    });
}

function getTilesId(workspace, tilesId) {
    return workspace + '_' + tilesId;
}

function projectionFactor(data) {
    const box = bbox(data);
    const maxSize = Math.max(box[2] - box[0], box[3] - box[1]);
    const factor = Math.max(1, maxSize / 90.0);
    return factor;
}

function bbox(data) {
    let minx = Infinity;
    let miny = Infinity;
    let maxx = -Infinity;
    let maxy = -Infinity;

    data.features.map(f => {
        const coordinates = f.geometry.coordinates;
        if (f.geometry.type === 'Point') {
            minx = Math.min(minx, coordinates[0]);
            maxx = Math.max(maxx, coordinates[0]);
            miny = Math.min(miny, coordinates[1]);
            maxy = Math.max(maxy, coordinates[1]);
        } else if (f.geometry.type === 'LineString') {
            coordinates.map(c => {
                minx = Math.min(minx, c[0]);
                maxx = Math.max(maxx, c[0]);
                miny = Math.min(miny, c[1]);
                maxy = Math.max(maxy, c[1]);
            })
        } else {
            coordinates.map(c => {
                c.map(cc => {
                    minx = Math.min(minx, cc[0]);
                    maxx = Math.max(maxx, cc[0]);
                    miny = Math.min(miny, cc[1]);
                    maxy = Math.max(maxy, cc[1]);
                })
            })
        }
    });

    return Array(minx, miny, maxx, maxy);
}

function decimalFactor(constant, minValue) {
    let value = Math.ceil(minValue * 100) / 100;
    return Number.isInteger(constant * value) ? value : decimalFactor(constant, value + 0.01);
}

function projectedTileSize(data) {
    const factor = decimalFactor(constants.RENDER_TILES_SIZE, projectionFactor(data));
    return constants.RENDER_TILES_SIZE * factor;
}
'use strict';

const constants = require("../util/constants");
const tilesService = require('../services/tilesService');
const renderService = require('../services/renderService');

exports.getLayersTiles = function (req, res) {
    const workspace = req.params.workspace;
    const tilesId = req.params.tilesId;
    const layersTiles = tilesService.getTilesLayerInfo(workspace, tilesId);
    if (layersTiles) {
        res.json(layersTiles);
    } else {
        res.status(404).send({error: 'Tiles not found'});
    }
};

exports.getLayerSources = function (req, res) {
    if (!tilesService.getLayersInWorkspace(req.params.workspace, res)) {
        res.status(404).send({error: 'Workspace not found'});
    }
};

exports.getTiles = function (req, res) {
    const tiles = getTilesData(req, res);
    if (tiles) {
        res.json(tiles.data);
    } else {
        res.status(204).send();
    }
};

exports.getRenderedTiles = function (req, res) {
    const tiles = getTilesData(req, res);
    res.contentType('image/png');
    res.end(renderService.getRenderedTiles(tiles, req), 'binary');
};

function getTilesData(req, res) {
    const workspace = req.params.workspace;
    const tilesId = req.params.tilesId;
    const z = parseInt(req.params.z);
    const x = parseInt(req.params.x);
    const y = parseInt(req.params.y);

    let tiles = tilesService.getTilesData(workspace, tilesId, z, x, y);
    if (tiles) {
        if (req.query[constants.PARAM_LAYERS]) {
            const layers = req.query[constants.PARAM_LAYERS];
            let layerNames = [];
            if (layers instanceof Array) {
                layerNames.push(...layers);
            } else {
                layerNames.push(layers);
            }
            tiles.data = tilesService.allowsFeaturesByLayers(layerNames, tiles.data);
        }
        return tiles;
    }
}
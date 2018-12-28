'use strict';

const tiles = require('../controllers/tiles');
const files = require('../controllers/files');
require('dotenv').config();

module.exports = function (app) {
    app.route('/tiles/:workspace/:tilesId/:z/:x/:y')
        .get(tiles.getTiles);

    app.route('/tiles/:workspace/:tilesId/:z/:x/:y/render')
        .get(tiles.getRenderedTiles);

    app.route('/layers/:workspace/:tilesId')
        .get(tiles.getLayersTiles);

    app.route('/layers/:workspace')
        .get(tiles.getLayerSources);

    app.route('/files')
        .get(files.workspaces);

    app.route('/files/:workspace')
        .post(files.saveFileIntoWorkspace);

    app.route('/files/:workspace/:fileName')
        .delete(files.removeFileFromWorkspace);

    /*---------------------------------------------*/
    /*----------- DEMO ----------------------------*/
    /*---------------------------------------------*/
    app.get('/geojson-tiles-browser', function (req, res) {
        res.render('simple-tiles-browser', {title: 'Geojson as tiles', tiles: 'demo/layer1'})
    });

    app.get('/single-layer-render-browser', function (req, res) {
        res.render('simple-tiles-browser', {title: 'Single layer - Render in browser', tiles: 'demo/layer1'})
    });

    app.get('/virtual-layers-client-render-browser', function (req, res) {
        res.render('tiles-layers-browser', {title: 'Virtual layers - client - Render in browser', tiles: 'demo/layer1'})
    });

    app.get('/virtual-layers-server-render-browser', function (req, res) {
        res.render('tiles-layers-browser', {title: 'Virtual layers - server - Render in browser', tiles: 'demo/layer1', requestLayers: true})
    });

    app.get('/virtual-layers-server-render-server', function (req, res) {
        res.render('tiles-layers-server', {title: 'Virtual layers - server - Render in server', tiles: 'demo/layer1', requestLayers: true})
    });

    app.get('/custom-browser', function (req, res) {
        res.render('custom-browser', {title: 'Interactive - Render in browser'})
    });

    app.get('/custom-server', function (req, res) {
        res.render('custom-server', {title: 'Interactive - Render in server', requestLayers: true})
    });
};
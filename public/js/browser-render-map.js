let map = null;
let virtualLayerNames = [];
let tileSize = 256;
let controlLayers = {};
let layersParam = '';

function buildMap() {
    if(map) {
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        map.off();
        map.remove();
        virtualLayerNames = [];
        controlLayers = {};
    }
    map = new L.map("map", {
        center: [30, 60],
        zoom: 3,
        renderer: L.canvas(),
        preferCanvas: true,
        crs: L.CRS.Simple
    });
}

function addMarker() {
    let originMarker = L.circle([0, 0], {
        color: 'red',
        radius: 2
    }).addTo(map);
    originMarker.bindTooltip('Map center (0.0,0.0)');
}

function generateCanvas(opts) {
    return new CanvasLayer(opts);
}

const CanvasLayer = L.GridLayer.extend({
    createTile: function (coords) {
        const tile = L.DomUtil.create('canvas', 'leaflet-tile');
        tile.tileSize = tileSize;
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;

        corslite('tiles/' + tiles + '/' + coords.z + '/' + coords.x + '/' + coords.y, function (err, resp) {
            if (resp) {
                const tileData = JSON.parse(resp.response);
                if (!tileData) {
                    return;
                }
                renderTile(tile, tileData);
            }
        });

        return tile;
    }
});

function generateLayers() {
    generateTilesLayers(tiles);
}

function generateTilesLayers(tiles) {
    buildMap();
    addMarker();
    corslite('layers/' + tiles, function (err, resp) {
        if (resp) {
            const layerData = JSON.parse(resp.response);
            tileSize = layerData.tileSize;
            virtualLayerNames = layerData.layers;
            virtualLayerNames.map(layer => {
                let addedLayer = L.geoJSON().addTo(map);
                addedLayer.on('add', (e) => {
                    virtualLayerNames.push(layer);
                    update();
                });
                addedLayer.on('remove', (e) => {
                    virtualLayerNames.splice(virtualLayerNames.indexOf(layer), 1);
                    update();
                });
                controlLayers[layer] = addedLayer;
            });

            layersParam = requestLayers ? ('?layers=' + virtualLayerNames.join('&layers=')) : '';

            const CanvasLayer = L.GridLayer.extend({
                options: {tileSize: tileSize},
                createTile: function (coords) {
                    const tile = L.DomUtil.create('canvas', 'leaflet-tile');
                    const size = this.getTileSize();
                    tile.width = size.x;
                    tile.height = size.y;

                    corslite('tiles/' + tiles + '/' + coords.z + '/' + coords.x + '/' + coords.y + layersParam, function (err, resp) {
                        if (resp) {
                            processTile(tile, resp.response, virtualLayerNames, tileSize / 256);
                        }
                    });

                    return tile;
                }
            });

            const canvas = function (opts) {
                return new CanvasLayer(opts);
            };

            let canvasLayer = canvas();
            map.addLayer(canvasLayer);

            L.control.layers({}, controlLayers).addTo(map);

            const update = function () {
                canvasLayer.redraw();
            }
        }
    });
}
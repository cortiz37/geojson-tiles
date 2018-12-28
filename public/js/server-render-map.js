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

            layersParam = requestLayers ? ('?layers=' + virtualLayerNames.join('&layers=')) : '?layers=';

            const tilesLayer = L.tileLayer('tiles/' + tiles + '/{z}/{x}/{y}/render' + layersParam, {
                    noWrap: true,
                    tileSize: tileSize
                }).addTo(map);

            L.control.layers({}, controlLayers).addTo(map);

            const update = function () {
                layersParam = requestLayers ? ('?layers=' + virtualLayerNames.join('&layers=')) : '?layers=';
                tilesLayer.setUrl('tiles/' + tiles + '/{z}/{x}/{y}/render' + layersParam);
            }
        }
    });
}
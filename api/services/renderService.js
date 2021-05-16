'use strict';

const {createCanvas} = require("canvas");
const constants = require("../util/constants");

let stylesContainer = new Map();

exports.getRenderedTiles = function (json, req) {
    let canvas = createCanvas(json.tileSize, json.tileSize);
    renderTile(canvas, json.data, req, json.tileSize / constants.RENDER_TILES_SIZE);
    return canvas.toBuffer(constants.RENDER_TILES_CONTENT_TYPE);
};

function renderTile(canvas, tile, req, factor) {
    const ctx = canvas.getContext('2d');
    let features;

    if(tile) {
        features = tile.features;
    }

    if(constants.RENDER_TILES_GUIDES) {
        renderGuidesLines(canvas, ctx, tile, req);
    }

    if(tile) {
        for (let i = 0; i < features.length; i++) {
            const feature = features[i];

            setStyles(ctx, feature, tile.z);
            ctx.beginPath();
            for (let j = 0; j < feature.geometry.length; j++) {
                renderFeature(ctx, feature, j, constants.RENDER_TILES_TEXTS, factor);
            }
            if (feature.type === 3) {
                ctx.fill('evenodd');
            }
            ctx.stroke();
        }
    }
}

function renderFeature(ctx, feature, geometryIndex, showTexts, factor) {
    if (showTexts && feature.tags.Text) {
        ctx.fillText(feature.tags.Text, projectValue(feature.geometry[0][0], factor), projectValue(feature.geometry[0][1], factor));
    }
    const polygon = feature.geometry[geometryIndex];
    for (let i = 0; i < polygon.length; i++) {
        if (i) {
            ctx.lineTo(projectValue(polygon[i][0], factor), projectValue(polygon[i][1], factor));
        }
        else {
            ctx.moveTo(projectValue(polygon[i][0], factor), projectValue(polygon[i][1], factor));
        }
    }
}

function projectValue(value, factor) {
    return value * factor / constants.RENDER_FACTOR;
}

function setStyles(ctx, feature, zoom) {
    const styles = getGenericStyles(feature.tags);
    ctx.strokeStyle = styles.color;
    ctx.fillStyle = styles.color;
    //ctx.lineWidth = styles.width * 2;

    var z = 1 << zoom;
    ctx.font = styles.size * z + 'px ' + styles.font;
}

function getGenericStyles(tags) {
    const stylesString = tags.style;
    if (!stylesContainer.has(stylesString)) {
        const foundColor = stylesString.match(constants.RENDER_REGEX_COLOR);
        const foundWidth = stylesString.match(constants.RENDER_REGEX_WIDTH);
        const foundFont = stylesString.match(constants.RENDER_REGEX_FONT);
        const foundSize = stylesString.match(constants.RENDER_REGEX_SIZE);
        const color = (foundColor ? foundColor[1] : constants.RENDER_DEFAULT_COLOR);
        const width = (foundWidth ? foundWidth[1] : constants.RENDER_DEFAULT_WIDTH);
        const font = (foundFont ? foundFont[1] : constants.RENDER_DEFAULT_FONT);
        const size = (foundSize ? foundSize[1] :  constants.RENDER_DEFAULT_SIZE);
        const style = {
            width: width,
            color: color,
            font: font,
            size: size
        };
        stylesContainer.set(stylesString, style);
    }
    return stylesContainer.get(stylesString);
}

function renderGuidesLines(canvas, ctx, tile, req) {
    const z = parseInt(req.params.z);
    const x = parseInt(req.params.x);
    const y = parseInt(req.params.y);

    ctx.strokeStyle = '#aaaaaa';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
    ctx.font = '14px Arial #eee';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`${z}/${x}/${y}`, 10, 20);
}

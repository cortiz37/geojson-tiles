const regexColor = ".c:([#a-zA-Z0-9]+).";
const regexWidth = ".w:([0-9.]+).";
const regexFont = ".f:[a-zA-Z]+.";
const regexSize = ".s:([0-9.]+).";

const defaultColor = "#000000";
const defaultWidth = 1;
const defaultFont = "Arial";
const defaultSize = 0.2;

const renderGuides = true;

const renderFactor = 16.0;

let stylesContainer = new Map();

function getGenericStyles(tags) {
    const stylesString = tags.style;
    if (!stylesContainer.has(stylesString)) {
        const foundColor = stylesString.match(regexColor);
        const foundWidth = stylesString.match(regexWidth);
        const foundFont = stylesString.match(regexFont);
        const foundSize = stylesString.match(regexSize);
        const color = (foundColor ? foundColor[1] : defaultColor);
        const width = (foundWidth ? foundWidth[1] : defaultWidth);
        const font = (foundFont ? foundFont[1] : defaultFont);
        const size = (foundSize ? foundSize[1] : defaultSize);
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

function isInLayers(tags, layers) {
    if (tags.Layer) {
        return layers.indexOf(tags.Layer) >= 0;
    }
}

function projectValue(value, factor) {
    return value * factor / renderFactor;
}

function processTile(canvas, data, layers, factor) {
    const tileData = JSON.parse(data);
    if (!tileData) {
        return;
    }
    renderTile(canvas, tileData, layers, factor);
}

function renderTile(canvas, tile, layers, factor = 1) {
    const ctx = canvas.getContext('2d');
    const features = tile.features;

    if(renderGuides) {
        renderGuidesLines(canvas, ctx, tile);
    }

    for (let i = 0; i < features.length; i++) {
        const feature = features[i];

        if (layers && !isInLayers(feature.tags, layers)) {
            continue;
        }

        setStyles(ctx, feature, tile.z);
        ctx.beginPath();
        for (let j = 0; j < feature.geometry.length; j++) {
            renderFeature(ctx, feature, j, true, factor);
        }
        if (feature.type === 3) {
            ctx.fill('evenodd');
        }
        ctx.stroke();
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

function setStyles(ctx, feature, zoom) {
    const styles = getGenericStyles(feature.tags);
    ctx.strokeStyle = styles.color;
    ctx.fillStyle = styles.color;
    //ctx.lineWidth = styles.width * 2;

    var z = 1 << zoom;
    ctx.font = styles.size * z + 'px ' + styles.font;
}

function renderGuidesLines(canvas, ctx, tile) {
    ctx.strokeStyle = '#aaaaaa';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
    ctx.font = '14px Arial #eee';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`${tile.z}/${tile.x}/${tile.y}`, 10, 20);
}
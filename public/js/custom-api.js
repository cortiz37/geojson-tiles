const loadWorkspaces = 'files';
const loadTiles = 'layers/{workspace}';

function renderTiles() {
    let workspaces = document.getElementById('workspaces');
    let select = document.getElementById('tiles');

    if(select.value !== '') {
        generateTilesLayers(workspaces.value + '/' + select.value);
    } else {
        buildMap();
    }
}

function workspaces() {
    initSelect('workspaces');
    initSelect('tiles');

    let select = document.getElementById('workspaces');

    corslite(loadWorkspaces, function (err, resp) {
        loadSelect(resp, select);
    });
}

function updateTiles() {
    let workspaces = document.getElementById('workspaces');
    let select = document.getElementById('tiles');
    clearSelect('tiles');

    if (workspaces.value !== '') {
        corslite(loadTiles.replace('{workspace}', workspaces.value), function (err, resp) {
            loadSelect(resp, select);
        });
    }
}

function loadSelect(resp, select) {
    if (resp) {
        const value = JSON.parse(resp.response);
        value.map(n => {
            let option = document.createElement("option");
            option.text = n;
            option.value = n;
            select.add(option);
        });
    }
}

function initSelect(id) {
    let select = document.getElementById(id);
    let option = document.createElement("option");
    option.text = '- Select -';
    option.value = '';
    select.add(option);
}

function clearSelect(id) {
    let select = document.getElementById(id);
    for (let i = select.options.length - 1; i >= 0; i--) {
        select.options.remove(i);
    }
    initSelect(id);
}
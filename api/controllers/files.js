'use strict';

const constants = require("../util/constants");
const tilesService = require('../services/tilesService');
const fs = require('fs');
const path = require('path');
const fx = require('mkdir-recursive');
const rimraf = require('rimraf');


exports.workspaces = function (req, res) {
    const workspacePath = path.join(__dirname, constants.FILE_DIRECTORY) + '/';

    let directories = fs.readdirSync(workspacePath)
        .map(f => workspacePath + f)
        .filter(f => fs.lstatSync(f).isDirectory());

    return res.json(directories.map(f => f.substring(workspacePath.length)));
};

exports.saveFileIntoWorkspace = function (req, res) {
    const workspace = req.params.workspace;
    const workspacePath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/';

    let file = req.files.file;
    if (!file.name.endsWith(constants.FILE_EXTENSION)) {
        return res.status(404).send({error: 'Invalid file format'});
    }

    if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath);
    }
    file.mv(workspacePath + file.name, function (err) {
        if (err) {
            return res.status(500).send(err);
        } else {
            tilesService.clearTilesSpace(workspace, path.parse(file.name).name);
            res.status(201).send({message: 'File uploaded!'});
        }
    });
};

exports.removeFileFromWorkspace = function (req, res) {
    const workspace = req.params.workspace;
    const fileName = req.params.fileName;
    const workspacePath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/';
    const filePath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + fileName + constants.FILE_EXTENSION;

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            exports.removeTileFileCache(workspace,fileName);
            return res.sendStatus(204);
        });
    } else {
        return res.status(404).send({error: 'File not found'});
    }
};


exports.getTileFromFileCache = function (workspace, tilesId, z, x, y, name) {
    const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId + ('/' + z + '/' + x + '/' + y + '/' + name).replace(/-/g, "_");
    if (!fs.existsSync(tilesPath)) {
        return false;
    }
    return fs.readFileSync(tilesPath);
};
exports.saveTileFileCache = function (workspace, tilesId, z, x, y, name, renderedTile) {
    const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId + ('/' + z + '/' + x + '/' + y + '/').replace(/-/g, "_");
    if (!fs.existsSync(tilesPath)) {
        fx.mkdirSync(tilesPath);
    }
    fs.writeFile(tilesPath + name, renderedTile, function (err) {
        if (err) {
            return console.log(err);
        }
    });
};
exports.removeTileFileCache = function (workspace, tilesId) {
    const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId;
    if (fs.existsSync(tilesPath)) {
        rimraf(tilesPath, function () {
        });
    }

};

exports.getTileLayersInfoFromFileCache = function (workspace, tilesId) {
    const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId + '/layerInfo/info.json';
    if (!fs.existsSync(tilesPath)) {
        return false;
    }
    return JSON.parse(fs.readFileSync(tilesPath));
};
exports.saveTileLayersInfoFileCache = function (workspace, tilesId, data) {
    const tilesPath = path.join(__dirname, constants.FILE_DIRECTORY) + '/' + workspace + '/' + tilesId + '/layerInfo/';
    if (!fs.existsSync(tilesPath)) {
        fx.mkdirSync(tilesPath);
    }
    fs.writeFile(tilesPath + "info.json", JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
    });
};
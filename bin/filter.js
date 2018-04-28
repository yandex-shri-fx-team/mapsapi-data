#! /usr/bin/env node
const parseArgs = require('minimist');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const inside = require('../utils/inside');

const argv = parseArgs(process.argv.slice(2));
const inputFilePathString = argv._[0];
const inputFilePath = path.parse(inputFilePathString);
const outputFilePathString = argv._[1] ||
    path.format(_.merge({}, inputFilePath, {base: null, ext: '.geojson'}));
const limit = argv.limit;
const insideFilePathString = argv.inside;

Promise.resolve()
    .then(() => {
        return Promise.all([
            new Promise((resolve, reject) =>
                fs.readFile(inputFilePathString, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(JSON.parse(data.toString()));
                    }
                })
            ),
            insideFilePathString ? new Promise((resolve, reject) =>
                fs.readFile(insideFilePathString, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(JSON.parse(data.toString()));
                    }
                })
            ) : null
        ]);
    })
    .then((data) => {
        const pointFeatures = data[0].features;
        const polygonFeature = data[1] ? data[1].features[0] : null;
        const filteredPointFeatures = [];

        for (let i = 0; i < pointFeatures.length; i++) {
            const pointFeature = pointFeatures[i];
            let result = true;

            if (limit && filteredPointFeatures.length > limit) {
                return _.assign({}, pointFeatures, {features: filteredPointFeatures});
            }

            if (polygonFeature) {
                result = inside(pointFeature.geometry, polygonFeature.geometry);
            }

            if (result) {
                filteredPointFeatures.push(pointFeature);
            }
        }

        return _.assign({}, pointFeatures, {features: filteredPointFeatures});
    })
    .then((result) => {
        const filePath = outputFilePathString;
        const fileData = JSON.stringify(result, null, '\t');
        fs.writeFile(filePath, fileData, {flag: 'w'}, (error) => {
            if (error) throw error;
        });
    })
    .catch((error) => {
        if (error) throw error;
    });

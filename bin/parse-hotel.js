#! /usr/bin/env node
const csv = require('csvtojson');
const parseArgs = require('minimist');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const argv = parseArgs(process.argv.slice(2));
const inputFilePathString = argv._[0];
const inputFilePath = path.parse(inputFilePathString);
const outputFilePathString = argv._[1] ||
    path.format(_.merge({}, inputFilePath, {base: null, ext: '.geojson'}));
const defaultOptions = {
    delimiter: [';'],
    headers: [
        'geometry.coordinates.1',
        'geometry.coordinates.0',
        'properties.openingYear',
        'properties.regionIdHash',
        'properties.idHash'
    ],
    colParser: {
        'geometry.coordinates.0': 'number',
        'geometry.coordinates.1': 'number',
        'properties.openingYear': 'number'
    }
};
const options = argv.options ?
    _.merge(defaultOptions, JSON.parse(argv.options)) :
    defaultOptions;
const limit = argv.limit;
const result = {
    type: 'FeatureCollection',
    features: []
};

Promise.resolve()
    .then(() => {
        if (inputFilePath.ext === '.csv') {
            return new Promise((resolve, reject) => {
                csv(options)
                    .fromFile(inputFilePathString)
                    .on('json', (data) => {
                        if (
                            (!limit || result.features.length < limit) &&
                            data.geometry.coordinates[0] !== '' &&
                            data.geometry.coordinates[1] !== ''
                        ) {
                            const defaultData = {
                                type: 'Feature',
                                geometry: {type: 'Point'},
                                properties: {}
                            };
                            const resultData = _.merge({}, defaultData, data);
                            if (data.properties.openingYear === '') {
                                delete resultData.properties.openingYear;
                            }
                            result.features.push(resultData);
                        }
                    })
                    .on('done', (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
            });
        }
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

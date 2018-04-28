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
    path.format(_.merge({}, inputFilePath, {base: null, ext: '.json'}));
const defaultOptions = {};
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
                        if (!limit || result.features.length < limit) {
                            const defaultData = {
                                type: 'Feature',
                                geometry: {type: 'Point'},
                                properties: {}
                            };
                            const resultData = _.merge({}, defaultData, {properties: data});
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

/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const PATHS = require('./webpack.path');

const loadIsparta = require('./parts/loadIsparta');
const setupCSS = require('./parts/setupCSS');
const loadJSX = require('./parts/loadJSX');
const loadLESS = require('./parts/loadLESS');
const test = merge(
    {
        entry : {
            app : PATHS.app + '/index.jsx',
            style : PATHS.style
        },
        devtool: 'inline-source-map'
    },
    loadIsparta(PATHS.app),
    setupCSS(PATHS.app),
    loadLESS(PATHS.app),
   /* loadJSX(PATHS.test)*/
);

/*const test = {

    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loaders: ['isparta-instrumenter-loader'],
                enforce: 'pre',
                include: PATHS.app
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                include: PATHS.app
            },
            {
                test: /\.(js|jsx)$/,
                loaders: ['babel-loader'],
                include: PATHS.test
            }
        ]
    }
};*/

module.exports = test;

/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const PATHS = require('./webpack.path');
const devServer = require('./parts/devserver');
const setupCSS = require('./parts/setupCSS');
const loadLESS = require('./parts/loadLESS');
const npmInstall = require('./parts/npmInstall');
const LoadFont = require('./parts/loadFONT');
const LoadIMAGE = require('./parts/loadIMAGE');
const copyAssets = require('./parts/copyAssets');

const developement = merge(
    {
        entry : {
            app : PATHS.app + '/index.jsx',
            style : PATHS.style
        },
        devtool : 'eval-source-map'
    },
    setupCSS(PATHS.app),
    loadLESS(PATHS.app),
    LoadFont(),
    LoadIMAGE(),
    devServer({
        host : process.env.HOST,
        port : process.env.PORT
    }),
    npmInstall({
        save : true
    }),
    copyAssets(PATHS.app + '/assets', PATHS.build + '/assets')
);

/*const developement = {
    entry : {
        style : PATHS.style
    },
    devtool : 'eval-source-map',
    devServer : {
        /!* contentBase : PATHS.build,*!/
        historyApiFallback : true,
        hot : true,
        inline : true,
        progress : true,
        stats : 'errors-only',
        host : process.env.HOST,
        port : process.env.PORT
    },
    module : {
        rules : [
            // Define development specific CSS setup
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader'],
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new NpmInstallPlugin({save : true})
    ]
};*/

module.exports = developement;

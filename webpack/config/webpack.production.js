/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const pkg = require('../../package.json');
const PATHS = require('./webpack.path');

const extractCSS = require('./parts/extractCSS');
const extractBundle = require('./parts/extractBundle');
const clean = require('./parts/clean');
const setFreeVariable = require('./parts/setFreeVariable');
const minify = require('./parts/minify');
const copyAssets = require('./parts/copyAssets');
const minifyCSS = require('./parts/minifyCSS');
const compress = require('./parts/compress');

const production = merge(
    {
        entry : {
            app : PATHS.app + '/index.jsx',
            style : PATHS.style
        }
    },
    clean(PATHS.build),
    setFreeVariable(
        'process.env.NODE_ENV',
        'production'
    ),
    extractBundle(),
    minify(),
    extractCSS(PATHS.app),
    copyAssets(PATHS.app + '/assets', PATHS.build + '/assets'),
    minifyCSS({
        options: {
            discardComments: {
                removeAll: true,
            },
            // Run cssnano in safe mode to avoid
            // potentially unsafe transformations.
            safe: true,
            },
        }),
    compress(),    
    );

/*const production = {
    // Define vendor entry point needed for splitting
    entry: {
        vendor: Object.keys(pkg.dependencies).filter(function(v) {
            // Exclude alt-utils as it won't work with this setup
            // due to the way the package has been designed
            // (no package.json main).
            return v !== 'alt-utils';
        }),
        style : PATHS.style
    },
    module : {
        rules : [
            // Extract CSS during build
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
                include: PATHS.app
            }
        ]
    },
    plugins : [
        new CleanPlugin(PATHS.build, {root : PATHS.root}),
        new ExtractTextPlugin('[name].[hash].css'),
        // Extract vendor and manifest files
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
        }),

        // Setting DefinePlugin affects React library size!
        // DefinePlugin replaces content "as is" so we need some extra quotes
        // for the generated code to make sense
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
            // You can set this to JSON.stringify('development') for your
            // development target to force NODE_ENV to development mode
            // no matter what
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress : {
                warnings : false
            },
            mangle : true,
            comments : false
        })
    ]
};*/

module.exports = production;

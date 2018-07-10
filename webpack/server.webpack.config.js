const path = require("path");
const fs = require("fs");
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// -- Webpack configuration --

const config = {};

// Application entry point
config.entry = "./server/app.js";

// We build for node
config.target = "node"

// Node module dependencies should not be bundled
config.externals = fs.readdirSync("node_modules")
    .reduce(function(acc, mod) {
        if (mod === ".bin") {
            return acc
        }

        acc[mod] = "commonjs " + mod
        return acc
    }, {})

// We are outputting a real node app!
config.node = {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
}

// Output files in the build/ folder
config.output = {
    path: path.join(__dirname, "../server/bin"),
    filename: "[name].js",
}

config.resolve = {
    extensions: [

        ".js",
        ".json",
    ],
}

config.module = {}

config.module.loaders = [

    // Use babel and eslint to build and validate JavaScript
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
            "babel-loader"
        ],
    },

    // Allow loading of JSON files
    {
        test: /\.json$/,
        loader: "json-loader",
    },
]

config.plugins =   [
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }),
    new UglifyJSPlugin({
        sourceMap: true
    }),
];

module.exports = config

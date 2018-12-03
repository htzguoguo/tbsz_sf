/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const CompressionPlugin = require("compression-webpack-plugin")
module.exports = function () {
    return {
        plugins: [             
            new CompressionPlugin({
                asset: "[path].gz[query]",
                algorithm: "gzip",
                test: /\.js$|\.css$|\.html$/,
                threshold: 10240,
                minRatio: 1
            })           
        ]
    };
};

/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
module.exports = function () {
    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                minimize: true,
                mangle : true,
                comments : false
            }),
            new webpack.optimize.AggressiveMergingPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),             
        ]
    };
};

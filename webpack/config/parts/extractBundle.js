/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const pkg = require('../../../package.json');
module.exports = function (options) {
    return {
        entry: {
            vendor: Object.keys(pkg.dependencies).filter(function(v) {
                // Exclude alt-utils as it won't work with this setup
                // due to the way the package has been designed
                // (no package.json main).
                return v !== 'alt-utils';
            })
        },
        plugins : [
            // Extract vendor and manifest files
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest']
            })
        ]
    }
};

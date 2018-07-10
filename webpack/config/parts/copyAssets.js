/**
 * Created by Administrator on 2017-12-19.
 */
var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = function (from, to) {
    return {
            plugins : [
                new CopyWebpackPlugin([
                    {
                        context: from,
                        from: '**/*',
                        to: to
                    }
                ])
            ]
        }
};

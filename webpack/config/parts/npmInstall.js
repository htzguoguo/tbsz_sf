/**
 * Created by Administrator on 2017-12-06.
 */
const NpmInstallPlugin = require('npm-install-webpack-plugin');
module.exports = function (options) {
    options = options || {};
    return {
        plugins: [
            new NpmInstallPlugin(options)
        ]
    };
};

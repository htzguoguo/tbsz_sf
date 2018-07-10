/**
 * Created by Administrator on 2017-12-07.
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = function (options) {
    return {
        plugins: [
            new HtmlWebpackPlugin({
                template: './node_modules/html-webpack-template/index.ejs',
                title: options.title,
                appMountId: options.appMountId,
                inject: false
            })
        ]
    }
};

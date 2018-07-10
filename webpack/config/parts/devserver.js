/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');

module.exports = function (options) {
    const ret = {
        devServer: {
            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback : true,

            // Unlike the cli flag, this doesn't set
            // HotModuleReplacementPlugin!
            hot : true,
            inline : true,
            progress : true,

            // Display only errors to reduce the amount of output.
            stats : 'errors-only',

            // Parse host and port from env to allow customization.
            //
            // If you use Vagrant or Cloud9, set
            // host: options.host || '0.0.0.0';
            //
            // 0.0.0.0 is available to all network devices
            // unlike default `localhost`.
            host : options.HOST, // Defaults to `localhost`
            port : options.PORT // Defaults to 8080
        },
        plugins: [
            // Enable multi-pass compilation for enhanced performance
            // in larger projects. Good default.
            new webpack.HotModuleReplacementPlugin()
        ]
    };

    return ret;
};

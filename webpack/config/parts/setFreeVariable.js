/**
 * Created by Administrator on 2017-12-06.
 */
    // Setting DefinePlugin affects React library size!
    // DefinePlugin replaces content "as is" so we need some extra quotes
    // for the generated code to make sense
    // You can set this to JSON.stringify('development') for your
    // development target to force NODE_ENV to development mode
    // no matter what

const webpack = require('webpack');
module.exports = function (key, value) {
    const env = {};
    env[key] = JSON.stringify(value);
    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    };
};
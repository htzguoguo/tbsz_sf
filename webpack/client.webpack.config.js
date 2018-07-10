/**
 * Created by Administrator on 2017-11-16.
 */

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./config/webpack.common');
const development = require('./config/webpack.development.server');
const production = require('./config/webpack.production');
const test = require('./config/webpack.test');


const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;
console.log('TARGET', TARGET);
if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, development);
}
if (TARGET === 'build:client' || TARGET === 'stats') {
    module.exports = merge(common, production);
}
if (TARGET === 'test' || TARGET === 'tdd') {
    let t = merge(common, test);
    t.entry = null;
    module.exports = t;
}

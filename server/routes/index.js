/**
 * Created by Administrator on 2017-12-25.
 */
const path = require( 'path' );
const express = require( 'express' );





module.exports = function (app) {
    /* GET home page. */
    const isDeveloping = process.env.NODE_ENV !== 'production';
    if (isDeveloping) {
        const webpack = require('webpack');
        const webpackMiddleware = require('webpack-dev-middleware');
        const webpackHotMiddleware = require('webpack-hot-middleware');
        const config = require('../../webpack/client.webpack.config.js');
        const compiler = webpack(config);
        const middleware = webpackMiddleware(compiler, {
            publicPath: config.output.publicPath,
            contentBase: 'src',
            stats: {
                colors: true,
                hash: false,
                timings: true,
                chunks: false,
                chunkModules: false,
                modules: false
            }
        });
        app.use(middleware);
        app.use(webpackHotMiddleware(compiler));

        console.log(path.join(__dirname, '../../build/index.html'));
        app.get('/', function response(req, res) {
            res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../../build/index.html')));
            res.end();
        });
    } else {
        const staticPath = path.join( __dirname, '../../build' );
        app.use(express.static(staticPath));
        app.get('/', function response(req, res) {
            res.sendFile(path.join(__dirname, '../../build/index.html'));
        });
    }
};

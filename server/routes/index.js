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

        
        app.get('/', function response(req, res) {
            res.write(middleware.fileSystem.readFileSync(path.join('./', 'build', 'index.html')));
            res.end();
        });
    } else {



        const staticPath = path.join( './' , 'build' );        
        app.get('*.js.gz', function(req, res, next) {
            //req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'text/javascript');
            next();
        });
        app.get('*.css.gz', function(req, res, next) {
            //req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', 'text/css');
            next();
        });

        //app.use( express.static(path.join( './' , 'output', 'word' )));
        
        app.use(express.static(staticPath));
        //app.use(expressStaticGzip(staticPath));

        

        app.get('/', function response(req, res) {
            res.sendFile(path.join('./', 'build', 'index.html'));
        });
    }
};

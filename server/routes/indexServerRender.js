/**
 * Created by Administrator on 2017-12-25.
 */
const path = require( 'path' );
const express = require( 'express' );

const fs = require('fs');
const React = require('react');
const ReactDOMServer = require ('react-dom/server');
const App = require('../../app/containers/Root') ;


function handleRender(req, res) {
    // Renders our Hello component into an HTML string
    const html = ReactDOMServer.renderToString(<App />);  
    // Load contents of index.html
    fs.readFile(path.join('./', 'build', 'index.html'), 'utf8', function (err, data) {
        if (err) throw err;

    // Inserts the rendered React HTML into our main div
    const document = data.replace(/<div id="root"><\/div>/, `<div id="root">${html}</div>`);

    // Sends the response back to the client
    res.send(document);
    });
}

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
        app.use(express.static(staticPath));       

        app.get('/', handleRender);
    }
};

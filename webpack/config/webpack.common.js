/**
 * Created by Administrator on 2017-12-06.
 */
const webpack = require('webpack');
const merge = require('webpack-merge');
/*const HtmlWebpackPlugin = require('html-webpack-plugin');*/
const PATHS = require('./webpack.path');

const indexTemplate = require('./parts/indexTemplate');
const loadJSX = require('./parts/loadJSX');
const lintJSX = require('./parts/lintJSX');
const lintCSS = require('./parts/lintCSS');

const common = merge(
    {

        resolve: {
            extensions: ['.js', '.jsx']
        },
        output : {
            path : PATHS.build,
            filename: "[name].[hash].js",
            chunkFilename : '[hash].js'
        }
    },
    indexTemplate(
        {
            title : '长深高速公路养护系统',
            appMountId : 'root'
        }
    ),
    loadJSX(PATHS.app),

  /*  lintJSX(PATHS.app),
    lintCSS(PATHS.app)*/
);

/*const common =  {
    entry : {
        app : PATHS.app + '/index.jsx',
        style : PATHS.style
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output : {
        path : PATHS.build,
        filename: "[name].[hash].js",
        chunkFilename : '[hash].js'
    },
    module : {
        rules : [
            {
                test: /\.(js|jsx)$/,
                loaders: ['eslint-loader'],
                enforce: 'pre',
                include: PATHS.app
            },
            {
                test: /\.css$/,
                loader: 'postcss-loader',
                enforce: 'pre',
                include: PATHS.app,
                options: {
                    plugins: () => ([
                        require('stylelint')({
                            ignoreFiles: 'node_modules/!**!/!*.css',
                        }),
                    ]),
                }
            },
            {
                test: /\.jsx?$/,
                loader : 'babel-loader',
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'node_modules/html-webpack-template/index.ejs',
            title: 'Kanban app',
            appMountId: 'app',
            inject: false
        })
    ]
};*/

module.exports =  common;

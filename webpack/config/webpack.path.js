/**
 * Created by Administrator on 2017-12-06.
 */
const path = require('path');
const PATHS = {
    root : path.join(__dirname, '../../'),
    app : path.join(__dirname, '../../app'),
    build : path.join(__dirname, '../../build'),
    style : path.join(__dirname, '../../app/styles/index.less'),
    antStyle : path.join(__dirname, '../../node_modules/antd/dist/antd.css'),
    test : path.join(__dirname, '../../tests'),
    node_modules : path.join(__dirname, '../../node_modules')
};

module.exports =  PATHS;

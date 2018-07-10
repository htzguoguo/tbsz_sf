/**
 * Created by Administrator on 2017-12-28.
 */

const Helper = require( '../modules/http_helper' );
const express = require('express'),
       router = express.Router();
const menu = require('../data/menu');

router.get( '/', function ( req, res, next ) {
    "use strict";
    let id = Number(req.params.id);
    Helper.ResourceFound( res, menu );
} );

module.exports = router;

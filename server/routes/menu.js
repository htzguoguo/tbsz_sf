/**
 * Created by Administrator on 2017-12-28.
 */

const Helper = require( '../modules/http_helper' );
const express = require('express'),
router = express.Router();


router.get( '/:menu', function ( req, res, next ) {
    "use strict";
    let m = req.params.menu !== 'undefine' ? req.params.menu : 'operator';
    const menu = require(`../data/${m}`);
    Helper.ResourceFound( res, menu );
} );

module.exports = router;

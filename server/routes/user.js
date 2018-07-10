/**
 * Created by Administrator on 2017-12-28.
 */
const Helper = require( '../modules/http_helper' );
const express = require('express'),
       User = require( '../schema/user' ),
       router = express.Router();

router.get( '/my/:id', function ( req, res, next ) {
    "use strict";
    let id = Number(req.params.id);
    User.findById(id).then(user => {
        if (user) {
            Helper.ResourceFound( res, user );
        }else {
            Helper.ResourceNotFound( res , { ID : id });
        }
    }).catch(
        error => {
            console.log('error', error);
            Helper.InternalServerError( res, error, { ID : id } );
        }
    );
} );

module.exports = router;


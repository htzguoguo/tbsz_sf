/**
 * Created by Administrator on 2017-12-28.
 */

const Helper = require( '../modules/http_helper' );
const express = require('express');
const WorkItem = require( '../schema/workitem' );
const router = express.Router();

router.get( '/', function ( req, res, next ) {
    "use strict";
    WorkItem.pagingQuery(req, res);
    /*let limit = Number(req.query.results);
    let offset = req.query.page ? Number(req.query.page) * limit : limit;
    WorkItem.findAll({ offset: offset, limit: limit }).then(items => {
        if (items) {
            Helper.ResourceFound( res, items );
        }else {
            Helper.ResourceNotFound( res , { ID : all });
        }
    }).catch(
        error => {
            console.log('error', error);
            Helper.InternalServerError( res, error, { ID : all } );
        }
    );*/
} );

module.exports = router;

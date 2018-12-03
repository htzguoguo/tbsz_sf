const express = require('express');
const {        
    queryWaterFees,calculateWaterFee, saveWaterFees        
    } = require( "../schema/waterFee" );
const router = express.Router();

router.get( '/fees/:year/:month/:type', function ( req, res, next ) {
    "use strict";
    let {year, month, type} = req.params;
    queryWaterFees(year, month, type, res);
} );

router.post(
    '/calfee',
    calculateWaterFee
);

router.put(
    '/fees',
    saveWaterFees
);

module.exports = router;
const express = require('express');
const {
        queryWaterFee,
        queryWaterFees,
        calculateWaterFee, 
        saveWaterFee,
        MoveWaterFeePosition,
        statisticsWaterFees,
        waterFeeToExcel,
        deleteWaterFee,
        queryWaterFeesNum,
        prepareWaterFees,
        eraseZeroWaterFees,
        queryFeeParas,
        searchWaterFees,
        searchToExcel,
        CompletePayment,
        queryWaterFeesYearlyByNum,
        sendOverUsageSMS,
        SearchFeesByCompany,
        searchByCompanyToExcel
    } = require( "../schema/waterFee" );
const router = express.Router();

router.get( '/fee/:num/:year/:month', function ( req, res, next ) {
    "use strict";
    let {num, year, month} = req.params;
    queryWaterFee(num, year, month, res);
} );

router.delete( '/fee/:num/:year/:month', deleteWaterFee);

router.delete( '/feezero/:year/:month', eraseZeroWaterFees);

router.get( '/fees/:year/:month/:type', function ( req, res, next ) {
    "use strict";
    let {year, month, type} = req.params;
    queryWaterFees(year, month, type, res);
} );

router.get( '/feesstat/:year/:month/:type',  statisticsWaterFees);


router.get( '/feesnum/:year/:month',  queryWaterFeesNum);

router.get( '/feesyear/:num/:year',  queryWaterFeesYearlyByNum);

router.get( '/feeparas',  queryFeeParas);



router.get( '/feestoexcel/:year/:month/:type',  waterFeeToExcel);

router.get( 
    '/feeprior/:num/:year/:month/:type',
    (req, res) => {
        MoveWaterFeePosition(req, res, 'prior');
    }
    );

router.get( 
    '/feenext/:num/:year/:month/:type',
    (req, res) => {
        MoveWaterFeePosition(req, res, 'next');
    }
);    

router.post(
    '/calfee',
    calculateWaterFee
);

router.post(
    '/feesearch',
    searchWaterFees
);

router.post(
  '/feesbycompany',
  SearchFeesByCompany
);

router.post( '/feesbycompanytoexcel',  searchByCompanyToExcel);


router.post( '/feesearchtoexcel',  searchToExcel);

router.post(
    '/feesprepare',
    prepareWaterFees
);

router.put(
    '/fee',
    saveWaterFee
);

router.post(
    '/payment',
    CompletePayment
);

router.post(
  '/fees/sms',
  sendOverUsageSMS
);


module.exports = router;
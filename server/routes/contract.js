const express = require('express');
const router = express.Router();
const {
    ContractToWord,
    queryContractByNum,
    deleteContract,
    SaveFiles,
    searchFiles,
    TearDownToWord,  
    queryTearDownByNum,  
    deleteTearDown,
    TearDownComplete
} = require('../schema/contract');

router.post('/word', ContractToWord);

router.post('/teardown/word', TearDownToWord);

router.post('/files', SaveFiles);

router.post('/files/search', searchFiles);

router.get( '/contracts/:num', function ( req, res, next ) {
    "use strict";
    let {num} = req.params;
    queryContractByNum(num, res);
} );

router.get( '/teardown/:num', function ( req, res, next ) {
    "use strict";
    let {num} = req.params;
    queryTearDownByNum(num, res);
} );

router.put('/teardown/:num', TearDownComplete);

router.delete('/contracts/:num/:year', deleteContract);

router.delete('/teardown/:num', deleteTearDown);

module.exports = router;
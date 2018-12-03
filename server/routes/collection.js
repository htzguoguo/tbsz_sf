const express = require('express');
const router = express.Router();
const {
    queryAllBank, queryCollection, queryCollectionTable,
    createCollection, CollectionToExcel, SaveToBankOfferTxt,
    queryUser, SaveToUserOfferTxt, queryBatch, XinFengHuiZongToExcel,
    XinFengToExcel, inputDisk, OutputDetailToExcel, queryCollectionCount,
    createCollectionCount, OutputCountToExcel, queryBank, createBank,
    deleteBank, updateBank, SaveToBankOfferExcel, SaveToUserOfferExcel
} = require('../schema/collection');

router.get('/bank', queryAllBank);
router.post('/collection', queryCollection);
router.post('/collectiontable', queryCollectionTable);
router.put('/collection', createCollection);
router.post('/collection/excel', CollectionToExcel);
router.post('/collection/txt', SaveToBankOfferTxt);
router.post('/collection/bank/excel', SaveToBankOfferExcel);
router.post('/user', queryUser);
router.post('/user/txt', SaveToUserOfferTxt);
router.post('/user/excel', SaveToUserOfferExcel);
router.get('/batch/:date', queryBatch);
router.post('/xinfenghuizong/excel', XinFengHuiZongToExcel);
router.post('/xinfeng/excel', XinFengToExcel);
router.post('/detail/excel', OutputDetailToExcel);
router.get('/count/:date', queryCollectionCount);
router.put('/count', createCollectionCount);
router.post('/count/excel', OutputCountToExcel);
router.put('/disk', inputDisk);

router.get('/banks', queryBank);
router.put('/banks', createBank);
router.delete('/banks/:num', deleteBank);
router.post('/banks', updateBank);
module.exports = router;
const express = require('express');
const router = express.Router();
const {
    queryStatTollStatus,
    handleStatToll,
    JingYingToExcel,
    StandardToExcel,
    DetailToExcel,
    JianBaoToExcel,
    QingDanToExcel,
    GongYeToExcel,
    ShuiSunToExcel,
    ShiZhengToExcel,
    handleLackUnit,
    deleteLackUnit,
    LackUnitToExcel
} = require('../schema/stat');

router.get('/toll/:date', queryStatTollStatus);
router.post('/toll', handleStatToll);
router.post('/excel/jingying', JingYingToExcel);
router.post('/excel/standard', StandardToExcel);
router.post('/excel/detail', DetailToExcel);
router.post('/excel/jianbao', JianBaoToExcel);
router.post('/excel/qingdan', QingDanToExcel);
router.post('/excel/gongye', GongYeToExcel);
router.post('/excel/shuisun', ShuiSunToExcel);
router.post('/excel/shizheng', ShiZhengToExcel);
router.post('/excel/lackunit', LackUnitToExcel);
router.post('/lackunit', handleLackUnit);
router.delete('/lackunit/:num/:date', deleteLackUnit);
module.exports = router;
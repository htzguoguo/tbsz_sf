const express = require('express');
const router = express.Router();
const {
    queryCommission, queryDetail, ChargeMonthToExcel, 
    ChargeYearByMeterToExcel, ChargeYearByCorpToExcel,
    queryAllowance, AllowanceToExcel   
} = require('../schema/report');

router.get('/commission/:date', queryCommission);
router.get('/detail/:date/:kind', queryDetail);
router.post('/chargemonth/excel', ChargeMonthToExcel);
router.post('/chargeyear/excel/meter', ChargeYearByMeterToExcel);
router.post('/chargeyear/excel/corp', ChargeYearByCorpToExcel);
router.get('/allowance', queryAllowance);
router.get('/allowance/excel/:lister', AllowanceToExcel);
module.exports = router;
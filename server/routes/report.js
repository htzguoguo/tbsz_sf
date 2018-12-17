const express = require('express');
const router = express.Router();
const {
    queryCommission, queryDetail, queryChargeMonth,
    ChargeMonthToExcel, queryChargeYearByCorp, queryChargeYearByMeter,
    ChargeYearByMeterToExcel, ChargeYearByCorpToExcel,
    queryAllowance, AllowanceToExcel   
} = require('../schema/report');

router.get('/commission/:date', queryCommission);
router.get('/detail/:date/:kind', queryDetail);
router.post('/chargemonth/query', queryChargeMonth);
router.post('/chargemonth/excel', ChargeMonthToExcel);
router.post('/chargeyear/excel/meter', ChargeYearByMeterToExcel);
router.post('/chargeyear/excel/corp', ChargeYearByCorpToExcel);
router.post('/chargeyear/query/meter', queryChargeYearByMeter);
router.post('/chargeyear/query/corp', queryChargeYearByCorp);
router.get('/allowance', queryAllowance);
router.get('/allowance/excel/:lister', AllowanceToExcel);
module.exports = router;
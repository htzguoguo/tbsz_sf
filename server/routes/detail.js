const express = require('express');
const router = express.Router();
const {
    AllowanceToExcel, queryAllowance, queryFixWatch,
    queryRation, queryContract, queryCountShiZheng,
    CountShiZhengToExcel, queryCountAll,CountAllToExcel   
} = require('../schema/detail');

router.post('/allowance/excel', AllowanceToExcel);
router.post('/allowance', queryAllowance);
router.post('/fixwatch', queryFixWatch);
router.post('/ration', queryRation);
router.post('/contract', queryContract);
router.post('/countshizheng', queryCountShiZheng);
router.post('/countshizheng/excel', CountShiZhengToExcel);
router.post('/countall', queryCountAll);
router.post('/countall/excel', CountAllToExcel);
module.exports = router;
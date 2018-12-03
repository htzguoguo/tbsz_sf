const express = require('express');
const router = express.Router();
const {
    queryUseKind, createUpdateUseKind, deleteUseKind,
    queryChargeKind, createUpdateChargeKind, deleteChargeKind,
    queryInputKind, createUpdateInputKind, deleteInputKind,
    queryChargeStandard, createUpdateChargeStandard, deleteChargeStandard,    
    queryFireStandard, createUpdateFireStandard, deleteFireStandard
} = require('../schema/dict');

router.get('/usekind', queryUseKind);
router.put('/usekind', createUpdateUseKind);
router.delete('/usekind/:num', deleteUseKind);
router.post('/usekind', createUpdateUseKind);

router.get('/chargekind', queryChargeKind);
router.put('/chargekind', createUpdateChargeKind);
router.delete('/chargekind/:num', deleteChargeKind);
router.post('/chargekind', createUpdateChargeKind);

router.get('/inputkind', queryInputKind);
router.put('/inputkind', createUpdateInputKind);
router.delete('/inputkind/:num', deleteInputKind);
router.post('/inputkind', createUpdateInputKind);

router.get('/chargestandard', queryChargeStandard);
router.put('/chargestandard', createUpdateChargeStandard);
router.delete('/chargestandard/:num', deleteChargeStandard);
router.post('/chargestandard', createUpdateChargeStandard);

router.get('/firestandard', queryFireStandard);
router.put('/firestandard', createUpdateFireStandard);
router.delete('/firestandard/:num', deleteFireStandard);
router.post('/firestandard', createUpdateFireStandard);

module.exports = router;
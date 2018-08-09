const express = require('express');
const {
        queryUnitsByPinYin,
        queryUnitByNum,
        queryUnitParas,
        queryBankByName,
        saveUnit,
        createUnitNum,
        MoveUnitPosition,
        searchUnits,
        unitsToExcel,
        queryAllowanceByNum,
        saveAllowance,
        MoveAllowancePosition,
        saveCollection,
        MoveCollectionPosition,
        queryUnitChangeName,
        createChangeNameNum,
        saveUnitChange,
        searchUnitChange,
        changeToExcel
    } = require( "../schema/unit.js" );
const router = express.Router();

router.get( '/unitsabbr/:pinyin',  queryUnitsByPinYin);

router.get( '/units/:num',  queryUnitByNum);

router.get( '/allowance/:num',  queryAllowanceByNum);

router.get( '/unitparas',  queryUnitParas);

router.get( '/unitnum/:usekind',  createUnitNum);

router.put(
    '/unit',
    saveUnit
);

router.put(
    '/collection',
    saveCollection
);

router.get( 
    '/prior/:num',
    (req, res) => {
        MoveUnitPosition(req, res, 'prior');
    }
    );

router.get( 
    '/next/:num',
    (req, res) => {
        MoveUnitPosition(req, res, 'next');
    }
);    

router.post(
    '/unitsearch',
    searchUnits
);

router.post(
    '/unitstoexcel',
    unitsToExcel
    );

router.put(
    '/allowance',
    saveAllowance
); 

router.get( 
    '/allowance/prior/:num',
    (req, res) => {
        MoveAllowancePosition(req, res, 'prior');
    }
    );

router.get( 
    '/allowance/next/:num',
    (req, res) => {
        MoveAllowancePosition(req, res, 'next');
    }
); 

router.get( 
    '/collection/prior/:num/:cb',
    (req, res) => {
        MoveCollectionPosition(req, res, 'prior');
    }
    );

router.get( 
    '/collection/next/:num/:cb',
    (req, res) => {
        MoveCollectionPosition(req, res, 'next');
    }
); 

router.get( '/change/:num/:year/:month',  queryUnitChangeName);

router.get( '/changecreate/:num/:usekind',  createChangeNameNum);

router.put(
    '/change',
    saveUnitChange
);

router.get( '/change/:start/:end',  searchUnitChange);

router.get(
    '/changetoexcel/:start/:end',
    changeToExcel
    );

module.exports = router;
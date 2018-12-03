const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');


module.exports.queryUseKind = queryUseKind;

async function queryUseKind(req, res) {    
    try {         
        let result = await queryUseKindImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryUseKindImpt() {
    let sqlSelect = `
    Select * from 水费字典用水形式 order by 用水形式编号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.createUpdateUseKind = createUpdateUseKind;

async function createUpdateUseKind(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createUpdateUseKindImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createUpdateUseKindImpt(obj) {
    let items, result;
    let sqlSelect = `
    Select *  from 水费字典用水形式   where 用水形式编号 =:num
    `;
    items = await db.query(sqlSelect, { replacements: {num : obj.用水形式编号}, type: db.QueryTypes.SELECT }
    );
    let params = {
        a1 : obj.用水形式编号,
        a2 : obj.用水形式,       
    };
    if(items.length === 0) {
        let sqlInsert = `
        insert into 水费字典用水形式 (用水形式编号,用水形式) values(:a1,:a2)
        `;
        result = await db.query(
            sqlInsert,
            { replacements: params ,  type: db.QueryTypes.INSERT }
        );
    }else{
        let sqlUpdate = `
        Update 水费字典用水形式 set 用水形式=:a2 where 用水形式编号=:a1 
        `;
        result = await db.query(
            sqlUpdate,
            { replacements: params ,  type: db.QueryTypes.UPDATE }
        );
    }
    return result;
}

module.exports.deleteUseKind = deleteUseKind;

async function deleteUseKind(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteUseKindImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteUseKindImpt(num) {
    let sqlDelete = `
    delete from 水费字典用水形式 where 用水形式编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.queryChargeKind = queryChargeKind;

async function queryChargeKind(req, res) {    
    try {         
        let result = await queryChargeKindImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryChargeKindImpt() {
    let sqlSelect = `
    Select * from 水费字典收费形式 order by 收费形式编号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.createUpdateChargeKind = createUpdateChargeKind;

async function createUpdateChargeKind(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createUpdateChargeKindImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createUpdateChargeKindImpt(obj) {
    let items, result;
    let sqlSelect = `
    Select *  from 水费字典收费形式   where 收费形式编号 =:num
    `;
    items = await db.query(sqlSelect, { replacements: {num : obj.收费形式编号}, type: db.QueryTypes.SELECT }
    );
    let params = {
        a1 : obj.收费形式编号,
        a2 : obj.收费形式,       
    };
    if(items.length === 0) {
        let sqlInsert = `
        insert into 水费字典收费形式 (收费形式编号,收费形式) values(:a1,:a2)
        `;
        result = await db.query(
            sqlInsert,
            { replacements: params ,  type: db.QueryTypes.INSERT }
        );
    }else{
        let sqlUpdate = `
        Update 水费字典收费形式 set 收费形式=:a2 where 收费形式编号=:a1
        `;
        result = await db.query(
            sqlUpdate,
            { replacements: params ,  type: db.QueryTypes.UPDATE }
        );
    }
    return result;
}

module.exports.deleteChargeKind = deleteChargeKind;

async function deleteChargeKind(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteChargeKindImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteChargeKindImpt(num) {
    let sqlDelete = `
    delete from 水费字典收费形式 where 收费形式编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.queryInputKind = queryInputKind;

async function queryInputKind(req, res) {    
    try {         
        let result = await queryInputKindImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryInputKindImpt() {
    let sqlSelect = `
    Select * from 水费字典抄表形式 order by 抄表形式编号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;

}

module.exports.createUpdateInputKind = createUpdateInputKind;

async function createUpdateInputKind(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createUpdateInputKindImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createUpdateInputKindImpt(obj) {
    let items, result;
    let sqlSelect = `
    Select *  from 水费字典抄表形式   where 抄表形式编号  =:num
    `;
    items = await db.query(sqlSelect, { replacements: {num : obj.抄表形式编号}, type: db.QueryTypes.SELECT }
    );
    let params = {
        a1 : obj.抄表形式编号,
        a2 : obj.抄表形式,       
    };
    if(items.length === 0) {
        let sqlInsert = `
        insert into 水费字典抄表形式 (抄表形式编号,抄表形式) values(:a1,:a2)
        `;
        result = await db.query(
            sqlInsert,
            { replacements: params ,  type: db.QueryTypes.INSERT }
        );
    }else{
        let sqlUpdate = `
        Update 水费字典抄表形式 set 抄表形式=:a2 where 抄表形式编号=:a1 
        `;
        result = await db.query(
            sqlUpdate,
            { replacements: params ,  type: db.QueryTypes.UPDATE }
        );
    }
    return result;
}

module.exports.deleteInputKind = deleteInputKind;

async function deleteInputKind(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteInputKindImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteInputKindImpt(num) {
    let sqlDelete = `
    delete from 水费字典抄表形式 where 抄表形式编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.queryChargeStandard = queryChargeStandard;

async function queryChargeStandard(req, res) {    
    try {         
        let result = await queryChargeStandardImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryChargeStandardImpt() {
    let sqlSelect = `
    Select * from 水费字典费用标准 order by 区号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;

}

module.exports.createUpdateChargeStandard = createUpdateChargeStandard;

async function createUpdateChargeStandard(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createUpdateChargeStandardImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createUpdateChargeStandardImpt(obj) {
    let items, result;
    let sqlSelect = `
    Select *  from 水费字典费用标准   where 区号 =:num
    `;
    items = await db.query(sqlSelect, { replacements: {num : obj.区号}, type: db.QueryTypes.SELECT }
    );
    let params = {
        a1 : obj.区号,
        a2 : obj.单位类别, 
        a3 : obj.单价,   
        a4 : obj.超计划,   
        a5 : obj.排污费单价,   
        a6 : obj.排污费超额,         
    };
    if(items.length === 0) {
        let sqlInsert = `
        insert into 水费字典费用标准 (区号,单位类别,单价,超计划,排污费单价,排污费超额) values(:a1,:a2,:a3,:a4,:a5,:a6)
        `;
        result = await db.query(
            sqlInsert,
            { replacements: params ,  type: db.QueryTypes.INSERT }
        );
    }else{
        let sqlUpdate = `
        Update 水费字典费用标准 set 单位类别=:a2,单价=:a3,超计划=:a4,排污费单价=:a5,排污费超额=:a6 where 区号=:a1 
        `;
        result = await db.query(
            sqlUpdate,
            { replacements: params ,  type: db.QueryTypes.UPDATE }
        );
    }
    return result;
}

module.exports.deleteChargeStandard = deleteChargeStandard;

async function deleteChargeStandard(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteChargeStandardImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteChargeStandardImpt(num) {
    let sqlDelete = `
    delete from 水费字典费用标准 where 区号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.queryFireStandard = queryFireStandard;

async function queryFireStandard(req, res) {    
    try {         
        let result = await queryFireStandardImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryFireStandardImpt() {
    let sqlSelect = `
    Select * from 水费字典防火标准 order by 防火标准编号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;

}

module.exports.createUpdateFireStandard = createUpdateFireStandard;

async function createUpdateFireStandard(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createUpdateFireStandardImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createUpdateFireStandardImpt(obj) {
    let items, result;
    let sqlSelect = `
    Select *  from 水费字典防火标准   where 防火标准编号 =:num
    `;
    items = await db.query(sqlSelect, { replacements: {num : obj.防火标准编号}, type: db.QueryTypes.SELECT }
    );
    let params = {
        a1 : obj.防火标准编号,
        a2 : obj.管径, 
        a3 : obj.防火费,
    };
    if(items.length === 0) {
        let sqlInsert = `
        insert into 水费字典防火标准 (防火标准编号,管径,防火费) values(:a1,:a2,:a3)
        `;
        result = await db.query(
            sqlInsert,
            { replacements: params ,  type: db.QueryTypes.INSERT }
        );
    }else{
        let sqlUpdate = `
        Update 水费字典防火标准 set 管径=:a2,防火费=:a3 where 防火标准编号=:a1
        `;
        result = await db.query(
            sqlUpdate,
            { replacements: params ,  type: db.QueryTypes.UPDATE }
        );
    }
    return result;
}

module.exports.deleteFireStandard = deleteFireStandard;

async function deleteFireStandard(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteFireStandardImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteFireStandardImpt(num) {
    let sqlDelete = `
    delete from 水费字典防火标准 where 防火标准编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}
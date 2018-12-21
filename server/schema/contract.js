const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toWord} = require('../modules/word_helper');
const {queryUnitByNumImpt, queryUnitByDownNumImpt} = require('./unit');

module.exports.ContractToWord = ContractToWord;

async function ContractToWord(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ContractToWordImpt(obj);
        await SaveContractImpt(wb);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]);
        res.end( new Buffer(wb.buf, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function SaveContractImpt(obj) {
    let {编号, 年份, user} = obj.para;     
    let item = obj.item;
    let savepath = obj.savename;
    let sqlcontract = `
    select 编号 from 水费合同表 where (编号=:num) and (年=:year)           
    `;
    let result = await db.query(
        sqlcontract,
        { replacements: { num : 编号, year : 年份 }, type: db.QueryTypes.SELECT }
    ); 
    let t = dateFormat(new Date(), "yyyy-mm-dd");
    if(result.length > 0) {
        let sqlUpdate = `
        update 水费合同表 set  操作员=:a1,操作时间=:a2,文件=:a3
            where (年=:a4) and (编号=:a5)
        `;
        await db.query(
            sqlUpdate,
            { replacements: {
                a1 : user,
                a2 : t,
                a3 : savepath,
                a4 : 年份,
                a5 : 编号
            }, type: db.QueryTypes.UPDATE }
        ); 
    }else {
        let sqlInsert = `
        Insert Into 水费合同表 (编号,户名,年,操作员,操作时间,合同编号,用水指标,文件)
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8)                
        `;
        await db.query(
            sqlInsert,
            { replacements: {
                a1 : item.编号,
                a2 : item.户名,
                a3 : 年份,
                a4 : user,
                a5 : t,
                a6 : item.编号,
                a7 : item.申请水量,
                a8 : savepath
            }, type: db.QueryTypes.INSERT }
        ); 
    }   
}

async function ContractToWordImpt(obj) { 
    let num = obj.编号;
    let items = await queryUnitByNumImpt(num);
    let result = {};
    if(items && items.length > 0) {
        let item = items[0];
        item.帐户地址 = item.帐户地址 ? item.帐户地址 : '';
        item.联系人 = item.联系人 ? item.联系人 : '';
        item.电话 = item.电话 ? item.电话 : '';
        item.开户行行名 = item.开户行行名 ? item.开户行行名 : '';
        item.开户行行号 = item.开户行行号 ? item.开户行行号 : '';
        item.帐号 = item.帐号 ? item.帐号 : '';
        item.业务种类 = item.业务种类 ? item.业务种类 : '';
        item.协议书号 = item.协议书号 ? item.协议书号 : '';
        result = toWord('contract', item, true);
        result.item = item;
        result.para = obj;
    }else {
        throw new Error('没有找到对应的用水企业');
    }
    return result;
}

module.exports.queryContractByNum = queryContractByNum;

function queryContractByNum(num, res) {
    let sqlBasic = `
    Select * from 水费合同表  where (编号=:a1) 
    `;
    db.query(
    sqlBasic,
    { replacements: {a1 : num }, type: db.QueryTypes.SELECT }
    ).then(items => {
        if (items.length > 0) {
            Helper.ResourceFound( res, items );
        }else {
            Helper.ResourceNotFound( res , {num });
        }
    }).catch(
        error => {
            Helper.InternalServerError( res, error, {num} );
        }
    ); 
}

module.exports.deleteContract = deleteContract;

async function deleteContract(req, res) { 
    let { num, year } = req.params;   
    try {         
        let result = await deleteContractImpt(num, year);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteContractImpt(num, year) {
    let sqlDelete = `
    delete from 水费合同表 where 编号=:num and 年=:year
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num, year} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.SaveFiles = SaveFiles;

async function SaveFiles(req, res) {
    let obj = req.body || {};
    try {       
        let result = await SaveFilesImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function SaveFilesImpt(obj) {
    let {编号, 户名, 名称, 分类, 
        备注, fileList, files, user} = obj;
    
    let t = dateFormat(new Date(), "yyyy-mm-dd");
    let sqlInsert = `
        Insert Into 企业文档表 (编号,户名,名称,分类,备注,操作员,操作时间,原始文件, 本地文件)
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9)                
        `;
    let result = await db.query(
        sqlInsert,
        { replacements: {
            a1 : 编号,
            a2 : 户名,
            a3 : 名称,
            a4 : 分类,
            a5 : 备注 ? 备注 : '',
            a6 : user,
            a7 : t,
            a8 : fileList.join(','),
            a9 : files.join(',')
        }, type: db.QueryTypes.INSERT }
    );
    return result;
}

module.exports.searchFiles = searchFiles;

async function searchFiles(req, res) {
    let obj = req.body || {};
    try {
        let result = await searchFilesImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

function generalSqlParams(obj, key) {
    if (obj[key] && obj[key].length > 0) {
        obj[key] = '%' + obj[key] + '%';
    }
}

function buildWhereSingle(obj, key, para, paraKey, params, where) {
    if (obj[key] && obj[key].length >= 1) {
        where.push(para)
        if (paraKey) {
            params[paraKey] = obj[key];
        }        
    }
}

async function searchFilesImpt(obj){
    let sql = `
    SELECT * from 企业文档表   
    `;
    let params = {};
    let where = [];
    generalSqlParams(obj, '编号');
    generalSqlParams(obj, '户名');
    generalSqlParams(obj, '名称');
    generalSqlParams(obj, '分类');
    buildWhereSingle(obj, '编号', ` (编号 like :num) `, 'num', params, where); 
    buildWhereSingle(obj, '户名', ` (户名 like :name) `, 'name', params, where); 
    buildWhereSingle(obj, '名称', ` (名称 like :filename) `, 'filename', params, where); 
    buildWhereSingle(obj, '分类', ` (分类 like :filecategory) `, 'filecategory', params, where); 
    
    let ww = where.join(' and ');
    sql += ww.length > 2 ? ' where ' +  ww : ''; 
    let result = await db.query(
        sql,
        { replacements: params, type: db.QueryTypes.SELECT }
    ); 
    return result;  
} 

module.exports.TearDownToWord = TearDownToWord;

async function TearDownToWord(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await TearDownToWordImpt(obj);
        await SaveTearDownImpt(wb);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]);
        res.end( new Buffer(wb.buf, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function SaveTearDownImpt(obj) {
    let {编号, user} = obj.para;     
    let item = obj.item;
    let savepath = obj.savename;
    let sqlcontract = `
    select 编号 from 终止供水合同表 where (编号=:num)          
    `;
    let result = await db.query(
        sqlcontract,
        { replacements: {num : 编号}, type: db.QueryTypes.SELECT }
    ); 
    let t = dateFormat(new Date(), "yyyy-mm-dd");
    if(result.length > 0) {
        let sqlUpdate = `
        update 终止供水合同表 set  通知人=:a1,操作时间=:a2,文件=:a3,完成时间=:a4,状态=:a5
            where 编号=:a7 
        `;
        await db.query(
            sqlUpdate,
            { replacements: {
                a1 : user,
                a2 : t,
                a3 : savepath,
                a4 : '',
                a5 : '已提交申请',
                a7 : 编号
            }, type: db.QueryTypes.UPDATE }
        ); 
    }else {
        let sqlInsert = `
        Insert Into 终止供水合同表 (编号,户名,通知人,操作时间,状态,完成时间,文件)
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7)                
        `;
        await db.query(
            sqlInsert,
            { replacements: {
                a1 : item.编号,
                a2 : item.户名,
                a3 : user,
                a4 : t,
                a5 : '已提交申请',
                a6 : '',
                a7 : savepath
            }, type: db.QueryTypes.INSERT }
        ); 
    }   
}

async function TearDownToWordImpt(obj) { 
    let num = obj.编号;
    let user = obj.user;
    let items = await queryUnitByDownNumImpt(num);
    let result = {};
    if(items && items.length > 0) {
        let values = {};
        values.items = [];
        let item = items[0];
        values.通知人 = user;
        values.户名 = item.户名 ? item.户名 : '';
        for(let i = 1; i <= items.length; i++) {
            values.items.push(
                {
                    index : i,
                    编号 : items[i - 1].编号
                }
            );
        }
        result = toWord('teardown', values, true);
        result.item = item;
        result.para = obj;
    }else {
        throw new Error('没有找到对应的用水企业');
    }
    return result;
}

module.exports.queryTearDownByNum = queryTearDownByNum;

function queryTearDownByNum(num, res) {
    if(num !== 'undefined') {
        let sqlBasic = `
        Select * from 终止供水合同表  where (编号=:a1) or (户名 like :a2)
        `;
        db.query(
        sqlBasic,
        { replacements: {a1 : num, a2 : `%${num}%` }, type: db.QueryTypes.SELECT }
        ).then(items => {
            if (items.length > 0) {
                Helper.ResourceFound( res, items );
            }else {
                Helper.ResourceNotFound( res , {num });
            }
        }).catch(
            error => {
                Helper.InternalServerError( res, error, {num} );
            }
        ); 
    }else {
        let sqlBasic = `
        Select * from 终止供水合同表
        `;
        db.query(
        sqlBasic,
        { replacements: {}, type: db.QueryTypes.SELECT }
        ).then(items => {
            if (items.length > 0) {
                Helper.ResourceFound( res, items );
            }else {
                Helper.ResourceNotFound( res , {num });
            }
        }).catch(
            error => {
                Helper.InternalServerError( res, error, {num} );
            }
        ); 
    }
}

module.exports.TearDownComplete = TearDownComplete;

async function TearDownComplete(req, res) { 
  let obj = req.body || {};
  try {         
      let result = await TearDownCompleteImpt(obj);
      Helper.ResourceFound( res, result );
  }catch(ex) {
      Helper.InternalServerError( res, ex, {} );
  }
}

async function TearDownCompleteImpt(obj) {
    let t = dateFormat(new Date(), "yyyy-mm-dd");
    let sqlUpdate = `
        update 终止供水合同表 set  完成时间=:a1,状态=:a2,处理结果=:a3,经办人=:a4
            where 编号=:a5 
        `;
    await db.query(
        sqlUpdate,
        { replacements: {
            a1 : t,
            a2 : '完成',
            a3 : obj.处理结果,
            a4 : obj.经办人,
            a5 : obj.编号,

        }, type: db.QueryTypes.UPDATE }
    ); 
}


module.exports.deleteTearDown = deleteTearDown;

async function deleteTearDown(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteTearDownImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteTearDownImpt(num, year) {
    let sqlDelete = `
    delete from 终止供水合同表 where 编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num, year} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}


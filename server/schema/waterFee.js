const Sequelize = require('sequelize');
const nzhcn = require("nzh/cn");
// const XLSX = require("xlsx");
const XlsxTemplate = require('xlsx-template');
const fs = require("fs");
const path = require("path");
const moment = require('moment');
const BigNumber = require('bignumber.js');
const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {sendSMS} = require('../modules/sms_helper');
const {queryPersonAndNumber} = require('./unit');
const {getPropertyFromArray} = require('../modules/object_helper');

module.exports.queryWaterFee = queryWaterFee;

function queryWaterFee(num, year, month, res) {
    let sqlBasic = `
    SELECT A.编号, A.户名, A.区号, F.单价, D.单位性质编号, D.单位性质, E.抄表形式编号,E.抄表形式,F.排污费单价 FROM 水费单位信息 A RIGHT OUTER JOIN 水费字典单位性质 D ON A.单位性质编号 = D.单位性质编号 RIGHT OUTER JOIN 
    水费字典抄表形式 E ON A.抄表形式编号 = E.抄表形式编号 RIGHT OUTER JOIN 水费字典费用标准 F ON A.区号 = F.区号 where A.编号= :no
    `;
    let sqlFee = `
    SELECT 年,月,上月表底,本月表底,用水量,计划水量,计划水费,超额水量,超额水费,防火费,手续费
    ,实收水费,排污费,其它,申请水量,年用水量,剩余水量,减免水量,减免单价,减免水费,减排污费
    ,减其它,应收水费, 欠费标志 from 水费基本表 where (编号=:no) and (年=:y) and (月=:m)
    `;     
    Promise.all([
        db.query(
        sqlBasic,
        { replacements: { no: num }, type: db.QueryTypes.SELECT }
        ),
        db.query(
            sqlFee,
            { replacements: { no: num, y : year, m : month }, type: db.QueryTypes.SELECT }
        ),
    ]).then(items => {
        let result = [{
            ...items[0][0],
            ...items[1][0],
        }];
        if (items) {
            Helper.ResourceFound( res, result );
        }else {
            Helper.ResourceNotFound( res , { num : num });
        }
    }).catch(
        error => {
            Helper.InternalServerError( res, error, { num : num } );
        }
    ); 
} 

module.exports.queryWaterFees = queryWaterFees;

function queryWaterFees(year, month, type, res) {
    let sqlBasic = `
    Select * from 水费修改计算  where (年=:y) and (月=:m) 
    `;
    if (type === '1') {
        sqlBasic += `and (抄表形式编号='1')`;
    }else if (type === '2') {
        sqlBasic += ` and (抄表形式编号='2')`;
    }
    db.query(
    sqlBasic,
    { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
    ).then(items => {
        if (items.length > 0) {
            Helper.ResourceFound( res, items );
        }else {
            Helper.ResourceNotFound( res , {y : year, m : month });
        }
    }).catch(
        error => {
            Helper.InternalServerError( res, error, {y : year, m : month } );
        }
    ); 
}

module.exports.searchWaterFees = search;

async function search(req, res) {
    let obj = req.body || {};
    try {
        let result = await searchWaterFees(obj, 'Select * from 水费报表查询 ');
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

function buildWhereBetween(obj, key, para, search, params, where) {
    let sKey = '起始' + key;
    let tKey = '终止' + key; 
    let sSearch = 's' + search;
    let tSearch = 't' + search;
    if (obj[sKey] && obj[sKey].length > 0) {
        where.push(` (${para}>=:${sSearch}) `)
        params[sSearch] = obj[sKey];
    }
    if (obj[tKey] && obj[tKey].length > 0) {
        where.push(` (${para}<=:${tSearch}) `)
        params[tSearch] = obj[tKey];
    }
}

function buildWhereSingle(obj, key, para, search, params, where) {
    if (obj[key] && obj[key].length >= 1) {
        where.push(para)
        params[search] = obj[key];
    }
}

function buildWhereCheck(obj, key, para, where) {
    if (obj[key]) {
        where.push(para)        
    }
}

async function searchWaterFees(obj, s){
    let sql = s;
    let params = {};
    let where = [];
    if (obj['户名'] && obj['户名'].length > 1) {
        obj['户名'] = '%' + obj['户名'] + '%';
    }
    buildWhereBetween(obj, '年月', '年+月', 'date', params, where);
    buildWhereBetween(obj, '编号', '编号', 'num', params, where); 
    buildWhereSingle(obj, '户名', ` (户名 like :name) `, 'name', params, where);
    buildWhereSingle(obj, '费用标准', ` (区号 = :chargestandard) `, 'chargestandard', params, where);
    buildWhereSingle(obj, '抄表形式', ` (抄表形式编号 = :inputkind) `, 'inputkind', params, where);
    buildWhereSingle(obj, '用水形式', ` (用水形式编号 = :usekind) `, 'usekind', params, where);
    buildWhereSingle(obj, '收费形式', ` (收费形式编号 = :chargekind) `, 'chargekind', params, where);
    buildWhereBetween(obj, '上月表底', '上月表底', 'lastmonth', params, where);
    buildWhereBetween(obj, '本月表底', '本月表底', 'currentmonth', params, where);
    buildWhereBetween(obj, '用水量', '用水量', 'usewater', params, where);
    buildWhereBetween(obj, '计划水量', '计划水量', 'planwater', params, where);
    buildWhereBetween(obj, '计划水费', '计划水费', 'plancharge', params, where);
    buildWhereBetween(obj, '应收水费', '应收水费', 'accountcharge', params, where);
    buildWhereBetween(obj, '超额水量', '超额水量', 'overwater', params, where);
    buildWhereBetween(obj, '超额水费', '超额水费', 'overcharge', params, where);
    buildWhereBetween(obj, '排污费', '排污费', 'pollute', params, where);
    buildWhereBetween(obj, '防火费', '防火费', 'fire', params, where);
    buildWhereBetween(obj, '手续费', '手续费', 'commission', params, where);
    buildWhereBetween(obj, '其它', '其它', 'others', params, where);
    buildWhereBetween(obj, '申请水量', '申请水量', 'applywater', params, where);
    buildWhereBetween(obj, '年用水量', '年用水量', 'yearwater', params, where);
    buildWhereBetween(obj, '剩余水量', '剩余水量', 'remainwater', params, where);
    buildWhereBetween(obj, '减免水费', '减免水费', 'minuscharge', params, where);
    buildWhereBetween(obj, '减其它', '减其它', 'minusothers', params, where);
    buildWhereBetween(obj, '实收水费', '实收水费', 'truecharge', params, where);
    buildWhereCheck(obj, '欠费标志', ` (欠费标志='2') `, where);

    let ww = where.join(' and ');
    sql += ww.length > 2 ? ' where ' +  ww : ''; 
    let result = await db.query(
        sql,
        { replacements: params, type: db.QueryTypes.SELECT }
    ); 
    return result;  
} 

module.exports.queryWaterFeesNum = queryWaterFeesNum;
async function queryWaterFeesNum(req, res) {
    let {year, month} = req.params;
    try {
        let sqlStat1 = `
        select 编号 from 水费基本表 where (年=:y) and (月=:m) 
        `;
        let result = await db.query(
            sqlStat1,
            { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
        ); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { year, month } );
    }
}

module.exports.queryWaterFeesYearlyByNum = queryWaterFeesYearlyByNum;
async function queryWaterFeesYearlyByNum(req, res) {
    let {num, year} = req.params;
    try {
        let sqlStat1 = `
        select * from 水费基本表 where (年=:y) and (编号=:no) order by 月 desc
        `;
        let result = await db.query(
            sqlStat1,
            { replacements: {y : year, no : num }, type: db.QueryTypes.SELECT }
        ); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { year, num } );
    }
}

module.exports.queryFeeParas = paras;

async function paras(req, res) {   
    try {
        let result = await queryFeeParas();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryFeeParas() {
    let result = {};
    // 显示费用标准
    let sql1 = `
    SELECT  区号,单位类别,单价 from 水费字典费用标准 Order By 区号 
    `;
    let r1 = await db.query(
        sql1,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.charges = r1;
    // 显示抄表形式
    let sql2 = `
    SELECT  * from 水费字典抄表形式 Order By 抄表形式编号 
    `;
    let r2 = await db.query(
        sql2,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.inputkinds = r2;
    // 显示用水形式
    let sql3 = `
    SELECT  * from 水费字典用水形式 Order By 用水形式编号 
    `;
    let r3 = await db.query(
        sql3,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.usekinds = r3;
    // 显示收费形式
    let sql4 = `
    SELECT  * from 水费字典收费形式 Order By 收费形式编号 
    `;
    let r4 = await db.query(
        sql4,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.chargekinds = r4;
    result.dd = dateFormat(new Date(), "yyyymm");
    return result;
}

module.exports.eraseZeroWaterFees = eraseZeroWaterFees;
async function eraseZeroWaterFees(req, res) {
    let {year, month} = req.params;
    try {
        let sqlDel = `
        delete from  水费基本表  where 实收水费=0 and (年=:y) and (月=:m) 
        `;
        let result = await db.query(
            sqlDel,
            { replacements: {y : year, m : month }, type: db.QueryTypes.DELETE }
        ); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { year, month } );
    }
}

module.exports.prepareWaterFees = prepare;

async function prepare(req, res) {
    let obj = req.body || {};
    try {
        let result = await prepareWaterFees(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function prepareWaterFees({year, month, commission, others, user}) {
    let TempYear, TempMonth;
    if(month === '01') {
        TempYear = (parseInt(year) - 1).toString();
        TempMonth = '12';
    }else {
        TempYear = year;
        TempMonth = parseInt(month) - 1;
        TempMonth = TempMonth < 10 ? '0' + TempMonth.toString() : TempMonth.toString();
    }
    let sqlDel = `
    delete from 水费基本表  where (年=:y) and (月=:m) 
    `;
    await db.query(
        sqlDel,
        { replacements: {y : year, m : month }, type: db.QueryTypes.DELETE }
    );
    //根据上月表底数生成本月表底数
    //从上月数生成本月数
    let sqlInsert = `
        Insert Into 水费基本表 (年,月,编号,户名,上月表底,本月表底,用水量,计划水量,计划水费,超额水量,超额水费,防火费,手续费,实收水费,排污费,其它,欠费标志,大写,操作员,操作时间,申请水量,年用水量,剩余水量) 
            select :year, :month,编号,户名,本月表底,本月表底,0,0,0,0,0,0,手续费,0,0,:others,'1','','','',申请水量,0,0 from 水费基本表      
            where (年=:y) and (月=:m)
        `;
    await db.query(
        sqlInsert,
        { replacements: {y : TempYear, m : TempMonth, year, month,  others }, type: db.QueryTypes.INSERT }
    );
    //从单位信息表中查找没有的信息
    let sqlCheckNotExist = `
    Insert Into 水费基本表 (年,月,编号,户名,上月表底,本月表底,用水量,计划水量,计划水费,超额水量,超额水费,防火费,手续费,实收水费,排污费,其它,大写,操作员,操作时间,申请水量,年用水量,剩余水量,欠费标志)
        select :y, :m, 编号,户名,0,0,0,0,0,0,0,0, :commission, 0,0,0,'','','',申请水量,0,0, '1' from 水费单位信息
        Where 编号 not in ( Select 编号 from 水费基本表 where (年=:y) and (月=:m))  and 节门状态='开'
        `;
    await db.query(
        sqlCheckNotExist,
        { replacements: {y : year, m : month, commission }, type: db.QueryTypes.INSERT }
    );    
    //从单位信息表中查找减少的信息    
    let sqlCheckMissing = `
    delete from  水费基本表
        Where 编号 in ( Select 编号 from 水费单位信息 where 节门状态='闭') and 年=:y and 月=:m    
    `;
    await db.query(
        sqlCheckMissing,
        { replacements: {y : year, m : month }, type: db.QueryTypes.DELETE }
    );
    //更改防火费
    let sqlUpdateFire = `
    update 水费基本表 set 防火费=(SELECT B.防火费 FROM 水费字典防火标准 B INNER JOIN 水费单位信息 A ON B.防火标准编号 = A.防火标准编号 Where A.编号=水费基本表.编号)
        where (年=:y) and (月=:m)
    `; 
    await db.query(
        sqlUpdateFire,
        { replacements: {y : year, m : month }, type: db.QueryTypes.UPDATE }
    ); 
    //更新水费单价
    let sqlUpdatePrice = `
    update 水费基本表 
        set 单价=(SELECT B.单价 FROM 水费字典费用标准 B INNER JOIN 水费单位信息 A ON B.区号 = A.收费形式编号 Where A.编号=水费基本表.编号)
        where (年=:y) and (月=:m)
    `; 
    await db.query(
        sqlUpdatePrice,
        { replacements: {y : year, m : month }, type: db.QueryTypes.UPDATE }
    );
    //更改操作员和操作时间
    let sqlUpdateUserAndDate = `
    update 水费基本表 set 操作员=:user,操作时间=:dd
        where (年=:y) and (月=:m)
    `; 
    await db.query(
        sqlUpdateUserAndDate,
        { replacements: {y : year, m : month, user, dd :dateFormat(new Date(), "yyyy-mm-dd")  }, type: db.QueryTypes.UPDATE }
    ); 
    //求合计
    let sqlUpdateSum = `
    update 水费基本表 set 实收水费=计划水费+超额水费+防火费+手续费+排污费+其它
        where (年=:y) and (月=:m)
    `; 
    await db.query(
        sqlUpdateSum,
        { replacements: {y : year, m : month}, type: db.QueryTypes.UPDATE }
    );
    return {
        desc : '月水费自动创建完毕!'
    } 
}

module.exports.statisticsWaterFees = statistics;

async function statistics(req, res) {
    let {year, month, type} = req.params;
    try {
        let result = await statisticsWaterFee(year, month, type);
        Helper.ResourceFound( res, [result] );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { year, month, type } );
    }
}

async function statisticsWaterFee(year, month, type) {
    // let sqlBasic = `
    // Select * from 水费修改计算  where (年=:y) and (月=:m) 
    // `;
    // if (type === '1') {
    //     sqlBasic += `and (抄表形式编号='1')`;
    // }else if (type === '2') {
    //     sqlBasic += ` and (抄表形式编号='2')`;
    // }
    // sqlBasic += ` order by 编号`;
    // let res = await db.query(
    // sqlBasic,
    // { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
    // ); 
    // for(let i = 0; i < res.length; i++) {
    //     let obj = res[i];
    //     let cc = await calculateFee(obj);
    //     let bb = {...obj, ...cc};
    //     let rr = await saveWaterFee(bb);
    // }
    let sqlStat1 = `
    select sum(用水量) as 水量,count(编号) as 户数,sum(应收水费) as 水费 from 水费修改计算 
        where (年=:y) and (月=:m) and 编号<'2000' 
    `;
    let stat1 = await db.query(
        sqlStat1,
        { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
    );
    let sqlStat2 = `
    select sum(用水量) as 水量,count(编号) as 户数,sum(应收水费) as 水费 from 水费修改计算 
        where (年=:y) and (月=:m) and 编号>='2000' 
    `;
    let stat2 = await db.query(
        sqlStat2,
        { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
    ); 
    if (stat1.length === 1 && stat2.length === 1) {
        stat1 = stat1[0];
        stat2 = stat2[0];
        return {
            临时户 :  stat1.户数,
            临时户水量 : stat1.水量 ? stat1.水量 : 0,
            临时户水费 : stat1.水费 ? stat1.水费 : 0,
            正式户 : stat2.户数,
            正式户水量 : stat2.水量 ? stat2.水量 : 0,
            正式户水费 : stat2.水费 ? stat2.水费 : 0,
            总水量 : stat2.水量 && stat1.水量 ? parseInt(stat1.水量) + parseInt(stat2.水量) : 0
        };   
    }else {
        return {};
    }
}

module.exports.waterFeeToExcel = toExcel;

async function toExcel(req, res) {
    let {year, month, type} = req.params;
    try {        
        let wb = await waterFeeToExcel(year, month, type);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, { year, month, type } );
    }
}

async function waterFeeToExcel(year, month, type) {
    let sqlStat1 = `
    Select * from 水费报表查询  where (年=:y) and (月=:m) Order by 编号
    `;
    let stat1 = await db.query(
        sqlStat1,
        { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
    );
    if(stat1.length > 0) {
        let sqlSum = `
        Select  count(*) as 户, sum(上月表底) as 上月表底, sum(本月表底) as 本月表底,
        sum(实际用水量) as 实际用水量, sum(实际计划水费) as 实际计划水费, 
        sum(超额水量) as 超额水量, sum(超额水费) as 超额水费,   
        sum(排污费) as 排污费, sum(防火费) as 防火费, 
        sum(手续费) as 手续费, sum(其它) as 其它,
        sum(减水费) as 减水费, sum(实收水费) as 实收水费
            from 水费报表查询
            where (年=:y) and (月=:m)
        `;
        let sum1 = await db.query(
            sqlSum,
            { replacements: {y : year, m : month }, type: db.QueryTypes.SELECT }
        );

        stat1.forEach(
            (item, index) => {
                item.水费合计 = `=S${index + 4}-M${index + 4}`
            }
        );
        let len = stat1.length;
        stat1.push(
            {
                编号 : '合计',
                户名 : sum1[0].户 + '户',
                装表地点 : '',
                单价 : '',
                排污费单价 : '',
                超额水价 : '',
                申请水量 : '',
                水费合计 : `=SUM(R4:R${len + 3})`,
                使用期限 : '',
                剩余水量 : '',
                ...sum1[0]
            }
        );
    }    
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', '水费浏览.xlsx'));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    let sheetNumber = 'Sheet1';
    // Set up some placeholder values matching the placeholders in the template
    let values = {
        year: year,
        month: month,
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        fees: stat1
    };

    // Perform substitution
    template.substitute(sheetNumber, values);
    // Get binary data
    return template.generate({type: 'base64'});
}

function buildExcel(sheetName, template, values) {
    let temp  = new XlsxTemplate(template);
    temp.substitute(sheetName, values);
    // Get binary data
    return temp.generate({type: 'base64'});
}

module.exports.searchToExcel = searchToExcel;

async function searchToExcel(req, res) {
    let obj = req.body || {};
    try {        
        let wb = await searchToExcelImp(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function searchToExcelImp(obj) {
    let items = await searchWaterFees(obj, 'Select * from 水费报表查询 ');
    if(items.length > 0) {
        let sqlSum = `
        Select  count(*) as 户, sum(上月表底) as 上月表底, sum(本月表底) as 本月表底,
        sum(实际用水量) as 实际用水量, sum(实际计划水费) as 实际计划水费, 
        sum(超额水量) as 超额水量, sum(超额水费) as 超额水费,   
        sum(排污费) as 排污费, sum(防火费) as 防火费, 
        sum(手续费) as 手续费, sum(其它) as 其它,
        sum(减水费) as 减水费, sum(实收水费) as 实收水费
            from 水费报表查询
        `;
        let sum = await searchWaterFees(obj, sqlSum);
        items.forEach(
            (item, index) => {
                item.水费合计 = `=U${index + 4}-O${index + 4}`
            }
        );
        let len = items.length;
        items.push(
            {
                编号 : '',
                户名 : '',
                装表地点 : '',
                单价 : '',
                排污费单价 : '',
                年 : '合计',
                月 : sum[0].户 + '户',
                超额水价 : '',
                申请水量 : '',
                水费合计 : `=SUM(T4:T${len + 3})`,
                使用期限 : '',
                剩余水量 : '',
                ...sum[0]
            }
        );   
    }
    
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', '水费查询.xlsx'));
    //return buildExcel('Sheet2', data, values);
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    let sheetNumber = 'Sheet2';
    // Set up some placeholder values matching the placeholders in the template
    let values = {        
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        fees: items
    };
    // Perform substitution
    template.substitute(sheetNumber, values);
    // Get binary data
    return template.generate({type: 'base64'});

}

module.exports.MoveWaterFeePosition = MoveWaterFeePosition;

async function MoveWaterFeePosition(req, res, direction) {
    let {num, year, month, type} = req.params;
    let sqlFee;
    if(direction === 'prior') {
        sqlFee = `
        Select 编号 from 水费用水量查询 where (编号<:no) and (年=:y) and (月=:m)
        `;  
    }else {
        sqlFee = `
        Select 编号 from 水费用水量查询 where (编号>:no) and (年=:y) and (月=:m)
        `;  
    }
    
    if (type === '1') {
        sqlFee += `and (抄表形式编号='1')`;
    }else if (type === '2') {
        sqlFee += ` and (抄表形式编号='2')`;
    }
    if(direction === 'prior') {
        sqlFee += ' Order by 编号 desc';
    }else {
        sqlFee += ' Order by 编号';
    }
    
    let result = await db.query(
        sqlFee,
        { replacements: { no: num, y : year, m : month }, type: db.QueryTypes.SELECT }
    )
    if(result.length > 0) {
        queryWaterFee(result[0].编号, year, month, res);
    }else {
        Helper.ResourceNotFound(res, {}, '没有发现记录')
    }
}

module.exports.calculateWaterFee =  cal;

async function cal(req, res) {
    let obj = req.body || {};
    try {
        let result = await calculateFee(obj);
        Helper.ResourceFound( res, [result] );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

async function calculateFee(obj) {     
    let {
        编号, 年, 月, 本月表底, 上月表底,
        手续费, 其它, 减免水量, 减免单价, 
        减排污费, 减其它, 老表水费
        } = obj;
    let FPlan, FOver, FPollute, FCharge,
        FMinusCharge, FMinusPollute, FTrueCharge ;    
    let FRemainWater = 0; //剩余水量 
    let FYearWater = 0; //年用水量
    let FOverWater = 0; //超额水
    let FPlanWater = 0;  //计划用水  
    let FMinusWater = parseFloat(减免水量);
    let FMinusStandard = parseFloat(减免单价);
    let FMinusOthers = parseFloat(减其它);
    let FOldCharge =  parseFloat(老表水费);   

    let sqlfee = `
    SELECT 编号,用水量,手续费,其它,原申请水量,用水日期,使用期限,定额,单价,防火费,超计划,排污费单价,排污费超额,扣水单位编号 
        FROM 水费修改计算 where (编号=:no) and (年=:y) and (月=:m)
    `;
    let result = await db.query(
        sqlfee,
        { replacements: { no: 编号, y : 年, m : 月 }, type: db.QueryTypes.SELECT }
    );
    let IUse = Number(本月表底 - 上月表底);
    if (IUse < 0) {        
        throw new Error('出现错误,请检查录入数据的准确性! 错误原因: 本月表底 < 上月表底');
    }
    let currentFee = result[0];
    let FChargeStandard = parseFloat(currentFee.单价);//水费单价
    FOver =parseFloat(currentFee.超计划);//水费超计划单价
    let FPollutePlan =parseFloat(currentFee.排污费单价);//排污费单价
    let FPolluteOver =parseFloat(currentFee.排污费超额);//排污费超额
    let FFire =parseFloat(currentFee.防火费);//排污费超额
    let FCommission =parseFloat(手续费);//手续费
    let FOthers =parseFloat(其它);//其它
    let FRation = parseFloat(currentFee.定额);
    let FApplyWater = parseFloat(currentFee.原申请水量);
    let SSdate = currentFee.使用期限;  
    let SSDate1 = currentFee.用水日期;        
    //----分按月计算和按年计算两种情况----
    //---原申请水量不为0,按年计算
    //---定额不为0,按月计算
    //园林企业,应按年计算
    if (FApplyWater > 0) {   
        let result; 
        if(SSDate1 < '20030101') {
            let sqlSumAmount = `Select sum(用水量) as sss from 水费用水量查询 where (年+月>='200301') and  (扣水单位编号=:no)`;       
            result = await db.query(
                sqlSumAmount,
                { replacements: { no: currentFee.扣水单位编号}, type: db.QueryTypes.SELECT }
            );
        }else {
            let sqlSumAmount = `Select sum(用水量) as sss from 水费用水量查询 where (年+月>=:dd) and  (扣水单位编号=:no)`;       
            result = await db.query(
                sqlSumAmount,
                { replacements: {dd : SSDate1, no: currentFee.扣水单位编号}, type: db.QueryTypes.SELECT }
            );
        }        
       
        let tempSum = parseInt(result[0].sss); 
        //年用水量=+前几月用水和-本月计算出的用水量+最新计算出的用水量
        FYearWater = tempSum - parseInt(currentFee.用水量) + IUse;
        FRemainWater = FApplyWater - FYearWater;        
        if (FRemainWater<0) { 
            //有超额水费
            if (-FRemainWater >= IUse) {
                FOverWater = IUse;//超额水=用水量
                FPlanWater = 0;//计划用水    
            }else {
                FOverWater =- FRemainWater;//超额水=-剩余用水
                FPlanWater = IUse + FRemainWater;//计划用水=用水量+剩余用水(为负数)
            }
        }else {
            //无超额水费
            FOverWater = 0;//超额水='0'
            FPlanWater = IUse;//计划用水
        }
    }
    //普通企业,应按月计算
    if(FApplyWater === 0) {
        let sqlSumAmount = `Select sum(用水量) as sss from 水费用水量查询 where (扣水单位编号=:no) and (年=:y) and (月=:m)`;
        let result = await db.query(
            sqlSumAmount,
            { replacements: { no: currentFee.扣水单位编号, y : 年, m : 月}, type: db.QueryTypes.SELECT }
        );
        let tempSum = parseInt(result[0].sss);
        //定额 
        //20181202定额调整为按照当月实际天数计算
        //FApplyWater = (FRation * 30);
        FApplyWater = (FRation * moment(`${年}-${月}`, "YYYY-MM").daysInMonth());
        //月用水量=月用水和-本月计算出的用水量+最新计算出的用水量
        FYearWater = tempSum - parseInt(currentFee.用水量) + IUse;
        //剩余水量
        FRemainWater = FRation*30- FYearWater;
        if(年 + 月 > SSdate.slice(0, 6)) {
            FOverWater = IUse;//全部为超额水
            FPlanWater = 0;//计划用水
        }else {
            if (FRemainWater < 0) {//有超额水费
                if (-FRemainWater >= IUse) {
                    FOverWater = IUse;//超额水=用水量
                    FPlanWater = 0;//计划用水
                } else {
                    FOverWater =- FRemainWater;//超额水=-剩余用水
                    FPlanWater = IUse + FRemainWater;//计划用水=用水量+剩余用水(为负数)
                }          
            }else {//无超额水费
                FOverWater = 0;//超额水='0'
                FPlanWater = IUse;//计划用水
            }
        }
    }
    //计划水费
    FPlan = IUse * FChargeStandard;
    //超额水费
    //FOver:=FOverWater*(FOver-FchargeStandard)+FOverWater*(FPolluteOver-FPollutePlan);
    FOver = FOverWater * (FOver - FChargeStandard) + FOverWater * (FPolluteOver - FPollutePlan);
    //排污费
    //FPollute:=FPlanWater*FPollutePlan+FOverWater*FPolluteOver;
    FPollute = IUse * FPollutePlan;
    //排污费减免*****此处特殊考虑*****
    //FPollute = FPollute - parseFloat(减排污费);
    //应收水费------------------------------------------------------
    FCharge = FPlan+FOver+FFire+FCommission+FPollute+FOthers;
    //减免水费
    FMinusCharge = FMinusWater* FMinusStandard;
    //减免排污费
    FMinusPollute = FMinusWater* FPollutePlan;
    //实收水费
    FTrueCharge = FCharge-FMinusCharge-FMinusPollute-FMinusOthers;
    
    //老表水费(20181025新增，对应于一个月份内更换水表的情况)
    FTrueCharge = FTrueCharge + FOldCharge;
    result = {
        用水量 : IUse,
        计划水量 : FPlanWater,
        计划水费 : FPlan,
        超额水量 : FOverWater,
        超额水费 : FOver,
        防火费 : FFire,
        手续费 : FCommission,
        排污费 : parseFloat(FPollute).toFixed(2),
        应收水费 : parseFloat(FCharge).toFixed(2),
        年用水量 : FYearWater,
        剩余水量 : FRemainWater,
        申请水量 : FApplyWater === 0 ? FRation*30 : FApplyWater,
        减免水费 : FMinusCharge,
        减排污费 : FMinusPollute,
        实收水费 : parseFloat(FTrueCharge).toFixed(2)
    };
    return result;
}

module.exports.saveWaterFees =  saveWaterFees;

async function saveWaterFees(req, res) {
    let items = req.body || {};
    try {
        if(items && items.length > 0) {
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                let calItem = await calculateFee(item);
                item = Object.assign({}, item, calItem );
                await saveWaterFee(item); 
            }
        }            
        Helper.ResourceUpdated( res, {result : true, msg : 'ok'} );       
    }catch(ex) {
        Helper.InternalServerError( res, ex, {result : false, msg : ex.message } );
    }
}

module.exports.saveWaterFee =  save;

async function save(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveWaterFee(obj);
        if (result === '1') {
            Helper.ResourceUpdated( res, `编号${obj.编号}收费信息更新完成！` );
        }else {
            Helper.ResourceCreated( res, `编号${obj.编号}收费信息添加完成！` );
        }
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

async function saveWaterFee(obj) {
    let {
        编号, 年, 月, 户名, 上月表底, 本月表底, 用水量,
        计划水量, 计划水费, 超额水量, 超额水费, 防火费,
        手续费, 实收水费, 排污费, 其它, 欠费标志,
        操作员, 申请水量, 年用水量, 剩余水量, 减免水量,
        减免单价, 减免水费,  减其它, 减排污费, 应收水费
        } = obj;
    let sqlfee = `
    select 编号 from 水费基本表 where (编号=:no) and (年=:y) and (月=:m)           
    `;     
    let para = {
        //基本信息------------------------------
        a1 : 年,
        a2 : 月,
        a3 : 编号,
        a4 : 户名,
        //水费信息------------------------------
        a5 : parseInt(上月表底),
        a6 : parseInt(本月表底),
        a7 : parseInt(用水量),
        a8 : parseFloat(计划水量).toFixed(2),
        a9 : parseFloat(计划水费).toFixed(2),
        a10 : parseFloat(超额水量).toFixed(2),
        a11 : parseFloat(超额水费).toFixed(2),
        a12 : parseFloat(防火费).toFixed(2),
        a13 : parseFloat(手续费).toFixed(2),
        a14 : parseFloat(实收水费).toFixed(2),
        a15 : parseFloat(排污费).toFixed(2),
        a16 : parseFloat(其它).toFixed(2),
        a17 : 欠费标志 ? '2' : '1',
        a18 : nzhcn.toMoney(parseFloat(实收水费).toFixed(2)),//转换成大写
        a19 : convertLittle(parseFloat(实收水费).toFixed(2)),//转换成小写
        a20 : 操作员,
        a21 : dateFormat(new Date(), "yyyy-mm-dd"),
        a22 : parseFloat(申请水量).toFixed(2),
        a23 : parseFloat(年用水量).toFixed(2),
        a24 : parseFloat(剩余水量).toFixed(2),
        //扣水费
        a25 : parseFloat(减免水量).toFixed(2),
        a26 : parseFloat(减免单价).toFixed(2),
        a27 : parseFloat(减免水费).toFixed(2),
        a28 : parseFloat(减其它).toFixed(2),
        a29 : parseFloat(应收水费).toFixed(2),        
        a30 : parseFloat(减排污费).toFixed(2),
    };     
    let result = await db.query(
        sqlfee,
        { replacements: { no: 编号, y : 年, m : 月 }, type: db.QueryTypes.SELECT }
    ); 
    let rs; 
    if(result.length > 0) { //有重复记录,则修改当前记录
        let sqlUpdate = `
        update 水费基本表 set  户名=:a4,上月表底=:a5,本月表底=:a6,用水量=:a7,计划水量=:a8,计划水费=:a9,超额水量=:a10,超额水费=:a11,防火费=:a12,手续费=:a13,实收水费=:a14,排污费=:a15,其它=:a16, 
        欠费标志=:a17,大写=:a18,小写=:a19,操作员=:a20,操作时间=:a21,申请水量=:a22,年用水量=:a23,剩余水量=:a24,减免水量=:a25,减免单价=:a26,减免水费=:a27,减其它=:a28,应收水费=:a29,减排污费=:a30
            where (年=:a1) and (月=:a2) and (编号 =:a3)
        `;
        await db.query(
            sqlUpdate,
            { replacements: para, type: db.QueryTypes.UPDATE }
        ); 
        rs = "1";
    } else {
        let sqlInsert = `
        Insert Into 水费基本表 (年,月,编号,户名,上月表底,本月表底,用水量,计划水量,计划水费,超额水量,超额水费,防火费,手续费,实收水费,排污费,其它,欠费标志,大写,小写,操作员,操作时间,申请水量,年用水量,剩余水量,
            减免水量,减免单价,减免水费,减其它,应收水费,减排污费 )
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10,:a11,:a12,:a13,:a14,:a15,:a16,:a17,:a18,:a19,:a20,:a21,:a22,:a23,:a24,:a25,:a26,:a27,:a28,:a29,:a30 )                
        `;
        await db.query(
            sqlInsert,
            { replacements: para, type: db.QueryTypes.INSERT }
        ); 
        rs = "1";
    }    
    return rs;
}

function convertLittle(money) {
    let stemp;
    let result = '';
    try {
        BigNumber.config({ DECIMAL_PLACES: 2 })
        let bn = BigNumber(money);
        stemp = bn.multipliedBy(100).toString().split('');

    }catch(err) {
        throw new Error('钱数不是合法的浮点数,请检查!');
    }
    return '￥'+ stemp.join(' ');
}

module.exports.deleteWaterFee = deleteFee;

async function deleteFee(req, res) {
    let {num, year, month} = req.params;
    try {
        let result = await deleteWaterFee(num, year, month);
        Helper.ResourceFound( res, [result] );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {num,  year, month} );
    }
}

async function deleteWaterFee(num, year, month) {    
    let sqlDelete = `
    delete from 水费基本表
        where (年=:y) and (月=:m) and (编号=:no) 
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {no : num, y : year, m : month }, type: db.QueryTypes.SELECT }
    );
    return result;    
}

module.exports.CompletePayment =  CompletePayment;

async function CompletePayment(req, res) {
    let obj = req.body;
    try {
        let result = await CompletePaymentImpt(obj);
        Helper.ResourceFound( res, [result] );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function CompletePaymentImpt(obj) {
  let nums = getPropertyFromArray(obj, '编号')
  let year = obj[0].年;
  let month = obj[0].月;
  let sqlUpdate = `
  Update 水费基本表 set 欠费标志=:a2 where 
    (编号 in (${nums.join(',')})) 
    and (年=:year) and (月=:month)
  `;
  let result = await db.query(
      sqlUpdate,
      { replacements: { year, month, a2 : '1'} ,  type: db.QueryTypes.UPDATE }
  );
  return result;
}

module.exports.sendOverUsageSMS = sendOverUsageSMS;

async function sendOverUsageSMS(req, res) {
    let obj = req.body || {};
    try {         
        let result = await sendOverUsageSMSImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { obj} );
    }
}

async function sendOverUsageSMSImpt(obj) {
  let result = [];
  let numbers = await queryPersonAndNumber([obj.编号]);
  if(numbers && numbers.length > 0 && numbers[0].托收电话) {
    let rrr = await sendSMS(
      numbers[0].托收电话,
        `贵企业用本月份水量已超计划, 超计划水量为[${Math.abs(obj.超额水量)}]。`
        );
    result.push({...obj, desc : rrr.data});    
  }else {
      result.push({...obj, desc : 'error:Missing recipient'});
  }    
  return result;
}







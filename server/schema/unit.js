const Sequelize = require('sequelize');
const XlsxTemplate = require('xlsx-template');
const fs = require("fs");
const path = require("path");
const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toWord} = require('../modules/word_helper');
module.exports.queryUnitsByPinYin = queryUnitsabbrByPinYin;

async function queryUnitsabbrByPinYin(req, res) {
    let { pinyin } = req.params;
    try {
        let sqlStat1 = `
        Select * from 水费单位基本信息查询 where 用户拼音 like :py 
        `;
        let result = await db.query(
            sqlStat1,
            { replacements: { py : '%' + pinyin + '%' }, type: db.QueryTypes.SELECT }
        ); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, pinyin );
    }
}

module.exports.queryUnitByDownNum = queryUnitByDownNum;

async function queryUnitByDownNum(req, res) {
    let { num } = req.params;
    try {         
        let result = await queryUnitByDownNumImpt(num); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }
}

module.exports.queryUnitByDownNumImpt = queryUnitByDownNumImpt;

async function queryUnitByDownNumImpt(num) {
    let sqlStat1 = `
    Select 编号, 户名, 开户行行名 , 开户行行号, 银行代码, 帐号 , 
    帐户地址 ,组织代码,协议书号,业务种类,托收联系人 ,
    托收电话,联系人,电话,区号,用水日期,装表日期,使用期限,
    水贴费状态,水贴费,管径,申请水量,定额,装表费,节门状态,
    现场负责,装表地点,退续用手续,拆表日期,表损日期,换表日期,
    单位性质编号,用水形式编号,收费形式编号,抄表形式编号,
    防火标准编号,扣水单位编号,用户简称,用户拼音 
        from 水费单位信息 where 扣水单位编号=:num
    `;
    let result = await db.query(
        sqlStat1,
        { replacements: { num }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryUnitByNum = queryUnitByNum;

async function queryUnitByNum(req, res) {
    let { num } = req.params;
    try {         
        let result = await queryUnitByNumImpt(num); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }
}

module.exports.queryUnitByNumImpt = queryUnitByNumImpt;
async function queryUnitByNumImpt(num) {
    let sqlStat1 = `
    Select 编号, 户名, 开户行行名 , 开户行行号, 银行代码, 帐号 , 
    帐户地址 ,组织代码,协议书号,业务种类,托收联系人 ,
    托收电话,联系人,电话,区号,用水日期,装表日期,使用期限,
    水贴费状态,水贴费,管径,申请水量,定额,装表费,节门状态,
    现场负责,装表地点,退续用手续,拆表日期,表损日期,换表日期,
    单位性质编号,用水形式编号,收费形式编号,抄表形式编号,
    防火标准编号,扣水单位编号,用户简称,用户拼音 
        from 水费单位信息 where 编号=:num
    `;
    let result = await db.query(
        sqlStat1,
        { replacements: { num }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryUnitParas = paras;

async function paras(req, res) {   
    try {
        let result = await queryUnitParas();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryUnitParas() {
    let result = {};
    //显示银行、银行代码
    let sql1 = `
    SELECT  * from 水费字典银行代码 order by 使用次数 desc 
    `;
    let r1 = await db.query(
        sql1,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.banks = r1;
    // 显示管径
    let sql2 = `
    SELECT  distinct 管径 from 水费单位信息 
    `;
    let r2 = await db.query(
        sql2,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.pipes = r2;
    //费用标准
    let sql3 = `
    SELECT 区号,单价 from 水费字典费用标准
    `;
    let r3 = await db.query(
        sql3,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.chargestandard = r3;
    //单位性质
    let sql4 = `
    SELECT * from 水费字典单位性质 
    `;
    let r4 = await db.query(
        sql4,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.unitkinds = r4;
    //用水形式
    let sql5 = `
    SELECT * from 水费字典用水形式 
    `;
    let r5 = await db.query(
        sql5,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.usekinds = r5; 
    //抄表形式
    let sql6 = `
    SELECT * from 水费字典抄表形式 
    `;
    let r6 = await db.query(
        sql6,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.inputkinds = r6;
    //收费形式
    let sql7 = `
    SELECT * from 水费字典收费形式 
    `;
    let r7 = await db.query(
        sql7,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.chargekinds = r7;
    //防火标准
    let sql8 = `
    SELECT 防火标准编号,管径,防火费 from 水费字典防火标准
    `;
    let r8 = await db.query(
        sql8,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    result.firestandard = r8;
    return result;
}

module.exports.queryBankByName = queryBankByName;

async function queryBankByName(req, res) {
    let { name } = req.params;
    try {
        let sqlStat1 = `
        Select 开户行行号,银行代码,帐号位数,帐号相同位数,帐号相同代码,
        是否验证,业务种类 from 水费字典银行代码 
            where 开户行行名=:name
        `;
        let result = await db.query(
            sqlStat1,
            { replacements: { name }, type: db.QueryTypes.SELECT }
        ); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, name );
    }
}

module.exports.saveUnit =  save;

async function save(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveUnit(obj);
        if (result === '1') {
            Helper.ResourceUpdated( res, `编号${obj.编号}用水企业信息更新完成！` );
        }else {
            Helper.ResourceCreated( res, `编号${obj.编号}用水企业信息添加完成！` );
        }
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

async function saveUnit(obj) {
    let {
        编号,户名,开户行行名,帐号,联系人,电话,用水日期,
        装表日期,使用期限,水贴费状态,水贴费,管径,定额,申请水量,
        装表费,节门状态,现场负责,装表地点,退续用手续,拆表日期,
        表损日期,换表日期,区号,单位性质编号,用水形式编号,
        收费形式编号,抄表形式编号,防火标准编号,扣水单位编号,
        用户简称,用户拼音,组织代码,帐户地址,开户行行号,
        托收联系人,托收电话,协议书号,银行代码,业务种类        
        } = obj;
    let sqlfee = `
    select 编号 from 水费单位信息 where 编号 =:num          
    `;    
    let para = {
        //基本信息------------------------------
        a1 : 编号 ? 编号 : '',
        a2 : 户名 ? 户名 : '',
        a3 : 开户行行名? 开户行行名 : '',
        a4 : 帐号? 帐号 : '',
        a5 : 联系人? 联系人 : '',
        a6 : 电话? 电话 : '',
        //用水信息------------------------------        
        a7 : 用水日期? 用水日期 : '',
        a8 : 装表日期? 装表日期 : '',
        a9 : 使用期限? 使用期限 : '',
        a18 : 装表地点? 装表地点 : '',
        a16 : 节门状态? 节门状态 : '',
        a12 : 管径? parseInt(管径) : '0',
        a13 : 定额? parseFloat(定额).toFixed(2) : '0',
        a14 : 申请水量? parseFloat(申请水量).toFixed(2) : '0',
        //装表信息------------------------------        
        a10 : 水贴费状态? 水贴费状态 : '',
        a11 : parseFloat(水贴费).toFixed(2),
        a15 : parseFloat(装表费).toFixed(2),
        a17 : 现场负责? 现场负责 : '',
        a19 : 退续用手续? 退续用手续 : '',
        a20 : 拆表日期? 拆表日期 : '',
        a21 : 表损日期? 表损日期 : '',
        a22 : 换表日期? 换表日期 : '',
        //分类信息------------------------------
        a23 : 区号,
        a24 : (单位性质编号 && 单位性质编号.length > 0) ? 单位性质编号 : 区号,
        a25 : 用水形式编号,
        a26 : 收费形式编号,
        a27 : 抄表形式编号,
        a29 : 扣水单位编号? 扣水单位编号 : '',
        //新增加的
        a30 : 用户简称? 用户简称 : '',
        a31 : 用户拼音? 用户拼音 : '',
        a32 : 组织代码? 组织代码 : '',
        a33 : 帐户地址? 帐户地址 : '',
        a34 : 开户行行号? 开户行行号 : '',        
        a35 : 托收联系人? 托收联系人 : '',
        a36 : 托收电话? 托收电话 : '',
        a37 : 协议书号? 协议书号 : '',
        a38 : 银行代码? 银行代码 : '',        
        a39 : 业务种类? 业务种类 : '', 
        a28 : 防火标准编号? 防火标准编号 : '',        
    };
    let result = await db.query(
        sqlfee,
        { replacements: { num: 编号}, type: db.QueryTypes.SELECT }
    ); 
    let rs; 
    if(result.length > 0) { //有重复记录,则修改当前记录
        let sqlUpdate = `
        update 水费单位信息 set  户名=:a2,开户行行名=:a3,帐号=:a4,联系人=:a5,电话=:a6,用水日期=:a7,装表日期=:a8,使用期限=:a9,水贴费状态=:a10,水贴费=:a11,管径=:a12,定额=:a13,申请水量=:a14, 
        装表费=:a15,节门状态=:a16,现场负责=:a17,装表地点=:a18,退续用手续=:a19,拆表日期=:a20,表损日期=:a21,换表日期=:a22,
        区号=:a23,单位性质编号=:a24,用水形式编号=:a25,收费形式编号=:a26,抄表形式编号=:a27,防火标准编号=:a28,扣水单位编号=:a29,
        用户简称=:a30,用户拼音=:a31,组织代码=:a32,帐户地址=:a33,开户行行号=:a34,托收联系人=:a35,托收电话=:a36,协议书号=:a37,银行代码=:a38,业务种类=:a39    
            where 编号 =:a1 
        `;
        await db.query(
            sqlUpdate,
            { replacements: para, type: db.QueryTypes.UPDATE }
        ); 
        rs = "1";
    } else {
        let sqlInsert = `
        Insert Into 水费单位信息 (编号,户名,开户行行名,帐号,联系人,电话,用水日期,装表日期,使用期限,水贴费状态,水贴费,管径,定额,申请水量,
            装表费,节门状态,现场负责,装表地点,退续用手续,拆表日期,表损日期,换表日期,区号,单位性质编号,用水形式编号,收费形式编号,抄表形式编号,防火标准编号,扣水单位编号,
            用户简称,用户拼音,组织代码,帐户地址,开户行行号,托收联系人,托收电话,协议书号,银行代码,业务种类 )
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,     :a10,  :a11, :a12,:a13,    :a14,
                :a15,    :a16,    :a17,    :a18,      :a19,     :a20,   :a21,   :a22,  :a23,       :a24,       :a25,          :a26,        :a27,        :a28,        :a29,    
                :a30,       :a31,   :a32,    :a33,    :a34,        :a35,     :a36,   :a37,     :a38,  :a39 )      
        `;
        await db.query(
            sqlInsert,
            { replacements: para, type: db.QueryTypes.INSERT }
        ); 
        rs = "1";
    } 
    if(开户行行号 && 开户行行号.length > 0) {
        let sqlBank = `
        Select 开户行行号 from 水费字典银行代码 where 开户行行号=:code
        `;
        let banks = await db.query(
            sqlBank,
            { replacements: {code : 开户行行号}, type: db.QueryTypes.SELECT }
        ); 
        if(banks.length === 0) {
            let sqlInsertBank = `
            insert into 水费字典银行代码 
                (开户行行号,开户行行名,银行代码,使用次数,业务种类,
                帐号位数,帐号相同位数,是否验证,帐号相同代码) 
                values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9)
            `;
            await db.query(
                sqlBank,
                { 
                    replacements: {
                        开户行行号,
                        开户行行名,
                        银行代码,
                        使用次数 : 1,
                        业务种类,
                        帐号位数 : 帐号.length,                        
                        帐号相同位数 : 0,
                        是否验证 : 'Y',
                        帐号相同代码 : 帐号
                    }, 
                    type: db.QueryTypes.INSERT }
            ); 
        }
    }   
    return rs;
}

module.exports.createUnitNum = createUnitNum;

async function createUnitNum(req, res) {
    let { usekind } = req.params;
    try {
        let result = await createUnitNumImpt(usekind);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, usekind );
    }
}

async function createUnitNumImpt(usekind){
    let rr = {};
    let sqlStat1 = `
        Select max(编号) as num from 水费单位信息 where            
        `;
        if (usekind === '0') {
            sqlStat1 += ` 编号<'2000'`;
        }else{
            sqlStat1 += ` 编号>'2000'`;
        }
        let result = await db.query(
            sqlStat1,
            { replacements: {}, type: db.QueryTypes.SELECT }
        ); 
        let int = parseInt(result[0].num) + 1;
        let str = int.toString();
        if(str.length === 3) {
            str  = '0' + str;
        }
        let uu;
        if(str > '2000') {
            uu = '2';
        }else {
            uu = '0';
        }
    return    rr = {编号 : str, 用水形式编号 : uu};
}

module.exports.MoveUnitPosition = MoveUnitPosition;

async function MoveUnitPosition(req, res, direction) {
    let {num} = req.params;
    let sqlUnit;    
    try {         
        if(direction === 'prior') {
            sqlUnit = `
            Select 编号 from 水费单位信息 where (编号<:no) 
            `;  
        }else {
            sqlUnit = `
            Select 编号 from 水费单位信息 where (编号>:no) 
            `;  
        }
        if(direction === 'prior') {
            sqlUnit += ' Order by 编号 desc';
        }else {
            sqlUnit += ' Order by 编号';
        }    
        let result = await db.query(
            sqlUnit,
            { replacements: { no: num }, type: db.QueryTypes.SELECT }
        )
        if(result.length > 0) {
            let r = await queryUnitByNumImpt(result[0].编号);
            Helper.ResourceFound( res, r );
        }else {
            Helper.ResourceNotFound(res, {}, '没有发现记录')
        }      
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }    
}

module.exports.searchUnits = search;

async function search(req, res) {
    let obj = req.body || {};
    try {
        let result = await searchUnits(obj);
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

async function searchUnits(obj){
    let sql = `
    SELECT A.编号,A.户名,A.装表地点,A.开户行行名,A.帐号,A.联系人,A.电话,A.用水日期,A.使用期限,A.装表日期,A.水贴费状态,A.水贴费,A.管径,D.单位性质,
        B.用水形式, E.抄表形式, A.区号, F.单价, C.收费形式, A.申请水量, A.定额, A.节门状态,A.扣水单位编号,A.装表费,
        A.用户简称,A.用户拼音,A.组织代码,A.帐户地址,A.托收联系人,A.托收电话,A.防火标准编号,A.开户行行号,A.银行代码,A.协议书号,A.业务种类,A.拆表日期,A.退续用手续,A.现场负责,A.表损日期,A.换表日期
        FROM 水费字典用水形式 B INNER JOIN 水费单位信息 A ON B.用水形式编号 = A.用水形式编号 INNER JOIN
        水费字典收费形式 C ON A.收费形式编号 = C.收费形式编号 INNER JOIN 水费字典单位性质 D ON A.单位性质编号 = D.单位性质编号 INNER JOIN 水费字典抄表形式 E ON A.抄表形式编号 = E.抄表形式编号 INNER JOIN
        水费字典费用标准 F ON A.区号 = F.区号  
    `;
    let params = {};
    let where = [];
    generalSqlParams(obj, '编号');
    generalSqlParams(obj, '户名');

    buildWhereSingle(obj, '编号', ` (A.编号 like :num) `, 'num', params, where); 
    buildWhereSingle(obj, '户名', ` (A.户名 like :name) `, 'name', params, where); 
    buildWhereSingle(obj, '用水形式编号', ` (A.用水形式编号= :usekind) `, 'usekind', params, where); 
    buildWhereSingle(obj, '抄表形式编号', ` (A.抄表形式编号= :inputkind) `, 'inputkind', params, where);
    buildWhereSingle(obj, '单位性质编号', ` (A.单位性质编号= :unitkind) `, 'unitkind', params, where); 
    buildWhereSingle(obj, '区号', ` (A.区号= :chargestandard) `, 'chargestandard', params, where); 
    buildWhereSingle(obj, '开户行行名', ` (A.开户行行名= :bankname) `, 'bankname', params, where); 
    buildWhereSingle(obj, '收费形式编号', ` (A.收费形式编号= :chargekind) `, 'chargekind', params, where);
    buildWhereSingle(obj, '用水日期', ` (substring(A.用水日期,1,6)= :usedd) `, 'usedd', params, where);
    buildWhereSingle(obj, '装表日期', ` (substring(A.装表日期,1,6)= :setupdd) `, 'setupdd', params, where);
    buildWhereSingle(obj, '续用水', ` (substring(A.装表日期,1,6)<>substring(A.用水日期,1,6)) `, null, params, where);
    buildWhereSingle(obj, '签合同单位', ` (A.编号=A.扣水单位编号) `, null, params, where);   
    where.push(` (A.节门状态='开') `)

    let ww = where.join(' and ');
    sql += ww.length > 2 ? ' where ' +  ww : ''; 
    let result = await db.query(
        sql,
        { replacements: params, type: db.QueryTypes.SELECT }
    ); 
    return result;  
} 

module.exports.unitsToExcel = toExcel;

async function toExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await unitsToExcel(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function unitsToExcel(obj) {
    let items = await searchUnits(obj);       
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', '单位.xlsx'));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    let sheetNumber = 'Sheet1';
    // Set up some placeholder values matching the placeholders in the template
    let values = {        
        units: items
    };

    // Perform substitution
    template.substitute(sheetNumber, values);
    // Get binary data
    return template.generate({type: 'base64'});
}

module.exports.unitsToWord = unitsToWord;

async function unitsToWord(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await unitsToWordImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]);
        res.end( new Buffer(wb.buf, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function unitsToWordImpt(obj) {
  let items = await searchUnits(obj); 
  Helper.ConvertNullToZeroString(items)
  let values = {items};
  let result = toWord('unit', values, false);
  return result;
}

module.exports.queryAllowanceByNum = queryAllowance;

async function queryAllowance(req, res) {
    let { num } = req.params;
    try {         
        let result = await queryAllowanceByNum(num);
        Helper.ConvertNullToZeroString(result);  
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }
}

async function queryAllowanceByNum(num) {
    let sql1 = `
    Select 编号,户名,装表地点 from 水费单位信息 where 编号=:num
    `;
    let result = {};
    let result1 = await db.query(
        sql1,
        { replacements: { num }, type: db.QueryTypes.SELECT }
    );
    if(result1  && result1.length > 0) {
        let sql2 = `
        Select * from 水费贴费表 where 编号=:num
        `;
        let result2 = await db.query(
            sql2,
            { replacements: { num }, type: db.QueryTypes.SELECT }
        );
        if(result2  && result2.length > 0) {
            result = {
                ...result1[0],
                ...result2[0]                 
            }
        }else {
            result = result1[0];
        }       
    }
    return result;
}

module.exports.saveAllowance =  saveAllowance;

async function saveAllowance(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveAllowanceImpt(obj);
        if (result === '1') {
            Helper.ResourceUpdated( res, `编号${obj.编号}用水企业信息更新完成！` );
        }else {
            Helper.ResourceCreated( res, `编号${obj.编号}用水企业信息添加完成！` );
        }
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

async function saveAllowanceImpt(obj) {
    let {
        编号,交费日期,水贴费,贴费状态,增容日期1,增容费1,
        增容日期2,增容费2,增容日期3,增容费3,增容日期4,
        增容费4,增容日期5,增容费5,合计,申请容量,增加容量1,
        增加容量2,增加容量3,增加容量4,增加容量5,容量合计,
        贴费备注,备注1,备注2,备注3,备注4,备注5        
        } = obj;
    let sqlallowance = `
    Select * from 水费贴费表 where 编号=:num          
    `;    
    let para = {
        //基本信息------------------------------
        a1 : 编号 ? 编号 : '',
        a2 : 交费日期 ? 交费日期 : '',
        a3 : parseFloat(水贴费).toFixed(2),
        a4 : 贴费状态? 贴费状态 : '',
        a5 : 增容日期1? 增容日期1 : '',
        a6 : parseFloat(增容费1).toFixed(2),           
        a7 : 增容日期2? 增容日期2 : '',
        a8 : parseFloat(增容费2).toFixed(2), 
        a9 : 增容日期3? 增容日期3 : '',        
        a10 : parseFloat(增容费3).toFixed(2), 
        a11 : 增容日期4? 增容日期4 : '',
        a12 : parseFloat(增容费4).toFixed(2), 
        a13 : 增容日期5? 增容日期5 : '',
        a14 : parseFloat(增容费5).toFixed(2), 
        a15 : parseFloat(合计).toFixed(2), 
        a16 : parseFloat(申请容量).toFixed(2),
        a17 : parseFloat(增加容量1).toFixed(2),     
        a18 : parseFloat(增加容量2).toFixed(2),
        a19 : parseFloat(增加容量3).toFixed(2),
        a20 : parseFloat(增加容量4).toFixed(2),
        a21 : parseFloat(增加容量5).toFixed(2),
        a22 : parseFloat(容量合计).toFixed(2),
        a23 : 贴费备注? 贴费备注 : '',        
        a24 : 备注1? 备注1 : '',
        a25 : 备注2? 备注2 : '',
        a26 : 备注3? 备注3 : '',
        a27 : 备注4? 备注4 : '',
        a28 : 备注5? 备注5 : ''
    };
    let result = await db.query(
        sqlallowance,
        { replacements: { num: 编号}, type: db.QueryTypes.SELECT }
    ); 
    let rs; 
    if(result.length > 0) { //有重复记录,则修改当前记录
        let sqlUpdate = `
        Update 水费贴费表 set 交费日期=:a2,水贴费=:a3,贴费状态=:a4,  
        增容日期1=:a5,增容费1=:a6,增容日期2=:a7,增容费2=:a8,增容日期3=:a9,增容费3=:a10,
        增容日期4=:a11,增容费4=:a12,增容日期5=:a13,增容费5=:a14,合计=:a15,
        申请容量=:a16,增加容量1=:a17,增加容量2=:a18,增加容量3=:a19,增加容量4=:a20,增加容量5=:a21,容量合计=:a22,    
        贴费备注=:a23,备注1=:a24,备注2=:a25,备注3=:a26,备注4=:a27,备注5=:a28
        where 编号 =:a1 
        `;
        await db.query(
            sqlUpdate,
            { replacements: para, type: db.QueryTypes.UPDATE }
        ); 
        rs = "1";
    } else {
        let sqlInsert = `
        Insert into 水费贴费表 (编号,交费日期,水贴费,贴费状态,增容日期1,增容费1,增容日期2,增容费2,增容日期3,增容费3,增容日期4,增容费4,增容日期5,增容费5,合计, 
            申请容量,增加容量1,增加容量2,增加容量3,增加容量4,增加容量5,容量合计,
            贴费备注,备注1,备注2,备注3,备注4,备注5 )
            values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10,:a11,:a12,:a13,:a14,:a15,:a16,:a17,:a18,:a19,:a20,:a21,:a22,:a23,:a24,:a25,:a26,:a27,:a28)   
        `;
        await db.query(
            sqlInsert,
            { replacements: para, type: db.QueryTypes.INSERT }
        ); 
        rs = "1";
    } 
    let sqlUnitUpdate = `
    Update 水费单位信息 set 拆表日期=:dd,水贴费=:allowance,水贴费状态=:status where 编号=:num
    `;  
    await db.query(
        sqlUnitUpdate,
        { replacements: {
            dd : 交费日期,
            allowance : 水贴费,
            status : 贴费状态,
            num : 编号
        }, type: db.QueryTypes.INSERT }
    );      
    return rs;
}

module.exports.MoveAllowancePosition = MoveAllowancePosition;

async function MoveAllowancePosition(req, res, direction) {
    let {num} = req.params;
    let sqlUnit;    
    try {         
        if(direction === 'prior') {
            sqlUnit = `
            Select top 1 编号 from 水费单位信息 where (编号<:no) 
            `;  
        }else {
            sqlUnit = `
            Select top 1 编号 from 水费单位信息 where (编号>:no) 
            `;  
        }
        if(direction === 'prior') {
            sqlUnit += ' Order by 编号 desc';
        }else {
            sqlUnit += ' Order by 编号';
        }    
        let result = await db.query(
            sqlUnit,
            { replacements: { no: num }, type: db.QueryTypes.SELECT }
        )
        if(result.length > 0) {
            let r = await queryAllowanceByNum(result[0].编号);
            Helper.ConvertNullToZeroString(r);  
            Helper.ResourceFound( res, r );
        }else {
            Helper.ResourceNotFound(res, {}, '没有发现记录')
        }      
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }    
}

module.exports.saveCollection =  saveCollection;

async function saveCollection(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveCollectionImpt(obj);
        if (result === '1') {
            Helper.ResourceUpdated( res, `编号${obj.编号}用水企业托收信息更新完成！` );
        }else {
            Helper.ResourceCreated( res, `编号${obj.编号}用水企业托收信息添加完成！` );
        }
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

async function saveCollectionImpt(obj) {
    let {
        编号,户名,开户行行名,帐号,联系人,电话,
        单位性质编号, 扣水单位编号,
        用户简称,用户拼音,组织代码,帐户地址,开户行行号,
        托收联系人,托收电话,协议书号,银行代码,业务种类        
        } = obj;
    let sqlfee = `
    select 编号 from 水费单位信息 where 编号 =:num          
    `;    
    let para = {
        //基本信息------------------------------
        a1 : 编号 ? 编号 : '',
        a2 : 户名 ? 户名 : '',
        a3 : 开户行行名? 开户行行名 : '',
        a4 : 帐号? 帐号 : '',
        a5 : 联系人? 联系人 : '',
        a6 : 电话? 电话 : '',
        a24 : (单位性质编号 && 单位性质编号.length > 0) ? 单位性质编号 : '',        
        a29 : 扣水单位编号? 扣水单位编号 : '',
        //新增加的
        a30 : 用户简称? 用户简称 : '',
        a31 : 用户拼音? 用户拼音 : '',
        a32 : 组织代码? 组织代码 : '',
        a33 : 帐户地址? 帐户地址 : '',
        a34 : 开户行行号? 开户行行号 : '',        
        a35 : 托收联系人? 托收联系人 : '',
        a36 : 托收电话? 托收电话 : '',
        a37 : 协议书号? 协议书号 : '',
        a38 : 银行代码? 银行代码 : '',        
        a39 : 业务种类? 业务种类 : ''
    };
    let result = await db.query(
        sqlfee,
        { replacements: { num: 编号}, type: db.QueryTypes.SELECT }
    ); 
    let rs; 
    if(result.length > 0) { //有重复记录,则修改当前记录
        let sqlUpdate = `
        update 水费单位信息 set  户名=:a2,开户行行名=:a3,帐号=:a4,联系人=:a5,电话=:a6,
        单位性质编号=:a24, 
        用户简称=:a30,用户拼音=:a31,组织代码=:a32,帐户地址=:a33,开户行行号=:a34,托收联系人=:a35,托收电话=:a36,协议书号=:a37,银行代码=:a38,业务种类=:a39   
            where 扣水单位编号 =:a1 
        `;
        await db.query(
            sqlUpdate,
            { replacements: para, type: db.QueryTypes.UPDATE }
        ); 
        rs = "1";
    } else {
        let sqlInsert = `
        Insert Into 水费单位信息 (编号,户名,开户行行名,帐号,联系人,电话,用水日期,装表日期,使用期限,水贴费状态,水贴费,管径,定额,申请水量,
            装表费,节门状态,现场负责,装表地点,退续用手续,拆表日期,表损日期,换表日期,区号,单位性质编号,用水形式编号,收费形式编号,抄表形式编号,防火标准编号,扣水单位编号,
            用户简称,用户拼音,组织代码,帐户地址,开户行行号,托收联系人,托收电话,协议书号,银行代码,业务种类 )
            Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,     :a10,  :a11, :a12,:a13,    :a14,
                :a15,    :a16,    :a17,    :a18,      :a19,     :a20,   :a21,   :a22,  :a23,       :a24,       :a25,          :a26,        :a27,        :a28,        :a29,    
                :a30,       :a31,   :a32,    :a33,    :a34,        :a35,     :a36,   :a37,     :a38,  :a39 )      
        `;
        await db.query(
            sqlInsert,
            { replacements: para, type: db.QueryTypes.INSERT }
        ); 
        rs = "1";
    } 
    if(开户行行号 && 开户行行号.length > 0) {
        let sqlBank = `
        Select 开户行行号 from 水费字典银行代码 where 开户行行号=:code
        `;
        let banks = await db.query(
            sqlBank,
            { replacements: {code : 开户行行号}, type: db.QueryTypes.SELECT }
        ); 
        if(banks.length === 0) {
            let sqlInsertBank = `
            insert into 水费字典银行代码 
                (开户行行号,开户行行名,银行代码,使用次数,业务种类,
                帐号位数,帐号相同位数,是否验证,帐号相同代码) 
                values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9)
            `;
            await db.query(
                sqlBank,
                { 
                    replacements: {
                        开户行行号,
                        开户行行名,
                        银行代码,
                        使用次数 : 1,
                        业务种类,
                        帐号位数 : 帐号.length,                        
                        帐号相同位数 : 0,
                        是否验证 : 'Y',
                        帐号相同代码 : 帐号
                    }, 
                    type: db.QueryTypes.INSERT }
            ); 
        }
        let sqlInsertUpdate = `
        update 水费字典银行代码 set 使用次数=使用次数+1 where 开户行行号=:code
            `;
        await db.query(
            sqlBank,
            { replacements: {code : 开户行行号}, type: db.QueryTypes.UPDATE }
        ); 

    }   
    return rs;
}

module.exports.MoveCollectionPosition = MoveCollectionPosition;

async function MoveCollectionPosition(req, res, direction) {
    let {num, cb} = req.params;
    let sqlUnit;    
    try {         
        if(direction === 'prior') {
            sqlUnit = `
            Select top 1 编号 from 水费单位信息 where (编号<:no) and 扣水单位编号=编号
            `;  
        }else {
            sqlUnit = `
            Select top 1 编号 from 水费单位信息 where (编号>:no)  and 扣水单位编号=编号
            `;  
        }
        if(cb === 'true') {
            sqlUnit += ` and 收费形式编号='1' `;
        }
        if(direction === 'prior') {
            sqlUnit += ' Order by 编号 desc';
        }else {
            sqlUnit += ' Order by 编号';
        }    
        let result = await db.query(
            sqlUnit,
            { replacements: { no: num }, type: db.QueryTypes.SELECT }
        )
        if(result.length > 0) {
            let r = await queryUnitByNumImpt(result[0].编号);
            Helper.ResourceFound( res, r );
        }else {
            Helper.ResourceNotFound(res, {}, '没有发现记录')
        }      
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }    
}

module.exports.queryUnitChangeName = queryUnitChangeName;

async function queryUnitChangeName(req, res) {
    let { num, year, month } = req.params;
    try {         
        let result = await queryUnitChangeNameImpt(num, year, month); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }
}

async function queryUnitChangeNameImpt(num, year, month) {
    let sqlUnit = `
    Select 编号, 户名, 开户行行名 ,帐号 , 用水形式编号,
    联系人,电话,用水日期,装表日期,使用期限,
    装表地点, 管径,申请水量,定额,扣水单位编号,节门状态
        from 水费单位信息 where 编号=:num
    `;
    let units = await db.query(
        sqlUnit,
        { replacements: { num }, type: db.QueryTypes.SELECT }
    );
    let sqlFee = `
    Select 本月表底 from 水费基本表 where 
        编号=:num and 年=:year and 月=:month
    `;
    let fees = await db.query(
        sqlFee,
        { replacements: { num, year, month }, type: db.QueryTypes.SELECT }
    );
    if (fees.length === 0) {
        sqlFee = `
        Select 本月表底 from 水费基本表 where 
            编号=:num and 年+月<:dd
            order by 年,月 desc
        `;
        fees = await db.query(
            sqlFee,
            { replacements: { num, dd: year + month }, type: db.QueryTypes.SELECT }
        );

    }
    let result = {};
    if (units.length > 0 && fees.length > 0) {
        result = {...units[0], ...fees[0]}
    }
    return result;
}

module.exports.createChangeNameNum = createChangeNameNum;

async function createChangeNameNum(req, res) {
    let { num, usekind } = req.params;
    try {         
        let result = await createChangeNameNumImpt(num, usekind); 
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, num );
    }
}

async function createChangeNameNumImpt(num, usekind) {
    let result = {};
    let sqlUnit = `
    Select 过户编号 from 水费过户表 where 老户编号 =:num
    `;
    let units = await db.query(
        sqlUnit,
        { replacements: { num }, type: db.QueryTypes.SELECT }
    );
    if (units.length > 0) {
        result.desc = '该单位已经过户，不能重复过户！';
    }else {
        result = await createUnitNumImpt(usekind);
    }
    return result;
}

module.exports.saveUnitChange =  saveUnitChange;

async function saveUnitChange(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveUnitChangeImpt(obj);        
        Helper.ResourceUpdated( res, result );
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}

//保存分四步
    //1、生成过户信息
    //2、更改老单位信息
    //3、保存新单位信息
    //4、生成水费信息    
async function saveUnitChangeImpt(obj) {
    let {
        过户日期, 编号, 编号n, 过户理由, 沿用原指标,
        备注, 户名n, 开户行行名n, 帐号n, 电话n, 联系人n,
        用水日期n, 装表日期n, 使用期限n, 管径n, 定额n, 申请水量n,
        节门状态n, 装表地点n, 扣水单位编号n, 本月表底n        
        } = obj;
    let rs;
    //1、生成过户信息
    //生成过户编号
    let sqlUnit = `
    Select 过户编号 from 水费过户表 where 过户日期 =:dd order by 过户编号 desc
    `;
    let items = await db.query(
        sqlUnit,
        { replacements: { dd : 过户日期 }, type: db.QueryTypes.SELECT }
    );
    let Stemp;
    if(items.length === 0) {
        Stemp = 过户日期 + '01';
    }else {
        Stemp = (parseInt(items[0].过户编号) + 1).toString()
    } 
    let insertParameters = {
        a1 : Stemp, a2 : 过户日期, a3 : 编号, a4 : 编号n, 
        a5 : 过户理由 ? 过户理由 : '',
        a6 : 沿用原指标 === 'true' ? 'T' : 'F',  a7 : 备注   
    };
    let sqlChangeInsert = `
    Insert Into 水费过户表 (过户编号,过户日期,老户编号,新户编号,过户理由,沿用原指标,备注) 
    Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7)
    `;  
    await db.query(
        sqlChangeInsert,
        { 
            replacements: insertParameters, 
            type: db.QueryTypes.INSERT 
        }
    );  
    //2、更改老单位信息 
    let updateOldUnit = `update 水费单位信息 set 节门状态='闭' where 编号 =:no`;
    await db.query(
        updateOldUnit,
        { 
            replacements: {no : 编号}, 
            type: db.QueryTypes.UPDATE 
        }
    );
    //3、保存新单位信息
    let insertNewUnit = `
    Insert Into 水费单位信息 (编号,户名,开户行行名,帐号,联系人,电话,用水日期,装表日期,使用期限,水贴费状态,水贴费,管径,定额,申请水量,
        装表费,节门状态,现场负责,装表地点,退续用手续,拆表日期,表损日期,换表日期,区号,单位性质编号,用水形式编号,收费形式编号,抄表形式编号,防火标准编号,扣水单位编号 )
        Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10,:a11,:a12,:a13,:a14,:a15,:a16,:a17,:a18,:a19,:a20,:a21,:a22,:a23,:a24,:a25,:a26,:a27,:a28,:a29 )
    `; 
    let newUnitParameters = {
        a1 : 编号n,
        a2 : 户名n,
        a3 : 开户行行名n ? 开户行行名n : '',
        a4 : 帐号n ? 帐号n : '',
        a5 : 联系人n ? 联系人n : '',
        a6 : 电话n ? 电话n : '',
        a7 : 用水日期n,
        a8 : 装表日期n,
        a9 : 使用期限n, 
        a10 : '',
        a11 : 0,
        a12 : 管径n,
        a13 : 定额n,
        a14 : 申请水量n,
        a15 : 0,
        a16 : 节门状态n,
        a17 : '',
        a18 : 装表地点n,
        a19 : '',
        a20 : '',
        a21 : '',
        a22 : '',
        a23 : '1',
        a24 : '1',
        a25 : '1',
        a26 : '1',
        a27 : '1',
        a28 : '1',
        a29 : 扣水单位编号n
    };
    await db.query(
        insertNewUnit,
        { 
            replacements: newUnitParameters, 
            type: db.QueryTypes.INSERT 
        }
    ); 
    //4、生成水费信息 
    let insertFee = `
    Insert Into 水费基本表 (年,月,编号,户名,上月表底,本月表底,用水量,实收水费,欠费标志,大写,小写,操作员,操作时间,应收水费) 
    Values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10,:a11,:a12,:a13,:a14 )
    `; 
    let feeParameters = {
        a1 : 过户日期.slice(0, 4),
        a2 : 过户日期.slice(4),
        a3 : 编号n,
        a4 : 户名n,
        a5 : parseInt(本月表底n),
        a6 : parseInt(本月表底n),
        a7 : 0,
        a8 : 0,
        a9 : '1',
        a10 : '零元',
        a11 : '￥0 0 0',
        a12 : '管理员',
        a13 : 过户日期,
        a14 : 0
    };
    await db.query(
        insertFee,
        { 
            replacements: feeParameters, 
            type: db.QueryTypes.INSERT 
        }
    );
    rs = '过户保存成功！'
    return rs;
}

module.exports.searchUnitChange = searchUnitChange;

async function searchUnitChange(req, res) {
    let { start, end } = req.params;
    try {
        let result = await searchUnitChangeImpt(start, end );
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { start, end } );
    }
}

async function searchUnitChangeImpt(start, end ){
    let sql = `
    SELECT * from 水费过户查询
        where 过户日期>=:start and 过户日期<=:end
        Order by  老户编号 
    `;    
    let result = await db.query(
        sql,
        { replacements: {start, end}, type: db.QueryTypes.SELECT }
    ); 
    return result;  
}

module.exports.changeToExcel = changeToExcel;

async function changeToExcel(req, res) {
    let { start, end } = req.params;
    try {       
        let wb = await changeToExcelImpt(start, end);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function changeToExcelImpt(start, end) {
    let items = await searchUnitChangeImpt(start, end);       
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', '过户.xlsx'));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    let sheetNumber = 'sheet1';
    // Set up some placeholder values matching the placeholders in the template
    let values = {        
        change: items
    };

    // Perform substitution
    template.substitute(sheetNumber, values);
    // Get binary data
    return template.generate({type: 'base64'});
}

module.exports.checkError = checkError;

async function checkError(req, res) {
    let obj = req.body || {};
    try {
        let result = await checkErrorImpt(obj);        
        Helper.ResourceUpdated( res, result );
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function checkErrorImpt(obj) {
    let today = obj.date;
    let year = today.slice(0, 4);
    let month = today.slice(4);
    let para1Year = '';
    let para1Month = '';
    let para1Date = obj.date1;
    let para2Year = '';
    let para2Month = '';
    let para2Date = obj.date2;
    if(para1Date && para1Date.length > 0) {
        para1Year = para1Date.slice(0, 4);
        para1Month = para1Date.slice(4);
    }
    if(para2Date && para2Date.length > 0) {
        para2Year = para2Date.slice(0, 4);
        para2Month = para2Date.slice(4);
    }
    let sqlDelete = `
    Delete from 水费误差分析 where 年=:year and 月=:month 
    `;    
    await db.query(
        sqlDelete,
        { 
            replacements: {year, month}, 
            type: db.QueryTypes.DELETE }
    );
    let sqlSelectFee = `
    Select 编号 from 水费基本表 where 年=:year and 月=:month order by 编号
    `;
    let fees = await db.query(
        sqlSelectFee,
        { 
            replacements: {year, month}, 
            type: db.QueryTypes.SELECT }
    );
    for(let i = 0; i < fees.length; i++) {
        let fee = fees[i];
        
        if(obj.para1) {  //大于
            let sqlSelectUsage = `
            Select 用水量 from 水费基本表 where ((年=:year and 月=:month) or ( 年=:year1 and 月=:month1)) and (编号=:no) 
            `;
            let usages = await db.query(
                sqlSelectUsage,
                { 
                    replacements: {year, month,year1 : para1Year, month1 : para1Month, no : fee.编号 }, 
                    type: db.QueryTypes.SELECT }
            );
            let WaterLast = 0;
            let WaterNow = 0;
            if(usages.length === 2) {
                WaterLast = parseInt(usages[0].用水量);  //上月数据        
                WaterNow = parseInt(usages[1].用水量);   //本月数据
            }
            
            if ((WaterNow > WaterLast * ( 1 + parseFloat(obj.proportion1))) && (WaterLast != 0))  { 
                //不合理的数据，需要计入数据库
                let sqlInsert = `
                Insert into  水费误差分析 values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10 ) 
                `;
                await db.query(
                    sqlInsert,
                    { 
                        replacements: {
                            a1 : year,
                            a2 : month,
                            a3 : (i + 1).toString(),
                            a4 : fee.编号,
                            a5 : WaterNow,
                            a6 : para1Year,
                            a7 : para1Month,
                            a8 : "超过比例 " + obj.proportion1,
                            a9 : WaterLast,
                            a10 : ''
                        }, 
                        type: db.QueryTypes.INSERT }
                );    
            }
        }
        if(obj.para2) {  //小于
            let sqlSelectUsage = `
            Select 用水量 from 水费基本表 where ((年=:year and 月=:month) or ( 年=:year1 and 月=:month1)) and (编号=:no) 
            `;
            let usages = await db.query(
                sqlSelectUsage,
                { 
                    replacements: {year, month,year1 : para2Year, month1 : para2Month, no : fee.编号 }, 
                    type: db.QueryTypes.SELECT }
            );
            let WaterLast = 0;
            let WaterNow = 0;
            if(usages.length === 2) {
                WaterLast = parseInt(usages[0].用水量);  //上月数据        
                WaterNow = parseInt(usages[1].用水量);   //本月数据
            }
            if ((WaterNow < WaterLast * ( 1 - parseFloat(obj.proportion2))) && (WaterLast != 0))  { 
                //不合理的数据，需要计入数据库
                let sqlInsert = `
                Insert into  水费误差分析 values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10 ) 
                `;
                await db.query(
                    sqlInsert,
                    { 
                        replacements: {
                            a1 : year,
                            a2 : month,
                            a3 : (i + 1).toString(),
                            a4 : fee.编号,
                            a5 : WaterNow,
                            a6 : para1Year,
                            a7 : para1Month,
                            a8 : "小于比例 " + obj.proportion1,
                            a9 : WaterLast,
                            a10 : ''
                        }, 
                        type: db.QueryTypes.INSERT }
                );    
            }
        }
    }
    let sqlSelectCheck = `
    SELECT A.年,A.月,A.编号,B.户名,B.装表地点,A.用水量,A.对比年,A.对比月,A.对比内容,A.对比水量 FROM 水费误差分析 A INNER JOIN 水费单位信息 B ON A.编号 = B.编号
        where A.年=:year and 月=:month
        `;
    let result = await db.query(
        sqlSelectCheck,
        { 
            replacements: {year, month}, 
            type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.checkErrorToExcel = checkErrorToExcel;

async function checkErrorToExcel(req, res) {
    let { date } = req.params;
    try {       
        let wb = await checkErrorToExcelImpt(date);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, ex );
    }
}

async function checkErrorToExcelImpt(date) {   
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlSelectCheck = `
    SELECT A.年,A.月,A.编号,B.户名,B.装表地点,A.用水量,A.对比年,A.对比月,A.对比内容,A.对比水量 FROM 水费误差分析 A INNER JOIN 水费单位信息 B ON A.编号 = B.编号
        where A.年=:year and 月=:month
        `;
    let items = await db.query(
        sqlSelectCheck,
        { 
            replacements: {year, month}, 
            type: db.QueryTypes.SELECT }
    );   
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', 'Error.xlsx'));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    let sheetNumber = 'Sheet1';
    // Set up some placeholder values matching the placeholders in the template
    let values = {        
        errors: items
    };
    // Perform substitution
    template.substitute(sheetNumber, values);
    // Get binary data
    return template.generate({type: 'base64'});
}

module.exports.changeIdCheck = changeIdCheck;

async function changeIdCheck(req, res) {
    let { num } = req.params;
    try {
        let result = await changeIdCheckImpt(num);        
        Helper.ResourceFound( res, result );
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, {num} );
    }
}

async function changeIdCheckImpt(num) {
    let sqlCheck = `
    Select 编号 from 水费单位信息 where 编号 =:num
        `;
    let items = await db.query(
        sqlCheck,
        { 
            replacements: {num}, 
            type: db.QueryTypes.SELECT }
    );   
    return items.length === 0 ? true : false;
}

module.exports.saveUnitChangeId =  saveUnitChangeId;

async function saveUnitChangeId(req, res) {
    let obj = req.body || {};
    try {
        let result = await saveUnitChangeIdImpt(obj);        
        Helper.ResourceUpdated( res, result );
        
    }catch(ex) {
        Helper.InternalServerError( res, ex, { num : obj.编号 } );
    }
}
 
async function saveUnitChangeIdImpt(obj) {    
    let sqlUpdate1 = `
    update 水费单位信息 set 编号=:n1, 扣水单位编号=:n2 where 编号=:n3 
    `;
    await db.query(
        sqlUpdate1,
        { replacements: {n1 : obj.编号n, n2 : obj.扣水单位编号n, n3 : obj.编号}, type: db.QueryTypes.UPDATE }
    );
    let sqlUpdate2 = `
    update 水费基本表 set 编号=:n1 where 编号=:n2 
    `;
    await db.query(
        sqlUpdate2,
        { replacements: {n1 : obj.编号n, n2 : obj.编号}, type: db.QueryTypes.UPDATE }
    );
    return true;
}

module.exports.queryPersonAndNumber =  queryPersonAndNumber;

async function queryPersonAndNumber(numbers) {
  let sqlSelect = `
  select 编号, 托收联系人, 托收电话
      from dbo.水费单位信息 
      where 编号 in (${numbers.join(',')})
  `;
  let items = await db.query(
      sqlSelect,
      { replacements: {}, type: db.QueryTypes.SELECT }
  );
  return items;
}




















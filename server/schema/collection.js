const os = require('os');
const fs = require("fs");
const util = require('util');
require('util.promisify').shim();


const path = require("path");
const iconv = require('iconv-lite');
const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toExcel, toExcelMultiSheets} = require('../modules/excel_helper');
const {copy, length, inttostr, trim, strtoint, strtoFloat} = require('../modules/string_helper');

const readFile = util.promisify(fs.readFile);

module.exports.queryAllBank = queryAllBank;

async function queryAllBank(req, res) {    
    try {         
        let result = await queryAllBankImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryAllBankImpt() {
    let sqlSelect = `
    SELECT  distinct 银行代码,银行名称 from 水费字典银行查询 order by 银行代码
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryCollection = queryCollection;

async function queryCollection(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await queryCollectionImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryCollectionImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect = `
    SELECT  * from 水费托收查询 where 年=:year and 月=:month ${obj.recount ? 'and 托收批次<1' : ''}
    `;
    let result = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryCollectionTable = queryCollectionTable;

async function queryCollectionTable(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await queryCollectionTableImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryCollectionTableImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect = `
    SELECT  * from 水费托收表 where 年=:year and 月=:month ${obj.recount ? 'and 托收批次<1' : ''}
    `;
    let result = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.createCollection = createCollection;

async function createCollection(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createCollectionImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createCollectionImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;
    let items, items1, item, Stemp;    
    sqlDelete = `
    delete from 水费托收表 where 年=:year and 月=:month
    `;
    await db.query(sqlDelete, { replacements: {year, month}, type: db.QueryTypes.DELETE });
    //20181107 sum(A.应收水费) => sum(A.实收水费)
    sqlInsert = `
    Insert into 水费托收表 (年,月,编号,应收水费)
        SELECT A.年,A.月,B.扣水单位编号,sum(A.实收水费) FROM  水费单位信息 B INNER JOIN  水费基本表 A ON B.编号 = A.编号 where A.年=:year and A.月=:month AND B.收费形式编号='1'
        group by  A.年,A.月,B.扣水单位编号     
    `;
    await db.query(sqlInsert, { replacements: {year, month}, type: db.QueryTypes.INSERT });
    sqlSelect = `
    SELECT  编号 from 水费托收表 where 年=:year and 月=:month order by 编号
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    for(let i = 0; i < items.length; i++) {
        let element = items[i];
        Stemp = obj.date +' 编号 ';
        sqlSelect = `
        select 编号,本月表底,用水量,实收水费 From 水费报表查询 where 收费形式编号='1' and 扣水单位编号=:num and 年=:year and 月=:month
        `;
        items1 = await db.query(sqlSelect, { replacements: {num : element.编号 ,year, month}, type: db.QueryTypes.SELECT });
        items1.forEach(element1 => {
            Stemp = Stemp + element1.编号 + ' ';
        });
        if(Stemp.length > 60) {
            Stemp = Stemp.slice(0,55) +' 水费';
        }
        sqlUpdate = `
        update 水费托收表 set 备注=:temp where 编号=:num and 年=:year and 月=:month 
        `;
        await db.query(sqlUpdate, { replacements: {num : element.编号, temp : Stemp, year, month}, type: db.QueryTypes.UPDATE });
    }
    return await queryCollectionImpt(obj);
}

module.exports.CollectionToExcel = CollectionToExcel;

async function CollectionToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await CollectionToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function CollectionToExcelImpt(obj) {
    let items, item;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    obj.recount = false;
    let values = {
        year, month,
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        user : obj.user,         
    };    
    items = await queryCollectionImpt(obj); 
    let len = items.length;
    if(len > 0) {
        items.push(
                {
                    编号 : '合计',
                    户名 : `${len}户`,
                    应收水费 : `=SUM(D4:D${len + 3})`,
                }
            );
    }
    values.items = items;   
    return toExcel('TuoShou', 'Sheet1', values);
}

module.exports.SaveToBankOfferExcel = SaveToBankOfferExcel;

async function SaveToBankOfferExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await SaveToBankOfferExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') );
    }catch(ex) {
        Helper.InternalServerError( res, ex.message, {  } );
    }
}

async function SaveToBankOfferExcelImpt(obj) {
    let I,J, items, item;
    let Stemp,SS,SID,SBank;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;
    SBank = obj.banks.map(b => `'${b}'`).join(','); 
    //先查找托收的用户编号
    sqlSelect = `
    SELECT  编号  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 银行代码 IN (${SBank})
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    SID = '';
    items.forEach(item => {
        SID = `${SID}'${item.编号}',`;
    });
    //SID =(SID.slice(1, SID.length -2 ));
    SID = copy(SID, 2 ,length(SID)-3);
    //取托收批次
    sqlSelect = `
    SELECT max(托收批次) as a from 水费托收查询 where 年=:year and 月=:month
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    J = parseInt(items[0].a) + 1;
    //查询明细托收记录
    sqlSelect = `
    SELECT  编号,业务种类,银行代码,开户行行号,开户行行名,帐号,户名,帐户地址,应收水费,组织代码,协议书号,备注  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 银行代码 IN (${SBank})
        order by 编号        
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    if(items.length === 0) {
        throw new Error('当月水费已经全部托收，请重新检查');
    }
    let values = {              
    };
    items.forEach(item => item.行别 = '1'); 
    //values.items = items;

    for(let i = 0; i < 150; i++) {
        if(i < items.length) {
            values[`户名${i + 1}`] = items[i].户名;
            values[`帐号${i + 1}`] = items[i].帐号;
            values[`行别${i + 1}`] = items[i].行别;
            values[`开户行行号${i + 1}`] = items[i].开户行行号;
            values[`业务种类${i + 1}`] = items[i].业务种类 ? items[i].业务种类 :  '00201';
            values[`协议书号${i + 1}`] = items[i].协议书号;
            values[`帐户地址${i + 1}`] = items[i].帐户地址;
            values[`应收水费${i + 1}`] = items[i].应收水费;
            values[`备注${i + 1}`] = items[i].备注;    
        }else {
            values[`户名${i + 1}`] = '';
            values[`帐号${i + 1}`] = '';
            values[`行别${i + 1}`] = '';
            values[`开户行行号${i + 1}`] = '';
            values[`业务种类${i + 1}`] = '';
            values[`协议书号${i + 1}`] = '';
            values[`帐户地址${i + 1}`] = '';
            values[`应收水费${i + 1}`] = '';
            values[`备注${i + 1}`] = '';
        }
    }
    return toExcel('bankoffer', '工行跨行', values);     
}

module.exports.SaveToBankOfferTxt = SaveToBankOfferTxt;

async function SaveToBankOfferTxt(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await SaveToBankOfferTxtImpt(obj);
        res.setHeader('Content-type', "application/octet-stream");
        res.setHeader('Content-disposition', `attachment; filename=${wb.name}`);
        res.charset = 'UTF-8';
        res.send(wb.data);
    }catch(ex) {
        Helper.InternalServerError( res, ex.message, {  } );
    }
}

async function SaveToBankOfferTxtImpt(obj) {
    let I,J, items, item;
    let Stemp,SS,SID,SBank;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;
    SBank = obj.banks.map(b => `'${b}'`).join(','); 
    //先查找托收的用户编号
    sqlSelect = `
    SELECT  编号  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 银行代码 IN (${SBank})
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    SID = '';
    items.forEach(item => {
        SID = `${SID}'${item.编号}',`;
    });
    //SID =(SID.slice(1, SID.length -2 ));
    SID = copy(SID, 2 ,length(SID)-3);
    //取托收批次
    sqlSelect = `
    SELECT max(托收批次) as a from 水费托收查询 where 年=:year and 月=:month
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    J = parseInt(items[0].a) + 1;
    //查询明细托收记录
    sqlSelect = `
    SELECT  编号,业务种类,银行代码,开户行行号,开户行行名,帐号,户名,帐户地址,应收水费,组织代码,协议书号,备注  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 银行代码 IN (${SBank})
        order by 编号        
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    if(items.length === 0) {
        throw new Error('当月水费已经全部托收，请重新检查');
    }    
    I = 1;
    Stemp = '';
    items.forEach(
        item => {
            //记录类型，记录顺序号,业务类型
            //Stemp ='2'+ '0000000'.slice(0, 8 - I.toString().length) + I.toString() +'00114';
            Stemp = Stemp + '2'+copy('0000000',1,8-length(inttostr(I)))+inttostr(I)+'00114';
            //业务种类,
            //Stemp = Stemp + item['业务种类'].toString() + '            '.slice(0, 12 - item['业务种类'].toString().length); //业务种类,
            Stemp =Stemp + item['业务种类'].toString() +copy('            ',1,12-length(item['业务种类'].toString())); //业务种类,
            //银行代码，交换行行号，开户行行号
            //Stemp = Stemp+ item['银行代码'].toString() + item['开户行行号'].toString() + item['开户行行号'].toString();
            Stemp = Stemp + item['银行代码'].toString() + item['开户行行号'].toString() + item['开户行行号'].toString();
            //开户行行名
            //Stemp = Stemp+item('开户行行名').asstring+copy('                                                            ',1,60-length(Fieldbyname('开户行行名').asstring));
            Stemp = Stemp + item['开户行行名'].toString() + copy('                                                            ', 1, 60 - length(item['开户行行名'].toString()));
            //帐号
            Stemp = Stemp+item['帐号'].toString()      +copy('                                ',1,32-length(item['帐号'].toString()));
            //帐户名称
            Stemp=Stemp+item['户名'].toString()      +copy('                                                            ',1,60-length(item['户名'].toString()));
            //帐户地址
            Stemp=Stemp+item['帐户地址'].toString()  +copy('                                                            ',1,60-length(item['帐户地址'].toString()));
            //处理笔数
            Stemp=Stemp+'00000001';
            //处理金额
            //SS=FloattostrF(Fieldbyname('应收水费').asFloat,fffixed,18,2);
            SS = parseFloat(item['应收水费']).toFixed(2);
            Stemp=Stemp+copy('000000000000000',1,15-length(SS))+SS;
            //单位代码
            Stemp=Stemp+item['组织代码'].toString()  +copy('          ',1,10-length(item['组织代码'].toString()));
            //单位编号
            Stemp=Stemp+item['编号'].toString()      +copy('        ',1,8-length(item['编号'].toString()));
            //协议书号
            if (item['协议书号'].toString() === '') {
                Stemp = Stemp +'000000'   
            }else {
                Stemp = Stemp + item['协议书号'].toString()+copy('                                                            ',1,60-length(item['协议书号'].toString()));
            }
            //附言
            Stemp=Stemp+item['备注'].toString()      +copy('                                                            ',1,60-length(item['备注'].toString()));
            //处理日期（yyyymmdd），成功笔数,  成功金额         ,处理标识，回执日期
            Stemp=Stemp+'        '+'00000000'+'000000000000000' +'000'  ;
            Stemp = Stemp + '\r\n';
            I=I+1;
        }        
    );
    let SSSS = Stemp;
    //计算总的处理笔数和金额
    sqlSelect = `
    SELECT  Count(应收水费) as a ,sum(应收水费) as b   from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 银行代码 IN (${SBank})
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    //处理笔数
    SS=items[0].a.toString();
    Stemp=copy('00000000',1,8-length(SS))+SS;
    //处理金额     
    SS = parseFloat(items[0].b).toFixed(2);
    Stemp=Stemp+copy('000000000000000',1,15-length(SS))+SS;
    SS=Stemp;
    //生成最后一条记录-汇总记录
    sqlSelect = `
    SELECT  银行代码,业务种类,开户行行号,开户行行名,帐号,户名,帐户地址,组织代码,协议书号  from 水费单位信息 where 编号='0000'
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month, bank : SBank}, type: db.QueryTypes.SELECT });
    item = items[0];
    //记录类型，记录顺序号,业务类型
    Stemp='1'+'00000000'+'00114';
    //业务种类,
    Stemp=Stemp+(item['业务种类'] ? item['业务种类'] : '')+copy('            ',1,12-length(item['业务种类'])); //业务种类,
    //银行代码，交换行行号，开户行行号
    Stemp=Stemp+item['银行代码'].toString()+item['开户行行号'].toString()+item['开户行行号'].toString();
    //开户行行名
    Stemp=Stemp+item['开户行行名'].toString()+copy('                                                            ',1,60-length(item['开户行行名'].toString()));
    //帐号
    Stemp=Stemp+item['帐号'].toString()      +copy('                                ',1,32-length(item['帐号'].toString()));
    //帐户名称
    Stemp=Stemp+item['户名'].toString()      +copy('                                                            ',1,60-length(item['户名'].toString()));
    //帐户地址
    Stemp=Stemp+item['帐户地址'].toString()  +copy('                                                            ',1,60-length(item['帐户地址'].toString()));
    //处理笔数,处理金额
    Stemp=Stemp+SS;
    //单位代码
    Stemp=Stemp+item['组织代码'].toString()  +copy('          ',1,10-length(item['组织代码'].toString()));
    //单位编号,暂按全为空来计
    Stemp=Stemp+copy('        ',1,8);
    //协议书号
    Stemp=Stemp+'                                                            ';
    //附言
    Stemp=Stemp+'                                                            ';
    //处理日期（yyyymmdd），成功笔数,  成功金额         ,处理标识，回执日期
    Stemp=Stemp+'        '+'00000000'+'000000000000000' +'000'  ;
    //更新托收批次
    sqlUpdate = `
    update  水费托收表 Set 托收批次=${inttostr(J)},托收日期=:date
        where 年=:year and 月=:month
        and   托收批次<1  and 编号 IN ('${SID}') 
    `;
    await db.query(sqlUpdate, { replacements: {year, month, date : dateFormat(new Date(), "yyyy-mm-dd")}, type: db.QueryTypes.UPDATE });
    
    let s1 =dateFormat(new Date(), "yyyy-mm-dd");
    let name  =copy(s1,1,4)+copy(s1,6,2)+copy(s1,9,2);
    name='SBJJDR92'+name+copy('000',1,3-length(inttostr(J)))+inttostr(J)+'.txt';
    
    return {
        data : SSSS + Stemp,
        name
    };
}

module.exports.queryUser = queryUser;

async function queryUser(req, res) {   
    let obj = req.body || {};  
    try {         
        let result = await queryUserImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryUserImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect = `
    SELECT  编号,户名 from 水费托收查询 where 年=:year and 月=:month ${obj.recount ? 'and 托收批次<1' : ''}
    `;
    let result = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.SaveToUserOfferExcel = SaveToUserOfferExcel;

async function SaveToUserOfferExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await SaveToUserOfferExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') );
    }catch(ex) {
        Helper.InternalServerError( res, ex.message, {  } );
    }
}

async function SaveToUserOfferExcelImpt(obj) {
    let I,J, items, item;
    let Stemp,SS,SID,STSID;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;    
    //先查找托收的用户编号
    SID = obj.users.map(b => `'${b}'`).join(','); 
    
    //取托收批次
    sqlSelect = `
    SELECT max(托收批次) as a from 水费托收查询 where 年=:year and 月=:month
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    J = parseInt(items[0].a) + 1;
    //查询明细托收记录
    sqlSelect = `
    SELECT  编号,业务种类,银行代码,开户行行号,开户行行名,帐号,户名,帐户地址,应收水费,组织代码,协议书号,备注  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 编号 IN (${SID})
        order by 编号        
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    if(items.length === 0) {
        throw new Error('当月水费已经全部托收，请重新检查');
    }
    let values = {              
    };
    items.forEach(item => item.行别 = '1'); 
    values.items = items;
    return toExcel('bankoffer', '工行跨行', values); 
}

module.exports.SaveToUserOfferTxt = SaveToUserOfferTxt;

async function SaveToUserOfferTxt(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await SaveToUserOfferTxtImpt(obj);
        res.setHeader('Content-type', "application/octet-stream");
        res.setHeader('Content-disposition', `attachment; filename=${wb.name}`);
        res.charset = 'UTF-8';
        res.send(wb.data);
    }catch(ex) {
        Helper.InternalServerError( res, ex.message, {  } );
    }
}

async function SaveToUserOfferTxtImpt(obj) {
    let I,J, items, item;
    let Stemp,SS,SID,STSID;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;    
    //先查找托收的用户编号
    SID = obj.users.map(b => `'${b}'`).join(','); 
    
    //取托收批次
    sqlSelect = `
    SELECT max(托收批次) as a from 水费托收查询 where 年=:year and 月=:month
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    J = parseInt(items[0].a) + 1;
    //查询明细托收记录
    sqlSelect = `
    SELECT  编号,业务种类,银行代码,开户行行号,开户行行名,帐号,户名,帐户地址,应收水费,组织代码,协议书号,备注  from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 编号 IN (${SID})
        order by 编号        
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    if(items.length === 0) {
        throw new Error('当月水费已经全部托收，请重新检查');
    }
    STSID = '';//记录实际选择的用户编号    
    I = 1;
    Stemp = '';
    items.forEach(
        item => {
            //记录类型，记录顺序号,业务类型
            //Stemp ='2'+ '0000000'.slice(0, 8 - I.toString().length) + I.toString() +'00114';
            Stemp = Stemp + '2'+copy('0000000',1,8-length(inttostr(I)))+inttostr(I)+'00114';
            //业务种类,
            //Stemp = Stemp + item['业务种类'].toString() + '            '.slice(0, 12 - item['业务种类'].toString().length); //业务种类,
            if(item['协议书号'].toString() === '') {
                Stemp=Stemp+'00600       ';
            }else {
                Stemp =Stemp + item['业务种类'].toString() +copy('            ',1,12-length(item['业务种类'].toString())); //业务种类,
            }            
            //银行代码，交换行行号，开户行行号
            //Stemp = Stemp+ item['银行代码'].toString() + item['开户行行号'].toString() + item['开户行行号'].toString();
            Stemp = Stemp + item['银行代码'].toString() + item['开户行行号'].toString() + item['开户行行号'].toString();
            //开户行行名
            //Stemp = Stemp+item('开户行行名').asstring+copy('                                                            ',1,60-length(Fieldbyname('开户行行名').asstring));
            Stemp = Stemp + item['开户行行名'].toString() + copy('                                                            ', 1, 60 - length(item['开户行行名'].toString()));
            //帐号
            Stemp = Stemp+item['帐号'].toString()      +copy('                                ',1,32-length(item['帐号'].toString()));
            //帐户名称
            Stemp=Stemp+item['户名'].toString()      +copy('                                                            ',1,60-length(item['户名'].toString()));
            //帐户地址
            Stemp=Stemp+item['帐户地址'].toString()  +copy('                                                            ',1,60-length(item['帐户地址'].toString()));
            //处理笔数
            Stemp=Stemp+'00000001';
            //处理金额
            //SS=FloattostrF(Fieldbyname('应收水费').asFloat,fffixed,18,2);
            SS = parseFloat(item['应收水费']).toFixed(2);
            Stemp=Stemp+copy('000000000000000',1,15-length(SS))+SS;
            //单位代码
            Stemp=Stemp+item['组织代码'].toString()  +copy('          ',1,10-length(item['组织代码'].toString()));
            //单位编号
            Stemp=Stemp+item['编号'].toString()      +copy('        ',1,8-length(item['编号'].toString()));
            //协议书号
            if (item['协议书号'].toString() === '') {
                Stemp = Stemp +'000000'   
            }else {
                Stemp = Stemp + item['协议书号'].toString()+copy('                                                            ',1,60-length(item['协议书号'].toString()));
            }
            //附言
            Stemp=Stemp+item['备注'].toString()      +copy('                                                            ',1,60-length(item['备注'].toString()));
            //处理日期（yyyymmdd），成功笔数,  成功金额         ,处理标识，回执日期
            Stemp=Stemp+'        '+'00000000'+'000000000000000' +'000'  ;
            Stemp = Stemp + '\r\n';
            //Stemp + Stemp + os.EOL;
            
            I=I+1;
            STSID = `${STSID}'${item['编号']}',`;
        }        
    );
    STSID=copy(STSID,2,length(STSID)-3);      //记录实际选择的用户编号
    let SSSS = Stemp;
    //计算总的处理笔数和金额
    sqlSelect = `
    SELECT  Count(应收水费) as a ,sum(应收水费) as b   from 水费托收查询 where 年=:year and 月=:month
        and   托收批次<1  and 编号 IN (${SID})
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    //处理笔数
    SS=items[0].a.toString();
    Stemp=copy('00000000',1,8-length(SS))+SS;
    //处理金额     
    SS = parseFloat(items[0].b).toFixed(2);
    Stemp=Stemp+copy('000000000000000',1,15-length(SS))+SS;
    SS=Stemp;
    //生成最后一条记录-汇总记录
    sqlSelect = `
    SELECT  银行代码,业务种类,开户行行号,开户行行名,帐号,户名,帐户地址,组织代码,协议书号  from 水费单位信息 where 编号='0000'
    `; 
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    item = items[0];
    //记录类型，记录顺序号,业务类型
    Stemp='1'+'00000000'+'00114';
    //业务种类,
    Stemp=Stemp+(item['业务种类'] ? item['业务种类'] : '')+copy('            ',1,12-length(item['业务种类'])); //业务种类,
    //银行代码，交换行行号，开户行行号
    Stemp=Stemp+item['银行代码'].toString()+item['开户行行号'].toString()+item['开户行行号'].toString();
    //开户行行名
    Stemp=Stemp+item['开户行行名'].toString()+copy('                                                            ',1,60-length(item['开户行行名'].toString()));
    //帐号
    Stemp=Stemp+item['帐号'].toString()      +copy('                                ',1,32-length(item['帐号'].toString()));
    //帐户名称
    Stemp=Stemp+item['户名'].toString()      +copy('                                                            ',1,60-length(item['户名'].toString()));
    //帐户地址
    Stemp=Stemp+item['帐户地址'].toString()  +copy('                                                            ',1,60-length(item['帐户地址'].toString()));
    //处理笔数,处理金额
    Stemp=Stemp+SS;
    //单位代码
    Stemp=Stemp+item['组织代码'].toString()  +copy('          ',1,10-length(item['组织代码'].toString()));
    //单位编号,暂按全为空来计
    Stemp=Stemp+copy('        ',1,8);
    //协议书号
    Stemp=Stemp+'                                                            ';
    //附言
    Stemp=Stemp+'                                                            ';
    //处理日期（yyyymmdd），成功笔数,  成功金额         ,处理标识，回执日期
    Stemp=Stemp+'        '+'00000000'+'000000000000000' +'000'  ;
    //更新托收批次
    sqlUpdate = `
    update  水费托收表 Set 托收批次=${inttostr(J)},托收日期=:date
        where 年=:year and 月=:month
        and   托收批次<1  and 编号 IN ('${STSID}') 
    `;
    await db.query(sqlUpdate, { replacements: {year, month, date : dateFormat(new Date(), "yyyy-mm-dd")}, type: db.QueryTypes.UPDATE });
    
    let s1 =dateFormat(new Date(), "yyyy-mm-dd");
    let name  =copy(s1,1,4)+copy(s1,6,2)+copy(s1,9,2);
    name='SBJJDR92'+name+copy('000',1,3-length(inttostr(J)))+inttostr(J)+'.txt';
    
    return {
        data : SSSS + Stemp,
        name
    };
}

module.exports.queryBatch = queryBatch;

async function queryBatch(req, res) { 
    let { date } = req.params; 
    try {         
        let result = await queryBatchImpt(date);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryBatchImpt(date) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlSelect = `
    SELECT  distinct 托收批次 from 水费托收查询 where 年=:year and 月=:month and 托收批次>=0
    `;
    let result = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.XinFengHuiZongToExcel = XinFengHuiZongToExcel;

async function XinFengHuiZongToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await XinFengHuiZongToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res,  ex.message, {  } );
    }
}

async function XinFengHuiZongToExcelImpt(obj) {
    let items, item, I,J;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    obj.recount = false;
    let values = {}; 
    //求总信件数量 
    let sqlSelect = `
    SELECT  count(应收水费) as 信件数量 from 水费托收查询  where 年=:year and 月=:month ${obj.batch.length > 0 ? `and 托收批次=${obj.batch}` : ''}
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );  
    J=parseInt(items[0].信件数量);
    //打印数量 
    sqlSelect = `
    SELECT  开户行行名,count(应收水费) as 信件数量 from 水费托收查询
        where 年=:year and 月=:month ${obj.batch.length > 0 ? `and 托收批次=${obj.batch}` : ''}
        group by  开户行行名
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    ); 
    if(items.length === 0) {
        throw new Error('该月托收水费不存在,请重新选择!');
    }
    values['A2'] = `    提出行：中国工商银行天保支行        ${dateFormat(new Date(), "yyyy-mm-dd")}          提出场次：  ${obj.batch}`
    values['D22'] = J.toString();
    I=4;
    items.forEach(
        item => {
            if(I < 23) {
                values['A'+inttostr(I)]  = item['开户行行名']; //
                values['B'+inttostr(I)]  = item['信件数量']; //
                I = I + 1;
            }else {
                values['C'+inttostr(I - 19)]  = item['开户行行名']; //
                values['D'+inttostr(I -19)]  = item['信件数量']; //
                I = I + 1;
            }
        }
    );
    return toExcel('XinFengHuiZong', 'Sheet1', values);
}

module.exports.XinFengToExcel = XinFengToExcel;

async function XinFengToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await XinFengToExcelToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res,  ex.message, {  } );
    }
}

function initXinFeng() {
    let xinfengItems = {};
    let i = 0;
    for(let i = 0; i < 20; i++) {
        xinfengItems[`Sheet${i+1}`] = {
            B2 : '',
            E5 : '',
            B16 : '',
            E19 : ''
        }
    }
    return xinfengItems;
}

async function XinFengToExcelToExcelImpt(obj) {
    let xinfeng = initXinFeng();
    let items, item, I,J;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    obj.recount = false;
    let values = {}; 
    //求总信件数量 
    let sqlSelect = `
    SELECT  count(distinct 开户行行名) as 银行个数 from  水费托收查询  where 年=:year and 月=:month ${obj.batch.length > 0 ? `and 托收批次=${obj.batch}` : ''}
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );  
    J=parseInt(items[0].银行个数);
    //打印数量 
    sqlSelect = `
    SELECT  开户行行名,count(应收水费) as 信件数量 from 水费托收查询
        where 年=:year and 月=:month ${obj.batch.length > 0 ? `and 托收批次=${obj.batch}` : ''}
        group by  开户行行名
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    ); 
    if(items.length === 0) {
        throw new Error('该月托收水费不存在,请重新选择!');
    }
    I=2;
    let int = 0;
    while(int < items.length) {
        let flag = `Sheet${Math.floor(I / 2)}`;
        xinfeng[flag].B2 = items[int].开户行行名;
        xinfeng[flag].E5 = items[int].信件数量;
        I += 1;
        int += 1;
        if(int < items.length) {
            xinfeng[flag].B16 = items[int].开户行行名;
            xinfeng[flag].E19 = items[int].信件数量;
            I += 1;
            int += 1;
        }
    } 

    return toExcelMultiSheets('XinFeng', Object.keys(xinfeng), Object.values(xinfeng));
}

module.exports.inputDisk = inputDisk;

async function inputDisk(req, res) { 
    let obj = req.body || {};
    try {         
        let result = await inputDiskImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex.message, {} );
    }
}

async function inputDiskImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;
    // let data = fs.readFileSync(path.join('./', 'uploadfiles',  obj.name));
    let data = await readFile(path.join('./', 'uploadfiles',  obj.name));
    let cdata = iconv.decode(data, 'gbk');
    let contents = cdata.toString().split("\n");
    let SSA,SSB,SSC,SSD,SSE;
    let temp = [];
    for(let I = 0; I < data.length - 1; I++) {
        // let asc = iconv.encode(contents[I]);
        if(data[I] !== 10) {
            temp.push(data[I]);
        }else {
            SSA = copy(temp,427,8);
            SSA = iconv.decode(SSA, 'gbk');
            if (trim(SSA) !== '' ) {
                SSA = copy(SSA,1,4) + '-'+copy(SSA,5,2)+'-'+copy(SSA,7,2)
            }else {
                SSA='';
            }
            //回盘笔数
            SSB =copy(temp,435,8);
            SSB = trim(iconv.decode(SSB, 'gbk'));
            //回盘金额
            SSC =  copy(temp,443,15);
            SSC = trim(iconv.decode(SSC, 'gbk'));
            //处理标识
            SSD = copy(temp,458,3);
            SSD = trim(iconv.decode(SSD, 'gbk'));
            //用户编号
            SSE = copy(temp,299,4);
            SSE = trim(iconv.decode(SSE, 'gbk'));
            if(SSE.length > 0) {
                sqlUpdate = `
                update 水费托收表 set 托收批次=:a1,回盘日期=:a2,回盘金额=:a3,处理标识代码=:a4 where 编号=:a5 and (年=:year) and (月=:month)
                `;
                await db.query(
                    sqlUpdate,
                    { replacements: {
                    //不成功，则标识为负数; 成功，则标识为当次批次
                    a1 : SSD !== '001' ? 0 - strtoint(obj.batch) : strtoint(obj.batch),
                    //处理日期
                    a2 : trim(SSA)!=='' ? SSA : '',
                    //回盘金额
                    a3 : strtoFloat(SSC),
                    //处理标识
                    a4 : SSD,
                    //用户编号
                    a5 : SSE,
                    year, month},
                type: db.QueryTypes.UPDATE });
            }
            temp = [];      
            }
        
    }
    return {};
}

module.exports.OutputDetailToExcel = OutputDetailToExcel;

async function OutputDetailToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await OutputDetailToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res,  ex.message, {  } );
    }
}

async function OutputDetailToExcelImpt(obj) {
    let items, Stemp;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);     
    let values = {
        year, month
    }; 
    //求总信件数量 
    let sqlSelect = `
    SELECT  * from 水费托收查询 where 年=:year and 月=:month 
        ${obj.bank.length > 0 ? ` and 银行代码=${copy(obj.bank, 1, 3)} ` : ''}
        ${obj.batch.length > 0 ? ` and ABS(托收批次)=${obj.batch} ` : ''}
        ${obj.kind === '2' ? ` and 托收批次 >0 ` : ''}
        ${obj.kind === '3' ? ` and  托收批次 <0 ` : ''}
        order by  托收批次,开户行行号,帐号
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    Stemp = '';
    if(obj.bank.length > 0) {
        Stemp = obj.bank + ' - ';
    }
    if(obj.batch.length > 0) {
        Stemp = Stemp + '第'+ obj.batch+'批次 - ';
    }
    if(obj.kind === '1') {
        Stemp  =  Stemp+ '全部';
    }
    if(obj.kind === '2') {
        Stemp  =  Stemp+ '托收成功';
    }
    if(obj.kind === '3') {
        Stemp  =  Stemp+ '托收失败';
    }
    values.B2 = Stemp;
    let len = items.length;
    if(len > 0) {
        items.push(
                {
                    托收批次 : '合计',
                    户名 : `${len}个用户`,
                    应收水费 : `=SUM(G4:G${len +  3})`
                }
            );
    }
    values.items = items;
    return toExcel('TuoShouMingXi', 'Sheet1', values);
}

module.exports.queryCollectionCount = queryCollectionCount;

async function queryCollectionCount(req, res) { 
    let { date } = req.params; 
    try {         
        let result = await queryCollectionCountImpt(date);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryCollectionCountImpt(date) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlSelect = `
    SELECT  * from 水费托收统计 where 年=:year and 月=:month
    `;
    let result = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.createCollectionCount = createCollectionCount;

async function createCollectionCount(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createCollectionCountImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createCollectionCountImpt(obj) {
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    let sqlSelect, sqlDelete, sqlUpdate, sqlInsert;
    let items, items1, item, Stemp, II,FF;    
    sqlDelete = `
    delete from 水费托收统计 where 年=:year and 月=:month
    `;
    await db.query(sqlDelete, { replacements: {year, month}, type: db.QueryTypes.DELETE });
    sqlInsert = `
    Insert into 水费托收统计 (年,月,托收批次,托收笔数,托收金额)
        SELECT 年,月,ABS(托收批次),COUNT(应收水费), SUM(应收水费) FROM 水费托收表 
        WHERE (年 =:year) AND (月 = :month)  
        GROUP BY 年,月,ABS(托收批次)     
    `;
    await db.query(sqlInsert, { replacements: {year, month}, type: db.QueryTypes.INSERT });
    sqlSelect = `
    SELECT  托收批次 from 水费托收统计 where 年=:year and 月=:month and 托收批次>0  order by 托收批次
    `;
    items = await db.query(sqlSelect, { replacements: {year, month}, type: db.QueryTypes.SELECT });
    for(let i = 0; i < items.length; i++) {
        //更新水费托收统计  中的  成功笔数，成功金额,失败笔数，失败金额
        let element = items[i];
        sqlSelect = `
        select COUNT(应收水费) as a1, SUM(应收水费) as a2 FROM 水费托收表 WHERE (年 =:year) AND (月 = :month) 
            And 托收批次=:batch  
        `;
        items1 = await db.query(sqlSelect, { replacements: {year, month, batch : element.托收批次}, type: db.QueryTypes.SELECT });
        if(items1.length > 0) {
            II = items1[0].a1;
            FF = items1[0].a2;
        }else{
            II = '0';
            FF = '0';  
        }
        sqlUpdate = `
        update 水费托收统计 set 成功笔数=${II},成功金额=${FF}
            where  年=:year and 月=:month
            and 托收批次='${element.托收批次}'
        `;
        await db.query(sqlUpdate, { replacements: {year, month}, type: db.QueryTypes.UPDATE });
        sqlUpdate = `
        update 水费托收统计 set 失败笔数=托收笔数-成功笔数,失败金额=托收金额-成功金额
            where  年=:year and 月=:month
            and 托收批次='${element.托收批次}'
        `;
        await db.query(sqlUpdate, { replacements: {year, month}, type: db.QueryTypes.UPDATE });
    }
    return await queryCollectionCountImpt(obj.date);
}

module.exports.OutputCountToExcel = OutputCountToExcel;

async function OutputCountToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await OutputCountToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res,  ex.message, {  } );
    }
}

async function OutputCountToExcelImpt(obj) {
    let items;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);     
    let values = {
        year, month,
        date : dateFormat(new Date(), "yyyy-mm-dd")
    }; 
    items = await queryCollectionCountImpt(obj.date);
    let len = items.length;
    if(len > 0) {
        items.push(
                {
                    托收批次 : '合计',
                    托收笔数 : `=SUM(B4:B${len +  3})`,
                    托收金额 : `=SUM(C4:C${len +  3})`,
                    成功笔数 : `=SUM(D4:D${len +  3})`,
                    成功金额 : `=SUM(E4:E${len +  3})`,
                    失败笔数 : `=SUM(F4:F${len +  3})`,
                    失败金额 : `=SUM(G4:G${len +  3})`,
                }
            );
    }
    values.items = items;
    return toExcel('TuoShouTongJi', 'Sheet1', values);
}

module.exports.queryBank = queryBank;

async function queryBank(req, res) {    
    try {         
        let result = await queryBankImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryBankImpt() {
    let sqlSelect = `
    Select *  from 水费字典银行查询 order by 开户行行号
    `;
    let result = await db.query(sqlSelect, { replacements: {}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.createBank = createBank;

async function createBank(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await createBankImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function createBankImpt(obj) {
    let sqlInsert = `
    insert into 水费字典银行代码 (开户行行号,开户行行名,银行代码,使用次数,是否验证,帐号位数,帐号相同位数,帐号相同代码,帐号相同代码1,业务种类 ) 
        values( :a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8,:a9,:a10)
    `;
    let params = {
        a1 : obj.开户行行号,
        a2 : obj.开户行行名,
        a3 : copy(obj.开户行行号,1,3),
        a4 : 0,
    };
    if(obj.验证) {
        params.a5 = 'Y';
        params.a6 = obj.帐号位数;
        params.a7 = obj.帐号相同位数;
    }else{
        params.a5 = 'N';
        params.a6 = 0;
        params.a7 = 0;
    }
    params.a8 = obj.账号相同代码;
    params.a9 = obj.账号相同代码1;
    params.a10 = obj.业务种类;
    let result = await db.query(
        sqlInsert,
        { replacements: params ,  type: db.QueryTypes.INSERT }
    );
    return result;
}

module.exports.deleteBank = deleteBank;

async function deleteBank(req, res) { 
    let { num } = req.params;   
    try {         
        let result = await deleteBankImpt(num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function deleteBankImpt(num) {
    let sqlDelete = `
    delete from 水费字典银行代码 where 开户行行号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: {num} ,  type: db.QueryTypes.DELETE }
    );
    return result;
}

module.exports.updateBank = updateBank;

async function updateBank(req, res) { 
    let obj = req.body || {};   
    try {         
        let result = await updateBankImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function updateBankImpt(obj) {
    let sqlUpdate = `
    Update 水费字典银行代码 set 开户行行名=:a2,银行代码=:a3,是否验证=:a5,帐号位数=:a6,帐号相同位数=:a7,帐号相同代码=:a8,帐号相同代码1=:a9,业务种类=:a10 where 开户行行号=:a1
    `;
    let params = {
        a1 : obj.开户行行号,
        a2 : obj.开户行行名,
        a3 : copy(obj.开户行行号,1,3),
    };
    if(obj.验证) {
        params.a5 = 'Y';
        params.a6 = obj.帐号位数;
        params.a7 = obj.帐号相同位数;
    }else{
        params.a5 = 'N';
        params.a6 = 0;
        params.a7 = 0;
    }
    params.a8 = obj.帐号相同代码;
    params.a9 = obj.帐号相同代码1;
    params.a10 = obj.业务种类;
    let result = await db.query(
        sqlUpdate,
        { replacements: params ,  type: db.QueryTypes.UPDATE }
    );
    return result;
}








const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toExcel} = require('../modules/excel_helper');
module.exports.queryCommission = queryCommission;

async function queryCommission(req, res) {
    let { date } = req.params;
    try {         
        let result = await queryCommissionImpt(date);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, date );
    }
}

async function queryCommissionImpt(date) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlStat1 = `
    Select * from 水费报表查询 
        where 年=:year and 月=:month
        and 收费形式编号='1' order by 编号
    `;
    let result = await db.query(
        sqlStat1,
        { replacements: { year, month }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryDetail = queryDetail;

async function queryDetail(req, res) {
    let { date, kind } = req.params;
    try {         
        let result = await queryDetailImpt(date, kind);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, date );
    }
}

async function queryDetailImpt(date, kind) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlStat1;
    if(kind && kind !== '5') {
        sqlStat1 = `
        Select * from 水费报表查询 
            where 年=:year and 月=:month
            and 收费形式编号=:kind order by 编号
        `;
    }else{
        sqlStat1 = `
        Select * from 水费报表查询 
            where 年=:year and 月=:month
            order by 编号
        `;
    }
    
    let result = await db.query(
        sqlStat1,
        { replacements: { year, month, kind }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryChargeMonth = queryChargeMonth;

async function queryChargeMonth(req, res) {
  let obj = req.body || {};
    try {         
        let result = await queryChargeMonthImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryChargeMonthImpt(obj) {
  let result;
  let date = obj.月份;
  let year = date.slice(0, 4);
  let month = date.slice(4);
  let sqlSelect = `
  SELECT * FROM 水费报表查询  where (年=:year) and (月=:month) 
      and (编号>=:num1)  and  (编号<=:num2) 
      ${obj.kind === '1' ? `and (区号<>'8')` : `and (区号='8')`}
      Order by 编号
  `;
  result = await db.query(
      sqlSelect,
      { replacements: {year, month, num1 : obj.num1, num2 : obj.num2}, type: db.QueryTypes.SELECT }
  );
    return result;
}

module.exports.ChargeMonthToExcel = ChargeMonthToExcel;

async function ChargeMonthToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ChargeMonthToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ChargeMonthToExcelImpt(obj) {
    let items, item;
    let date = obj.月份;
    let year = date.slice(0, 4);
    let month = date.slice(4);
    items = await queryChargeMonthImpt(obj);
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        year : year,
        month : month,
    };
    let len = items.length;
    if(len > 0) {
        items.forEach(
            (item, index) => {
                item.水费合计 = `=S${index + 4}-M${index + 4}`
            }
        );
        items.push(
                {
                    编号 : '合计',
                    户名 : `${len}户`,
                    装表地点 : '',
                    排污费单价 : '',
                    上月表底 : `=SUM(D4:D${len + 3})`,
                    本月表底 : `=SUM(E4:E${len + 3})`,
                    实际用水量 : `=SUM(F4:F${len + 3})`,
                    实际计划水费 : `=SUM(H4:H${len + 3})`,
                    超额水量 : `=SUM(I4:I${len + 3})`,
                    超额水费 : `=SUM(K4:K${len + 3})`,
                    排污费 : `=SUM(M4:M${len + 3})`,
                    防火费 : `=SUM(N4:N${len + 3})`,
                    手续费 : `=SUM(O4:O${len + 3})`,
                    其它 : `=SUM(P4:P${len + 3})`,
                    减水费 : `=SUM(Q4:Q${len + 3})`,
                    水费合计 : `=SUM(R4:R${len + 3})`,
                    实收水费 : `=SUM(S4:S${len + 3})`,
                }
            );
    }
    
    values.items = items;   
    return toExcel('charge', 'Sheet1', values);
}

module.exports.queryChargeYearByCorp = queryChargeYearByCorp;

async function queryChargeYearByCorp(req, res) {
  let obj = req.body || {};
    try {         
        let result = await queryChargeYearByCorpImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryChargeYearByCorpImpt(obj) {
  let items;
  let sqlSelect = `
    Select 年,户名,sum(实际用水量) as 实际用水量,sum(实际计划水费) as 实际计划水费,sum(超额水量) as 超额水量,sum(超额水费) as 超额水费,sum(防火费) as 防火费,sum(手续费) as 手续费,
        sum(减水费) as 减水费,sum(实收水费) as 实收水费,sum(排污费) as 排污费,sum(其它) as 其它 from 水费报表查询
        where (年+月>=:date1) and (年+月<=:date2)
        and (编号>=:num1)  and  (编号<=:num2)
        group by 年,户名 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {date1 : obj.date1, date2 : obj.date2, num1 : obj.num1, num2 : obj.num2}, type: db.QueryTypes.SELECT }
    );
    
    let dict = new Map();
    items.forEach(
        item => {
            let key = removeStringRear(item.户名);
            item.户名 = key;
            if(dict.has(key)) {
                let value = dict.get(key);
                value.实际用水量 += item.实际用水量;
                value.实际计划水费 += item.实际计划水费;
                value.超额水量 += item.超额水量;
                value.超额水费 += item.超额水费;
                value.防火费 += item.防火费;
                value.手续费 += item.手续费;
                value.减水费 += item.减水费;
                value.实收水费 += item.实收水费;
                value.排污费 += item.排污费;
                value.其它 += item.其它;
            }else {
                dict.set(key, item)
            }
        }
    ); 
    let result = [];   
    for(let item of dict){
        result.push(item[1]);
    } 
    return result; 
}

module.exports.ChargeYearByCorpToExcel = ChargeYearByCorpToExcel;

async function ChargeYearByCorpToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ChargeYearByCorpToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ChargeYearByCorpToExcelImpt(obj) {
    let items, item;
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
    };
    // let sqlSelect = `
    // Select 年,户名,sum(实际用水量) as 实际用水量,sum(实际计划水费) as 实际计划水费,sum(超额水量) as 超额水量,sum(超额水费) as 超额水费,sum(防火费) as 防火费,sum(手续费) as 手续费,
    //     sum(减水费) as 减水费,sum(实收水费) as 实收水费,sum(排污费) as 排污费,sum(其它) as 其它 from 水费报表查询
    //     where (年+月>=:date1) and (年+月<=:date2)
    //     and (编号>=:num1)  and  (编号<=:num2)
    //     group by 年,户名 
    // `;
    // items = await db.query(
    //     sqlSelect,
    //     { replacements: {date1 : obj.date1, date2 : obj.date2, num1 : obj.num1, num2 : obj.num2}, type: db.QueryTypes.SELECT }
    // );
    
    // let dict = new Map();
    // items.forEach(
    //     item => {
    //         let key = removeStringRear(item.户名);
    //         item.户名 = key;
    //         if(dict.has(key)) {
    //             let value = dict.get(key);
    //             value.实际用水量 += item.实际用水量;
    //             value.实际计划水费 += item.实际计划水费;
    //             value.超额水量 += item.超额水量;
    //             value.超额水费 += item.超额水费;
    //             value.防火费 += item.防火费;
    //             value.手续费 += item.手续费;
    //             value.减水费 += item.减水费;
    //             value.实收水费 += item.实收水费;
    //             value.排污费 += item.排污费;
    //             value.其它 += item.其它;
    //         }else {
    //             dict.set(key, item)
    //         }
    //     }
    // ); 
    // let result = [];   
    // for(let item of dict){
    //     result.push(item[1]);
    // }  
    let result = await queryChargeYearByCorpImpt(obj);  
    let len = result.length;
    if(len > 0) {
        result.push(
                {
                    年 : '合计',
                    月 : `${len}户`,
                    实际用水量 : `=SUM(D4:D${len + 3})`,
                    实际计划水费 : `=SUM(F4:F${len + 3})`,
                    超额水量 : `=SUM(G4:G${len + 3})`,
                    超额水费 : `=SUM(I4:I${len + 3})`,
                    排污费 : `=SUM(J4:J${len + 3})`,
                    防火费 : `=SUM(K4:K${len + 3})`,
                    手续费 : `=SUM(L4:L${len + 3})`,
                    其它 : `=SUM(M4:M${len + 3})`,
                    减水费 : `=SUM(N4:N${len + 3})`,
                    实收水费 : `=SUM(O4:O${len + 3})`,
                }
            );
    }
    
    values.items = result;   
    return toExcel('chargeyearcorp', 'Sheet2', values);
}

function removeStringRear(item) {
    item = item.trim();
    let last = item.charAt(item.length - 1);
        if(last === ')') {
            let lastIndex = item.lastIndexOf('(');
            let str = item.substring(0, lastIndex);
            return str; 
        }
        else if(last === '）') {
            let lastIndex = item.lastIndexOf('（');
            let str = item.substring(0, lastIndex);
            return str; 
        }    
        return item; 
}

module.exports.ChargeYearByMeterToExcel = ChargeYearByMeterToExcel;

async function ChargeYearByMeterToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ChargeYearByMeterToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ChargeYearByMeterToExcelImpt(obj) {
    let items, item;
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
    };
    // let sqlSelect = `
    // Select 年,编号,户名,装表地点,sum(实际用水量) as 实际用水量,sum(实际计划水费) as 实际计划水费,sum(超额水量) as 超额水量,sum(超额水费) as 超额水费,sum(防火费) as 防火费,sum(手续费) as 手续费,
    //     sum(减水费) as 减水费,sum(实收水费) as 实收水费,sum(排污费) as 排污费,sum(其它) as 其它 from 水费报表查询
    //     where (年+月>=:date1) and (年+月<=:date2)
    //     and (编号>=:num1)  and  (编号<=:num2)
    //     group by 年,编号,户名,装表地点 order by 编号
    // `;
    // // let sqlSelect = `
    // // Select 年,编号,户名,装表地点,sum(上月表底)as 上月表底,sum(本月表底)as 本月表底,sum(实际用水量) as 实际用水量,sum(实际计划水费) as 实际计划水费,sum(超额水量) as 超额水量,sum(超额水费) as 超额水费,sum(防火费) as 防火费,sum(手续费) as 手续费,
    // //     sum(减水费) as 减水费,sum(实收水费) as 实收水费,sum(排污费) as 排污费,sum(其它) as 其它 from 水费报表查询
    // //     where (年+月>=:date1) and (年+月<=:date2)
    // //     and (编号>=:num1)  and  (编号<=:num2)
    // //     group by 年,编号,户名,装表地点 order by 编号
    // // `;
    // items = await db.query(
    //     sqlSelect,
    //     { replacements: {date1 : obj.date1, date2 : obj.date2, num1 : obj.num1, num2 : obj.num2}, type: db.QueryTypes.SELECT }
    // );
    items = await queryChargeYearByMeterImpt(obj);
    let len = items.length;
    if(len > 0) {
        items.push(
                {
                    年 : '合计',
                    月 : `${len}户`,
                    实际用水量 : `=SUM(F4:F${len + 3})`,
                    实际计划水费 : `=SUM(H4:H${len + 3})`,
                    超额水量 : `=SUM(I4:I${len + 3})`,
                    超额水费 : `=SUM(K4:K${len + 3})`,
                    排污费 : `=SUM(L4:L${len + 3})`,
                    防火费 : `=SUM(M4:M${len + 3})`,
                    手续费 : `=SUM(N4:N${len + 3})`,
                    其它 : `=SUM(O4:O${len + 3})`,
                    减水费 : `=SUM(P4:P${len + 3})`,
                    实收水费 : `=SUM(Q4:Q${len + 3})`,
                }
            );
    }
    
    values.items = items;   
    return toExcel('chargeyear', 'Sheet2', values);
}

module.exports.queryChargeYearByMeter = queryChargeYearByMeter;

async function queryChargeYearByMeter(req, res) {
  let obj = req.body || {};
    try {         
        let result = await queryChargeYearByMeterImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryChargeYearByMeterImpt(obj) {
  let result;
  let sqlSelect = `
    Select 年,编号,户名,装表地点,sum(实际用水量) as 实际用水量,sum(实际计划水费) as 实际计划水费,sum(超额水量) as 超额水量,sum(超额水费) as 超额水费,sum(防火费) as 防火费,sum(手续费) as 手续费,
        sum(减水费) as 减水费,sum(实收水费) as 实收水费,sum(排污费) as 排污费,sum(其它) as 其它 from 水费报表查询
        where (年+月>=:date1) and (年+月<=:date2)
        and (编号>=:num1)  and  (编号<=:num2)
        group by 年,编号,户名,装表地点 order by 编号
    `;
    result = await db.query(
        sqlSelect,
        { replacements: {date1 : obj.date1, date2 : obj.date2, num1 : obj.num1, num2 : obj.num2}, type: db.QueryTypes.SELECT }
    );
    return result;
}


module.exports.queryAllowance = queryAllowance;

async function queryAllowance(req, res) {
    try {         
        let result = await queryAllowanceImpt();
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {} );
    }
}

async function queryAllowanceImpt() {
    let sqlStat1;
    sqlStat1 = `
    SELECT * FROM  水费贴费查询
        `;
    let result = await db.query(
        sqlStat1,
        { replacements: { }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.AllowanceToExcel = AllowanceToExcel;

async function AllowanceToExcel(req, res) {
    let { lister } = req.params;
    try {       
        let wb = await AllowanceToExcelImpt(lister);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function AllowanceToExcelImpt(lister) {
    let items, item;
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        lister,
    };
    let sqlSelect = `
    Select * from 水费贴费查询
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {}, type: db.QueryTypes.SELECT }
    );
    values.items = items;   
    return toExcel('allowance1', 'Sheet1', values);
}
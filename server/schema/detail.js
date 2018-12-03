const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toExcel} = require('../modules/excel_helper');

module.exports.AllowanceToExcel = AllowanceToExcel;

async function AllowanceToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await AllowanceToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

const ProjectKind = {
    无 : '全部单位',
    收 : '已收水贴费单位',
    免 : '免水贴费单位',
    欠 : '欠水贴费单位',
    管 : '交管委会单位'
}

async function AllowanceToExcelImpt(obj) {
    let items, item;
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        user : obj.user,
        kind : ProjectKind[obj.kind]
    };
    // let sqlSelect = `
    // SELECT A.编号,B.户名,B.装表地点,A.交费日期,A.水贴费,A.贴费状态,A.增容日期1,A.增容费1,A.增容日期2,A.增容费2,A.增容日期3,A.增容费3,A.增容日期4,A.增容费4,A.增容日期5,A.增容费5, 
    //     A.合计 FROM 水费贴费表 A INNER JOIN 水费单位信息 B ON A.编号=B.编号
    //     where (substring(交费日期,1,6)>=:date1)
    //     and   (substring(交费日期,1,6)<=:date2)
    //     and (A.编号>=:num1)  and  (A.编号<=:num2)
    // `;
    // if(obj.kind && obj.kind !== '无') {
    //     sqlSelect += ' and (贴费状态=:kind) ';
    // }
    // sqlSelect += ' Order by A.编号 ';
    // items = await db.query(
    //     sqlSelect,
    //     { replacements: {
    //         date1 : obj.date1,
    //         date2 : obj.date2,
    //         num1 : obj.num1,
    //         num2 : obj.num2,
    //         kind : obj.kind
    //     }, type: db.QueryTypes.SELECT }
    // );
    items = await queryAllowanceImpt(obj);
    let len = items.length;
    if(len > 0) {
        items.push(
                {
                    户名 : '合计',
                    装表地点 : '',
                    水贴费 : `=SUM(E4:E${len + 3})`,
                    增容费1 : `=SUM(H4:H${len + 3})`,
                    增容费2 : `=SUM(J4:J${len + 3})`,
                    增容费3 : `=SUM(L4:L${len + 3})`,
                    增容费4 : `=SUM(N4:N${len + 3})`,
                    增容费5 : `=SUM(P4:P${len + 3})`,
                    合计 : `=SUM(Q4:Q${len + 3})`,
                }
            );
    }
    values.items = items;   
    return toExcel('allowance', 'Sheet1', values);
}

module.exports.queryAllowance = queryAllowance;

async function queryAllowance(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryAllowanceImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryAllowanceImpt(obj) {
    let sqlSelect = `
    SELECT A.编号,B.户名,B.装表地点,A.交费日期,A.水贴费,A.贴费状态,A.增容日期1,A.增容费1,A.增容日期2,A.增容费2,A.增容日期3,A.增容费3,A.增容日期4,A.增容费4,A.增容日期5,A.增容费5, 
        A.合计 FROM 水费贴费表 A INNER JOIN 水费单位信息 B ON A.编号=B.编号
        where (substring(交费日期,1,6)>=:date1)
        and   (substring(交费日期,1,6)<=:date2)
        and (A.编号>=:num1)  and  (A.编号<=:num2)
    `;
    if(obj.kind && obj.kind !== '无') {
        sqlSelect += ' and (贴费状态=:kind) ';
    }
    sqlSelect += ' Order by A.编号 ';
    let result = await db.query(
        sqlSelect,
        { replacements: {
            date1 : obj.date1,
            date2 : obj.date2,
            num1 : obj.num1,
            num2 : obj.num2,
            kind : obj.kind
        }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryFixWatch = queryFixWatch;

async function queryFixWatch(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryFixWatchImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryFixWatchImpt(obj) {
    let sqlSelect = `
    Select 编号,户名,装表地点,装表费,用水日期,装表日期 from 水费单位信息        
        where (substring(用水日期,1,6)>=:date1)
        and   (substring(用水日期,1,6)<=:date2)
        and (编号>=:num1)  and  (编号<=:num2)
        Order by 编号
    `;
    let result = await db.query(
        sqlSelect,
        { replacements: {
            date1 : obj.date1,
            date2 : obj.date2,
            num1 : obj.num1,
            num2 : obj.num2,             
        }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryRation = queryRation;

async function queryRation(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryRationImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryRationImpt(obj) {
    let sqlSelect = `
    Select 编号,户名,装表地点,申请水量,定额,substring(用水日期,1,4)+'.'+substring(用水日期,5,2)+' - '+substring(使用期限,1,4)+'.'+substring(使用期限,5,2) as 起止日期 from 水费单位信息        
        where (扣水单位编号=编号) and 节门状态='开'
        and (编号>=:num1)  and  (编号<=:num2)
        ${obj.kind === '1' ? ' and (申请水量>0)' : ' and (定额>0)'}
        Order by 编号
    `;
    let result = await db.query(
        sqlSelect,
        { replacements: {
            date1 : obj.date1,
            date2 : obj.date2,
            num1 : obj.num1,
            num2 : obj.num2,             
        }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryContract = queryContract;

async function queryContract(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryContractImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryContractImpt(obj) {
    let sqlSelect = `
    Select 编号,户名,联系人,电话 from 水费单位信息
        where (扣水单位编号=编号) and 节门状态='开'
        and (编号>=:num1)  and  (编号<=:num2)
        Order by 编号
    `;
    let result = await db.query(
        sqlSelect,
        { replacements: {
            num1 : obj.num1,
            num2 : obj.num2,             
        }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.queryCountShiZheng = queryCountShiZheng;

async function queryCountShiZheng(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryCountShiZhengImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryCountShiZhengImpt(obj) {
    let sqlSelect, sqlInsert, sqlUpdate, sqlDelete;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    if(obj.recount) {
        sqlDelete = `
            Delete from 水费统计市政公司 where (年=:year) and (月=:month)
        `;
        await db.query( sqlDelete,{ replacements: {year,month}, type: db.QueryTypes.DELETE });
        sqlInsert = `
            Insert into 水费统计市政公司
            SELECT :year, :month,装表地点,用水量,应收水费,0,0,0,'' FROM 水费修改计算 
            where (年=:year) and (月=:month) and 户名 like '%市政%'
        `;
        await db.query( sqlInsert,{ replacements: {year,month}, type: db.QueryTypes.INSERT });
    }
    // sqlUpdate = `
    // update  水费统计市政公司 set 合计=金额+其他+维修费 
    //     where (年=:year) and (月=:month)       
    // `;    
    // await db.query( sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
    sqlSelect = `
    SELECT * FROM  水费统计市政公司 
        where (年=:year) and (月=:month) 
    `;
    let result = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.CountShiZhengToExcel = CountShiZhengToExcel;

async function CountShiZhengToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await CountShiZhengToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function CountShiZhengToExcelImpt(obj) {
    let items;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    obj.recount = false;
    let values = {
        year, month,
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        user : obj.user,         
    };    
    items = await queryCountShiZhengImpt(obj);    
    values.items = items;   
    return toExcel('shizheng1', 'Sheet1', values);
}

module.exports.queryCountAll = queryCountAll;

async function queryCountAll(req, res) {
    let obj = req.body || {};
    try {         
        let result = await queryCountAllImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryCountAllImpt(obj) {
    let sqlSelect, sqlInsert, sqlUpdate, sqlDelete;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    if(obj.recount) {
        sqlDelete = `
            Delete from 水费统计清单  where (年=:year) and (月=:month)
        `;
        await db.query( sqlDelete,{ replacements: {year,month}, type: db.QueryTypes.DELETE });
        sqlInsert = `
        Insert into 水费统计清单 (年,月,收入水量,排污费,水费收入,超额水量,超额水费)
            SELECT :year, :month,sum(用水量),sum(排污费),sum(应收水费),sum(超额水量),sum(超额水费) FROM 水费修改计算 
            where (年=:year) and (月=:month)
        `;
        await db.query( sqlInsert,{ replacements: {year,month}, type: db.QueryTypes.INSERT });
        sqlUpdate = `
        Update 水费统计清单 Set 年累计收入量= 
        (SELECT sum(收入水量)  FROM 水费统计清单 where (年=:year) and (月<=:month))
            where (年=:year) and (月=:month)       
        `;    
        await db.query( sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
        sqlUpdate = `
        Update 水费统计清单 Set 年水费累计收入= 
        (SELECT sum(水费收入)  FROM 水费统计清单 where (年=:year) and (月<=:month))
            where (年=:year) and (月=:month)       
        `;    
        await db.query( sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
        sqlUpdate = `
        Update 水费统计清单 Set 市政公司水费= 
        (SELECT sum(金额)  FROM 水费统计市政公司 where (年=:year) and (月=:month))
            where (年=:year) and (月=:month)       
        `;    
        await db.query( sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
    }    
    sqlSelect = `
    SELECT * FROM  水费统计清单
        where (年=:year) and (月=:month) 
    `;
    let result = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.CountAllToExcel = CountAllToExcel;

async function CountAllToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await CountAllToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function CountAllToExcelImpt(obj) {
    let items, item;
    let year = obj.date.slice(0, 4);
    let month = obj.date.slice(4);
    obj.recount = false;
    let values = {
        year, month,
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        user : obj.user,         
    };    
    items = await queryCountAllImpt(obj); 
    if(items.length > 0) {
        item = items[0];
        values['C3'] = item['收入水量']; //
        values['C4'] = item['年累计收入量']; //
        values['C5'] = item['排污费']; //
        values['C6'] = item['水费收入']; //
        values['C7'] = item['年水费累计收入']; //
        values['C8'] = item['超额水量']; //
        values['C9'] = item['超额水费']; //
        values['C10'] = item['市政公司水费']; //
    }
    values['D4'] = `1-${month}月份`;
    values['D7'] = `1-${month}月份`;
    values['D16'] = obj.user;
    values['D21'] = values.date;
    values.items = items;   
    return toExcel('qingdan1', 'Sheet1', values);
}


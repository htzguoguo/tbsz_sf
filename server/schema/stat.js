const dateFormat = require('dateformat');
const Helper = require( '../modules/http_helper' );
const db = require('./tbszSqlConnection');
const {toExcel} = require('../modules/excel_helper');

module.exports.queryStatTollStatus = queryStatTollStatus;

async function queryStatTollStatus(req, res) {
    let { date } = req.params;
    try {         
        let result = await queryStatTollStatusImpt(date);
        Helper.ConvertNullToZeroString(result);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, date );
    }
}

async function queryStatTollStatusImpt(date) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let sqlStat1 = `
    SELECT 购水日期1, 购水量1, 购水单价1, 购水费1, 购水日期2, 购水量2, 购水单价2, 购水费2,统计标志  from 水费统计总表
        where 年=:year and 月=:month
    `;
    let result = await db.query(
        sqlStat1,
        { replacements: { year, month }, type: db.QueryTypes.SELECT }
    );
    return result;
}

module.exports.handleStatToll = handleStatToll;

async function handleStatToll(req, res) {
    let obj = req.body || {};
    try {         
        await handleStatTollImpt(obj);
        let result = await queryStatTollStatusImpt(obj.用水日期);
        Helper.ConvertNullToZeroString(result);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function handleStatTollImpt(obj) {
    let date = obj.用水日期;
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let AA = Array.apply(null, Array(31)).map(function() { return '' });
    let FF = Array.apply(null, Array(61)).map(function() { return 0 });
    let II = Array.apply(null, Array(11)).map(function() { return 0 });
    
    //删除原有统计数据
    let sqlDelete = `
    Delete from 水费统计总表 where 年=:year and 月=:month
    `;
    await db.query(
        sqlDelete,
        { replacements: { year, month }, type: db.QueryTypes.DELETE }
    );
    //插入新记录
    let sqlInsert = `
    insert into 水费统计总表 (年,月) values (:a1,:a2)
    `;
    await db.query(
        sqlInsert,
        { replacements: {a1 : year,a2 : month }, type: db.QueryTypes.INSERT }
    );
    //更新购水量
    let sqlUpdate = `
    update 水费统计总表 set 购水日期1=:a3,购水量1=:a4,购水单价1=:a5,购水费1=:a6,购水日期2=:a7,购水量2=:a8,购水单价2=:a9,购水费2=:a10 
        where 年=:a1 and 月=:a2 
    `;
    await db.query(
        sqlUpdate,
        { 
            replacements: {
                a1 : year,
                a2 : month,
                a3 : obj.购水日期1,
                a4 : obj.购水量1,
                a5 : obj.购水单价1,
                a6 : obj.购水费1,
                a7 : obj.购水日期2,
                a8 : obj.购水量2,
                a9 : obj.购水单价2,
                a10 : obj.购水费2
            },
            type: db.QueryTypes.UPDATE }
    );
    FF[1]  =  parseFloat(obj.购水量1)  + parseFloat(obj.购水量2); //购水量
    FF[2]  =  parseFloat(obj.购水费1)+ parseFloat(obj.购水费2); //购水费
    //第三步，按收费标准统计各类水费
    //先统计各类明细
    sqlDelete = `
    Delete from 水费统计水费标准 where 年=:year and 月=:month
    `;
    await db.query(
        sqlDelete,
        { replacements: { year, month }, type: db.QueryTypes.DELETE }
    );
    sqlInsert = `
    Insert into 水费统计水费标准 (年,月,区号,单位类型,水费标准,用水量,计划水费,超额水费,防火费,手续费,其它,水费收入,排污费,备注) 
        SELECT :year,:month,区号,单位类别,单价,sum(用水量-减免水量) as 用水量,sum(计划水费-减免水费) as 计划水费,sum(超额水费) ,sum(防火费),sum(手续费),
        sum(其它),sum(实收水费),sum(排污费-减排污费) as 排污费,'' FROM 水费统计查询
        where (年=:year) and (月=:month)  
        group by 区号,单位类别,单价
    `;
    await db.query(
        sqlInsert,
        { replacements: {year,month }, type: db.QueryTypes.INSERT }
    );
    //计算百分比
    let sqlSelect = `
    Select sum(用水量) as a1,sum(水费收入) as a2 from  水费统计水费标准
        where (年=:year) and (月=:month)
    `;
    let items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    AA[1] = items[0].a1;
    AA[2] = items[0].a2;
    sqlUpdate = `
    update  水费统计水费标准  
        set 总水量百分比=用水量*100/${AA[1]},总水费百分比=水费收入*100/${AA[2]} 
        where (年=:year) and (月=:month)
    `;
    await db.query(
        sqlUpdate,
        { replacements: {year,month }, type: db.QueryTypes.UPDATE }
    );
    //第四步,统计销售水清单
    sqlSelect = `
    Select count(distinct 编号) as 用户数,sum(用水量-减免水量) as 供水量,sum(计划水量-减免水量) as 计划水量,sum(计划水费-减免水费) as 计划水费,sum(超额水量) as 超额水量,
        sum(超额水费) as 超额水费,sum(排污费-减排污费) as 排污费,sum(防火费) as 防火费,sum(手续费) as 手续费,sum(其它-减其它) as 其它,sum(实收水费) as 水费
        from 水费统计查询
        where (年=:year) and (月=:month)
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    II[1]  =  parseInt(items[0]['用户数']);      
    FF[3]  =  parseFloat(items[0]['供水量']);
    FF[4]  =  parseFloat(items[0]['计划水量']);
    FF[5]  =  parseFloat(items[0]['计划水费']);

    FF[6]  =  parseFloat(items[0]['超额水量']);
    FF[7]  =  parseFloat(items[0]['超额水费']);
    FF[8]  =  parseFloat(items[0]['排污费']);
    FF[9]  =  parseFloat(items[0]['防火费']);
    FF[10] =  parseFloat(items[0]['手续费']);

    FF[11] =  parseFloat(items[0]['其它']);
    FF[12] =  parseFloat(items[0]['水费']);
    FF[13] =  FF[1]-FF[3];               //与塘沽水量差额
    if (FF[1] != 0) {
        FF[14] =  FF[13]/FF[1]            //水损率
    }else{
        FF[14] =  0;
    }

    sqlSelect = `
    Select count(distinct 编号) as 正式用户数
        from 水费统计查询
        where (年=:year) and (月=:month) and  用水形式编号='2'
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    II[2]  =  parseInt(items[0]['正式用户数']); 

    sqlSelect = `
    Select count(distinct 编号) as 临时用户数
        from 水费统计查询
        where (年=:year) and (月=:month) and  用水形式编号='0'
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    II[3]  =  parseInt(items[0]['临时用户数']);
    if (II[1]  !=  II[2]+II[3]) {
        throw new Error('用户数计算错误');
    } 
    sqlUpdate = `
    update 水费统计总表 set 用户个数=:a3,正式个数=:a4,临时个数=:a5,供水量=:a6,水费=:a7,计划水量=:a8,计划水费=:a9,超额水量=:a10,超额水费=:a11,排污费=:a12,防火费=:a13,
        手续费=:a14,其它=:a15,与供水差值=:a16,水损率=:a17
        where 年=:a1 and 月=:a2
    `;
    await db.query(
        sqlUpdate,
        { 
            replacements: {
                a1 : year,
                a2 : month,
                a3 : II[1],
                a4 : II[2],
                a5 : II[3],
                a6 : FF[3],
                a7 : FF[12],
                a8 : FF[4],
                a9 : FF[5],
                a10 : FF[6],
                a11 :  FF[7], //排污费
                a12 : FF[8],
                a13 : FF[9],
                a14 : FF[10],
                a15 : FF[11],//其它
                a16 : FF[13],
                a17 : FF[14] //水损率
            },
            type: db.QueryTypes.UPDATE }
    );
    //第五步，统计市政公司用水
    sqlDelete = `
    Delete from 水费统计市政公司 where 年=:year and 月=:month
    `;
    await db.query(
        sqlDelete,
        { replacements: { year, month }, type: db.QueryTypes.DELETE }
    );
    sqlInsert = `
    insert into 水费统计市政公司
        Select distinct :year,:month,REPLACE(SUBSTRING(户名, 10, 30), '）', ''),SUM(用水量),SUM(实收水费),''
        From 水费报表查询 where (年=:year) and (月=:month) and 户名 like '%天保市政%'
        Group by REPLACE(SUBSTRING(户名, 10, 30), '）', '')
    `;
    await db.query(
        sqlInsert,
        { replacements: {year,month }, type: db.QueryTypes.INSERT }
    );
    //第六步，统计水费明细
    //此部分无需统计，直接查询即可

    //第七步，统计生产经营,托收水费，支票水费，内结水费，正式水费，临时水费
    let I = 1;
    sqlSelect = `
    select sum(实收水费) as a1 from 水费统计查询 where (年=:year) and (月=:month)
        group by 收费形式编号
    `;    
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    I = 1;
    items.forEach(item => {
        FF[I+14] = parseFloat(item.a1);
        I += 1;
    });
    sqlSelect = `
    select sum(实收水费) as a1 from 水费统计查询 where (年=:year) and (月=:month)
        group by 用水形式编号
    `;    
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    I = 1;
    items.forEach(item => {
        FF[I+17] = parseFloat(item.a1);
        I += 1;
    });
    sqlUpdate = `
    update 水费统计总表 set 托收水费=:a3,支票水费=:a4,内结水费=:a5,临时水费=:a6,正式水费=:a7
        where 年=:a1 and 月=:a2
    `;
    await db.query(
        sqlUpdate,
        { 
            replacements: {
                a1 : year,
                a2 : month,
                a3 : FF[15],
                a4 : FF[16],
                a5 : FF[17],
                a6 : FF[18],
                a7 : FF[19],               
            },
            type: db.QueryTypes.UPDATE }
    );
    sqlUpdate = `
        update 水费统计总表 set 统计标志=:a18
            where 年=:a1 and 月=:a2
        `;
        await db.query(
            sqlUpdate,
            { 
                replacements: {
                    a1 : year,
                    a2 : month,
                    a18 : 8           
                },
                type: db.QueryTypes.UPDATE }
        );
    //第八步 生产简报 报表
    if (obj.简报) {
        //删除老记录
        sqlDelete = `
        delete from  水费统计简报 where 年=:year and 月=:month
        `;
        await db.query(
            sqlDelete,
            { replacements: { year, month }, type: db.QueryTypes.DELETE }
        );
        //生成新增用户
        sqlSelect = `
        Select top 12 编号,用水量 from 水费基本表 
            where 年=:year and 月=:month
            and  编号 not in (Select distinct 编号 from 水费基本表 where  年=:year1 and 月=:month) 
            order by 用水量 desc
        `;    
        items = await db.query(
            sqlSelect,
            { replacements: {year,month, year1 : (parseInt(year) - 1).toString()  }, type: db.QueryTypes.SELECT }
        );
        I = 1;
        items.forEach(item => {
            AA[I] = item.编号;
            FF[I+20] = parseFloat(item.用水量);
            I += 1;
        });
        //生成大用户用水
        //删除统计用电中转_临时
        sqlDelete = `
        delete from 水费统计用水增长_中转 
        `;
        await db.query(
            sqlDelete,
            { replacements: { year, month }, type: db.QueryTypes.DELETE }
        );
        sqlInsert = `
        insert into 水费统计用水增长_中转 (编号,本月用水) 
            Select 编号,用水量 from 水费基本表 
            where (年=:year) and (月=:month)  
            order by 用水量 desc 
        `;
        await db.query(
            sqlInsert,
            { replacements: {year,month }, type: db.QueryTypes.INSERT }
        );
        //查询去年用水
        sqlUpdate = `
        update 水费统计用水增长_中转 set 去年用水= 
            (Select top 1 用水量 from 水费基本表
            where 年=:year and 月=:month    
            and  编号=水费统计用水增长_中转.编号  order by  用水量 desc)
        `;
        await db.query(
            sqlUpdate,
            { 
                replacements: {
                    year : (parseInt(year) - 1).toString(),
                    month           
                },
                type: db.QueryTypes.UPDATE }
        );
        //查询老用户增长
        sqlSelect = `
        Select top 12 编号,本月用水,去年用水   from 水费统计用水增长_中转 
            order by 本月用水-去年用水 desc
        `;    
        items = await db.query(
            sqlSelect,
            { replacements: {}, type: db.QueryTypes.SELECT }
        );
        I = 1;
        items.forEach(item => {           
            AA[I+12] = item.编号;
            FF[I+32] = parseFloat(item.本月用水);
            FF[I+44] = parseFloat(item.去年用水);
            I += 1;
        });
        //插入记录
        for(I = 1; I <= 12; I++) {
            sqlInsert = `
            insert into  水费统计简报 (年,月,内部序号,新用户编号,新用户用水量,老用户编号,老用户本月水量,老用户去年水量) 
                values (:a1,:a2,:a3,:a4,:a5,:a6,:a7,:a8)
            `;
            await db.query(
                sqlInsert,
                { 
                    replacements: {
                        a1 : year,
                        a2 : month,
                        a3 : I,
                        a4 : AA[I],
                        a5 : FF[I+20],
                        a6 : AA[I+12],
                        a7 : FF[I+32],
                        a8 : FF[I+44]  
                    },
                    type: db.QueryTypes.INSERT }
            );
        }
        //更新修改标志
        sqlUpdate = `
        update 水费统计总表 set 统计标志=:a18
            where 年=:a1 and 月=:a2
        `;
        await db.query(
            sqlUpdate,
            { 
                replacements: {
                    a1 : year,
                    a2 : month,
                    a18 : 9           
                },
                type: db.QueryTypes.UPDATE }
        );
    }
    return true;
}

module.exports.JingYingToExcel = JingYingToExcel;

async function JingYingToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await JingYingToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function JingYingToExcelImpt(date, userName) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let values = {
        date : `${year}年${month}月`
    };
    let sqlSelect = `
    Select * from 水费统计总表 where (年=:year) and (月=:month)
    `;
    let items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    let item = items[0];
    values['D4'] = (parseFloat(item['购水量1']) + parseFloat(item['购水量2'])).toString(); //
    values['D5'] = (parseFloat(item['购水费1']) + parseFloat(item['购水费2'])).toString();  
    values['D6'] = item['供水量']; //
    values['D8'] = item['计划水费']; //
    values['D9'] = item['超额水费']; //
    values['D10']  = item['防火费']; //
    values['D11']  = item['手续费']; //
    values['D12']  = item['其它']; //
    values['D13']  = item['排污费']; //
    values['D15']  = item['托收水费']; //
    values['D16']  = item['支票水费']; //
    values['D17'] = item['内结水费']; //
    values['D19'] = item['临时水费']; //
    values['D20']  = item['正式水费']; //
    values['D21']  = item['用户个数']; //
    values['D22']  = item['临时个数']; //
    values['D23']  = item['正式个数']; //
    values['D24']  = (parseFloat(item['水损率'])*100).toString() + '%'; // 

    sqlSelect = `
    Select sum(购水量1+购水量2) as 购水量   ,  sum(购水费1+购水费2) as 购水费 , sum(供水量) as 供水量 , 
        sum(计划水费) as 计划水费 , sum(超额水费) as 超额水费  , sum(防火费) as 防火费   , sum(手续费) as 手续费   , sum(其它) as 其它     , sum(排污费) as 排污费,  
        sum(托收水费) as 托收水费 , sum(支票水费) as 支票水费  , sum(内结水费) as 内结水费 , sum(临时水费) as 临时水费 , sum(正式水费) as 正式水费     , sum(用户个数) as 用户个数, 
        sum(临时个数) as 临时个数 , sum(正式个数) as 正式个数
        from 水费统计总表 
        where (年=:year) and (月=:month)
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    item = items[0];
    values['E4'] = item['购水量']; //
    values['E5'] = item['购水费']; //
    values['E6'] = item['供水量']; //
    values['E8'] = item['计划水费']; //
    values['E9'] = item['超额水费']; //
    values['E10'] = item['防火费']; //
    values['E11'] = item['手续费']; //
    values['E12'] = item['其它']; //
    values['E13'] = item['排污费']; //
    values['E15'] = item['托收水费']; //
    values['E16'] = item['支票水费']; //
    values['E17'] = item['内结水费']; //
    values['E19'] = item['临时水费']; //
    values['E20'] = item['正式水费']; //
    values['E21'] = (Math.round(parseFloat(item['用户个数'])/parseFloat(month) ) ); //
    values['E22'] = (Math.round(parseFloat(item['临时个数'])/parseFloat(month) ) ); //
    values['E23'] = (Math.round(parseFloat(item['正式个数'])/parseFloat(month) ) ); //
    if(parseFloat(item['购水量']) === 0) {
        values['E24'] = '0%'; // 
    }else {
        values['E24'] = ((parseFloat(item['购水量']) - parseFloat(item['供水量'])) / parseFloat(item['购水量']) * 100 ).toString() + '%'; // 
    }
    values['E25'] = userName;
    values['E27'] = dateFormat(new Date(), "yyyy-mm-dd");
    return toExcel('JingYing', 'Sheet1', values);
}

module.exports.StandardToExcel = StandardToExcel;

async function StandardToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await StandardToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function StandardToExcelImpt(date, userName) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let values = {
        date : `${year}年${month}月`,

    };
    let sqlSelect = `
    Select * from 水费统计水费标准 where (年=:year) and (月=:month) order by 区号
    `;
    let items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    items.forEach(
        item => {
            item.总水量百分比 /= 100;
            item.总水费百分比 /= 100;
        }
    );
    values.items = items;
    values['D13'] = userName;
    values['G13'] = dateFormat(new Date(), "yyyy-mm-dd");
    return toExcel('standard', 'Sheet1', values);
}

module.exports.DetailToExcel = DetailToExcel;

async function DetailToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await DetailToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function DetailToExcelImpt(date, userName) {
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let values = {
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        year,
        month
    };
    let sqlSelect = `
    Select * from 水费统计明细查询  where (年=:year) and (月=:month) 
    `;
    let items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    let len = items.length;
    items.push(
        {
            编号 : '合计',
            户名 : `${len}户`,
            实际用水量 : `=SUM(C4:C${3 + len})`,
            实际计划水费 : `=SUM(D4:D${3 + len})`,
            超额水费 : `=SUM(E4:E${3 + len})`,
            排污费 : `=SUM(F4:F${3 + len})`,
            防火费 : `=SUM(G4:G${3 + len})`,
            手续费 : `=SUM(H4:H${3 + len})`,
            其它 : `=SUM(I4:I${3 + len})`,
            减水费 : `=SUM(J4:J${3 + len})`,
            实收水费 : `=SUM(K4:K${3 + len})`,
        }
    );
    values.items = items;
    values['D13'] = userName;
    values['G13'] = dateFormat(new Date(), "yyyy-mm-dd");
    return toExcel('Detail', 'Sheet1', values);
}

module.exports.JianBaoToExcel = JianBaoToExcel;

async function JianBaoToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await JianBaoToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function JianBaoToExcelImpt(date, userName) {
    let items, item;
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let FF = Array.apply(null, Array(11)).map(function() { return 0 });
    let values = {
        A2 : `${year}年${month}月`,
        G24 : dateFormat(new Date(), "yyyy-mm-dd"),
        E24 : userName,
    };
    //查询今年售水量
    let sqlSelect = `
    SELECT 供水量,水损率 from  水费统计总表  where (年=:year) and (月=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    item = items[0];
    FF[1]  = (parseFloat(item.供水量)/10000).toFixed(2);//供水量
    FF[2]  = parseFloat(item.水损率)*100;//变损率
    //查询去年同期水量
    sqlSelect = `
    SELECT 供水量 from  水费统计总表  where (年=:year) and (月=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year : (parseInt(year) - 1).toString(),month }, type: db.QueryTypes.SELECT }
    );
    if(items.length > 0) {
        item = items[0];
        FF[3]  =(parseFloat(item.供水量)/10000).toFixed(2);
    }else {
        FF[3]  = 20; //临时,因为有可能去年没有数
    }
    //查询水量总和
    sqlSelect = `
    SELECT  sum(供水量) as 供水量 from  水费统计总表 where (年=:year) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year}, type: db.QueryTypes.SELECT }
    );
    item = items[0];
    FF[4]  = (parseFloat(item.供水量)/10000).toFixed(2);
    FF[5]  =Math.round((FF[1]-FF[3])/FF[3]*100);
    values['A3']  ='一、'+ month.toString() +'月份供水量'+parseFloat(FF[1])+'万吨，本年累计完成'+parseFloat(FF[4])+'万吨。';
    values['A4']  ='    去年同期供水量'+parseFloat(FF[3])+'万吨，比去年同期增长'+parseFloat(FF[5])+'%  。';
    values['A20']  ='二、本月水损率'+parseFloat(FF[2])+'%，符合行业规定指标损耗范围。';
    //新增用户用水量
    sqlSelect = `
    Select top 6 * from 水费统计简报查询 where 年=:year and 月=:month and 新用户名称 is not null order by 新用户用水量 desc
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    let I = 7;
    items.forEach(
        item => {
            values['B'+ I.toString()] = (I-6).toString() +'. '+item['新用户名称'] +':本月'+item['新用户用水量']+'吨。'; 
            I += 1;
        }
    );
    //老用户增加水量
    sqlSelect = `
    Select top 6  * from 水费统计简报查询 where 年=:year and 月=:month and 老用户名称 is not null  order by 老用户本月水量 desc
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    I = 14;
    items.forEach(
        item => {
            values['B'+ I.toString()] = (I-13).toString() +'. ' + item['老用户名称']+':本月'+item['老用户本月水量']+'吨，去年同期'+item['老用户去年水量']+'吨。';
            I += 1;
        }
    );
    return toExcel('JianBao', 'Sheet1', values);
}

module.exports.QingDanToExcel = QingDanToExcel;

async function QingDanToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await QingDanToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function QingDanToExcelImpt(date, userName) {
    let items, item;
    let year = date.slice(0, 4);
    let month = date.slice(4);
    let FF = Array.apply(null, Array(11)).map(function() { return 0 });
    let values = {
        A1 : `${year}年${month}月`, 
        E30 : dateFormat(new Date(), "yyyy-mm-dd"),
        E28 : userName   
    };
    let sqlSelect = `
    Select * from 水费统计总表   where (年=:year) and (月=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    item = items[0];
    values['D5'] = item['购水量1']; //
    values['D6'] = item['购水量2'];
    values['D8'] = item['购水费1'];
    values['D9'] = item['购水费2'];
    values['D10'] = item['供水量'];
    values['D11'] = item['超额水量'];
    values['D13'] = item['计划水费'];
    values['D14'] = item['超额水费'];
    values['D15'] = item['防火费'];
    values['D16'] = item['手续费'];
    values['D17'] = item['其它'];
    values['D18'] = item['排污费'];
    //年统计值
    sqlSelect = `
    Select sum(购水量1) as 购水量1   , sum(购水量2) as 购水量2    , sum(购水费1) as 购水费1 , sum(购水费2) as 购水费2 , sum(供水量) as 供水量 , sum(超额水量) as 超额水量,
        sum(计划水费) as 计划水费 , sum(超额水费) as 超额水费  , sum(防火费) as 防火费   , sum(手续费) as 手续费   , sum(其它) as 其它     , sum(排污费) as 排污费 
        from 水费统计总表 where (年=:year) and (月<=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    item = items[0];
    values['E5'] = item['购水量1']; //
    values['E6'] = item['购水量2']; //
    values['E8'] = item['购水费1']; //
    values['E9'] = item['购水费2']; //
    values['E10'] = item['供水量']; //
    values['E11'] = item['超额水量']; //
    values['E13'] = item['计划水费']; //
    values['E14'] = item['超额水费']; //
    values['E15'] = item['防火费']; //
    values['E16'] = item['手续费']; //
    values['E17'] = item['其它']; //
    values['E18'] = item['排污费']; //
    //市政用水
    sqlSelect = `
    Select * from 水费统计市政公司 where (年=:year) and (月<=:month) order by 部门 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    let I = 20;
    items.forEach(
        item => {
            values['B'+ I.toString()] = item['部门']; //
            values['D'+ I.toString()] = item['金额']; //
            I += 1;
        }
    );
    //市政用水统计
    sqlSelect = `
    Select 部门,sum(金额) as 金额 from 水费统计市政公司 where (年=:year)  group by 部门 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year}, type: db.QueryTypes.SELECT }
    );
    I = 20;
    items.forEach(
        item => {
            //values['F'+ I.toString()] = item['部门']; //
            values['E'+ I.toString()] = item['金额']; //
            I += 1;
        }
    );
    return toExcel('qingdan', 'Sheet1', values);
}

module.exports.GongYeToExcel = GongYeToExcel;

async function GongYeToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await GongYeToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function GongYeToExcelImpt(date, userName) {
    let items, item;
    let year = date.slice(0, 4);
    let month = date.slice(4);     
    let values = {
        date : `${year}年${month}月`
    };
    let sqlSelect = `
    Select * from 水费统计查询 where (年=:year) and (月=:month) and (区号='2' or 区号='7') order by 编号
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month }, type: db.QueryTypes.SELECT }
    );
    let I = 1;
    items.forEach(
        item => {
            item.序号 = I;
            item.年 = year;
            item.月 = month;
            I += 1;
        }
    );
    items.push(
        {
            序号 : '合计',
            用水量 : `=SUM(F3:F${items.length + 2})`
        }
    );
    values.items = items;
    return toExcel('GongYe', 'Sheet1', values);
}

module.exports.ShuiSunToExcel = ShuiSunToExcel;

async function ShuiSunToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ShuiSunToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ShuiSunToExcelImpt(date, userName) {
    let items, item;
    let year = date.slice(0, 4);
    let month = date.slice(4); 
    let FF = Array.apply(null, Array(31)).map(function() { return 0 });    
    let values = {
        B2 : `${year}年`
    };
    let sqlSelect = `
    Select * from 水费统计总表 where (年=:year) order by 月
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year}, type: db.QueryTypes.SELECT }
    );
    let I = 1;
    items.forEach(
        item => {
            let m = parseInt(item.月);
            FF[m]    = (parseFloat(item['购水量1']) + parseFloat(item['购水量2']))/10000;
            FF[m+12] = parseFloat(item['供水量'])/10000;

            //FF[I]    = (parseFloat(item['购水量1']) + parseFloat(item['购水量2']))/10000;
            //FF[I+12] = parseFloat(item['供水量'])/10000;
            //I += 1;
        }
    );
    values['B4']   = parseFloat(FF[1]); //
    values['C4']   = parseFloat(FF[2]); //
    values['D4']   = parseFloat(FF[3]); //
    values['E4']   = parseFloat(FF[4]); //
    values['F4']   = parseFloat(FF[5]); //
    values['G4']   = parseFloat(FF[6]); //
    values['H4']   = parseFloat(FF[7]); //
    values['I4']   = parseFloat(FF[8]); //
    values['J4']   = parseFloat(FF[9]); //
    values['K4']   = parseFloat(FF[10]); //
    values['L4']   = parseFloat(FF[11]); //
    values['M4']   = parseFloat(FF[12]); //
    values['B5']   = parseFloat(FF[13]); //
    values['C5']   = parseFloat(FF[14]); //
    values['D5']   = parseFloat(FF[15]); //
    values['E5']   = parseFloat(FF[16]); //
    values['F5']   = parseFloat(FF[17]); //
    values['G5']   = parseFloat(FF[18]); //
    values['H5']   = parseFloat(FF[19]); //
    values['I5']   = parseFloat(FF[20]); //
    values['J5']   = parseFloat(FF[21]); //
    values['K5']   = parseFloat(FF[22]); //
    values['L5']   = parseFloat(FF[23]); //
    values['M5']   = parseFloat(FF[24]); //    
    return toExcel('ShuiSun', 'sheet1', values);
}

module.exports.ShiZhengToExcel = ShiZhengToExcel;

async function ShiZhengToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await ShiZhengToExcelImpt(obj.用水日期, obj.user);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ShiZhengToExcelImpt(date, userName) {
    let items, item;
    let year = date.slice(0, 4);
    let month = date.slice(4); 
    let FF = Array.apply(null, Array(31)).map(function() { return 0 });    
    let values = {
        date : `${year}年${month}月`
    };
    let sqlSelect = `
    Select * from 水费统计市政公司  where (年=:year) and (月=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    let len = items.length;
    items.push(
        {
            部门 : '合计',
            实际用水 : `=SUM(B4:B${len + 3})`,
            金额 : `=SUM(C4:C${len + 3})`
        }
    );
    values.items = items;   
    return toExcel('shizheng', 'Sheet1', values);
}

module.exports.LackUnitToExcel = LackUnitToExcel;

async function LackUnitToExcel(req, res) {
    let obj = req.body || {};
    try {       
        let wb = await LackUnitToExcelImpt(obj);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
        res.end( new Buffer(wb, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function LackUnitToExcelImpt(obj) {
    let items;
    let year = obj.月份.slice(0, 4);
    let month = obj.月份.slice(4);
    let values = {
        year,
        month,
        date : dateFormat(new Date(), "yyyy-mm-dd"),
        user : obj.user
    };
    let sqlSelect = `
    Select * from 水费统计欠费  where (年=:year) and (月=:month) 
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {year, month}, type: db.QueryTypes.SELECT }
    );
    let len = items.length;
    items.push(
        {
            编号 : '合计',
            户名 : `${len}户`,
            往年欠费 : `=SUM(C4:C${len + 3})`,
            本月欠费 : `=SUM(D4:D${len + 3})`,
            前几月累计 : `=SUM(E4:E${len + 3})`,
            小计 : `=SUM(F4:F${len + 3})`,
            备注 : ''
        }
    );
    values.items = items;   
    return toExcel('lackunit', 'Sheet1', values);
}

module.exports.handleLackUnit = handleLackUnit;

async function handleLackUnit(req, res) {
    let obj = req.body || {};
    try {         
        let result = await handleLackUnitImpt(obj);
        Helper.ConvertNullToZeroString(result);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function handleLackUnitImpt(obj) {
    let items, item;
    let date = obj.月份;
    let options = obj.统计选项;
    let year = date.slice(0, 4);
    let month = date.slice(4); 
    let TempYear, TempMonth;
    let sqlDelete, sqlInsert, sqlUpdate, sqlSelect;
    if(month === '01') {
        TempYear = (parseInt(year) -1 ).toString();
        TempMonth = '12';
    }else {
        TempYear = year;
        TempMonth = (parseInt(month) - 1).toString();
        TempMonth = TempMonth.length < 2 ? '0' + TempMonth : TempMonth;
    }
    if(options.indexOf('1') !== -1) {
        sqlDelete = `
        Delete from  水费统计欠费 where 年=:year and 月=:month
        `;
        await db.query(
            sqlDelete,
            { replacements: { year, month }, type: db.QueryTypes.DELETE }
        );
        //从表中选取上月数据
        sqlInsert = `
        Insert into 水费统计欠费 (年,月,编号,户名,往年欠费,本月欠费,前几月累计,小计,备注)
        `;
        if(month === '01') {
            sqlInsert += `
            SELECT :year,:month,编号,户名,往年欠费+本月欠费+前几月累计,0,0,0,备注 FROM 水费统计欠费 
            `;
        }else {
            sqlInsert += `
            SELECT :year,:month,编号,户名,往年欠费,0,本月欠费+前几月累计,0,备注 FROM 水费统计欠费 
            `;
        }
        sqlInsert += `
        where  年=:TempYear and 月=:TempMonth
            `;
        await db.query(
            sqlInsert,
            { replacements: {year,month, TempYear, TempMonth }, type: db.QueryTypes.INSERT }
        );  
        //插入本月新增数据
        sqlInsert = `
        Insert into 水费统计欠费 (年,月,编号,户名,往年欠费,本月欠费,前几月累计,小计,备注)
            SELECT :year, :month, 编号,户名,0,实收水费,0,0,'自动计算' FROM 水费基本表
            Where 编号 not in (Select 编号 from 水费统计欠费 where 年=:year and 月=:month) and 欠费标志='2' and 年=:year and 月=:month
        `;
        await db.query(
            sqlInsert,
            { replacements: {year, month}, type: db.QueryTypes.INSERT }
        ); 
        //将本月新增数据的往年欠费累计
        sqlUpdate = `
        update 水费统计欠费 set 往年欠费=(Select Sum (实收水费) FROM 水费基本表 where 欠费标志='2' and 年<:year and 编号=水费统计欠费.编号)
            where 年=:year and 月=:month and 备注='自动计算'
        `;
        await db.query(sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE }); 
        //计算本月欠费,不论是老数据或是新数据都是这样算
        sqlUpdate = `
        update 水费统计欠费 set 本月欠费=(Select Sum (实收水费) FROM 水费基本表 where 欠费标志='2' and 年=:year and 编号=水费统计欠费.编号 and 月=:month) 
            where 年=:year and 月=:month 
        `;
        await db.query(sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE }); 
        //计算新增加的前几月欠费
        if (month === '01') {
            sqlUpdate = `
            update 水费统计欠费 set 前几月欠费=0 
            `;
        }else{
            sqlUpdate = `
            update 水费统计欠费 set 前几月累计=(Select Sum (实收水费) FROM 水费基本表 where 欠费标志='2' and 年=:year and 编号=水费统计欠费.编号 and 月<:month)
            `;
        }
        sqlUpdate += `
        where 年=:year and 月=:month and 备注='自动计算'
            `;
        await db.query(sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
        //下面为了将所有为null的改成0
        let fields = ['往年欠费', '本月欠费', '前几月累计', '小计'];
        for(let i = 0; i < fields.length; i++) {
            sqlUpdate = `
                update 水费统计欠费 set ${fields[i]}=0 where ${fields[i]} is null 
                `;
                await db.query(sqlUpdate,{ replacements: {}, type: db.QueryTypes.UPDATE });
        }
    }
    if(options.indexOf('2') !== -1) {
        sqlUpdate = `
        Update 水费统计欠费
            Set 小计=往年欠费+本月欠费+前几月累计
            where 年=:year and 月=:month
            `;
        await db.query(sqlUpdate,{ replacements: {year,month}, type: db.QueryTypes.UPDATE });
    }
    sqlSelect = `
    Select * from  水费统计欠费
        where  年=:year and 月=:month
            `;
    items = await db.query(
        sqlSelect,
        { replacements: {year,month}, type: db.QueryTypes.SELECT }
    ); 
    return items;
}

module.exports.deleteLackUnit = deleteLackUnit;

async function deleteLackUnit(req, res) {
    let {date, num} = req.params;
    try {         
        let result = await deleteLackUnitImpt(date, num);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, {date, num} );
    }
}

async function deleteLackUnitImpt(date, num) {    
    let year = date.slice(0, 4);
    let month = date.slice(4); 
    let TempYear, TempMonth;
    let sqlDelete;
    sqlDelete = `
    Delete from 水费统计欠费 where 年=:year and 月=:month and 编号=:num
    `;
    let result = await db.query(
        sqlDelete,
        { replacements: { year, month, num }, type: db.QueryTypes.DELETE }
    );
    return result;
}
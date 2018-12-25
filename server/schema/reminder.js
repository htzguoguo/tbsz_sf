const dateFormat = require('dateformat');
const nzhcn = require("nzh/cn");
const moment = require('moment');
const BigNumber = require('bignumber.js');
const Helper = require( '../modules/http_helper' );
const {sendSMS} = require('../modules/sms_helper');
const db = require('./tbszSqlConnection');
const {toWord} = require('../modules/word_helper');
const PENALTY_RATE = 0.005;
module.exports.queryReminder = queryReminder;
BigNumber.config({ DECIMAL_PLACES: 2 })

async function queryReminder(req, res) {
  let obj = req.body || {};
    try {         
        let result = await queryReminderImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, obj );
    }
}

async function queryReminderImpt(obj) {
  let date1 = obj.date1;
  let date2 = obj.date2;
  let num = obj.编号;
    let items;
    const cur = moment();
    let sqlSelect = `
    select 编号, 户名, 年, 月, 实收水费
        from dbo.水费基本表
        where (年+月>=:date1) and (年+月<=:date2) and 欠费标志 = '2'
        ${num && num.length > 0 ? `and (编号=${num})` : ''}
        order by 编号, 年,月
    `;
    items = await db.query(
        sqlSelect,
        { replacements: {date1, date2}, type: db.QueryTypes.SELECT }
    );
    let dict = new Map();
    items.forEach(
        item => {
            let key = item.编号;
            if(dict.has(key)) {
                let pen = calPenalty(cur, item);
                let value = dict.get(key);
                value.年1 = parseInt(value.年1) > parseInt(item.年) ? item.年 : value.年1;
                value.月1 = parseInt(value.年1) >= parseInt(item.年) 
                && parseInt(value.月1) >= parseInt(item.月) ? item.月 : value.月1;
                value.年2 = parseInt(value.年1) < parseInt(item.年) ? item.年 : value.年1;
                value.月2 = parseInt(value.年1) <= parseInt(item.年) 
                && parseInt(value.月1) <= parseInt(item.月) ? item.月 : value.月1;
                value.实收水费 = addBy(item.实收水费, value.实收水费);
                value.滞纳金 = addBy(pen, value.滞纳金);
                value.合计 = addBy(value.合计, addBy(item.实收水费, pen));
                value.月数 += 1
            }else {
                let pen = calPenalty(cur, item);
                dict.set(key, {
                    编号 : item.编号,
                    户名 : item.户名,
                    年1 : item.年,
                    月1 : item.月,
                    年2 : item.年,
                    月2 : item.月,
                    实收水费  : item.实收水费,
                    滞纳金  : pen,
                    合计 : addBy(item.实收水费, pen),
                    月数 : 1
                })
            }
        }
    ); 
    let result = [];   
    for(let item of dict){
        result.push(item[1]);
    }
    return result;
}

function addBy(num1, num2) {
    return parseFloat((num1 + num2).toFixed(10)) 
}

function calPenalty(cur, item) {
    let month = item.月;
    let year = item.年;
    let dd;
    if(month === '12') {
        dd = moment(`01-10-${parseInt(year) + 1}`, "MM-DD-YYYY");
    }else {
        dd = moment(`${parseInt(month) + 1}-10-${year}`, "MM-DD-YYYY");
    }
    let days = cur.diff(dd, 'days');
    let result = calCompoundInterest(item.实收水费, PENALTY_RATE, days )
    result = result - parseFloat(item.实收水费);
    result = Math.round( result * 1e2 ) / 1e2;
    return result;
}

function calCompoundInterest(investment, rate, days) {
    let futureValue = parseFloat(investment);
    for (let i = 1; i <= days; i++ ) {
        futureValue = (futureValue) * (1 + rate);
    }
    return futureValue;
}

module.exports.sendReminderSMS = sendReminderSMS;

async function sendReminderSMS(req, res) {
    let obj = req.body || {};
    try {         
        let result = await sendReminderSMSImpt(obj);
        Helper.ResourceFound( res, result );
    }catch(ex) {
        Helper.InternalServerError( res, ex, { obj} );
    }
}

async function sendReminderSMSImpt(obj) {
    let items;
    let len = obj.length;
    let nums = getPropertyFromArray(obj, '编号')
    let numbers = await queryPersonAndNumber(nums);
    let result = [];
    for(let i = 0; i < len; i++) {
        let item = obj[i];
        let number = numbers.find(number => number.编号 === item.编号);
        if(number && number.托收联系人 && number.托收电话) {
            let rrr = await sendSMS(
                number.托收电话,
                `迄今为止贵企业共欠${item.月数}个月水费,金额为${item.实收水费},滞纳金为${item.滞纳金},合计${item.合计},请尽快缴清。`
                );
            result.push({...item, desc : rrr.data});    
        }else {
            result.push({...item, desc : 'error:Missing recipient'});
        }
    }
    return result;
}

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

function getPropertyFromArray(items, key) {
    return items.map(
        item => item[key]
    );
}

module.exports.ReminderToWord = ReminderToWord;

async function ReminderToWord(req, res) {
    let { category } = req.params;
    let obj = req.body || {};
    try {       
        let wb = await ReminderToWordImpt(obj, category);
        res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]);
        res.end( new Buffer(wb.buf, 'base64') ); 
    }catch(ex) {
        Helper.InternalServerError( res, ex, {  } );
    }
}

async function ReminderToWordImpt(obj, category) {
    let dd = dateFormat(new Date(), "yyyy-mm-dd").split('-');
    obj.forEach(
        item => {
            item.年 = dd[0];
            item.月 = dd[1];
            item.日 = dd[2];
            item.break = '</w:p><w:p><w:br w:type="page" /></w:p>';
        }
    );
    obj[obj.length - 1].break = '';
    let values = {items : obj};
    let result = toWord(category, values, false);
    return result;
}






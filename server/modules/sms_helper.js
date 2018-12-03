const axios = require("axios");
const querystring = require("querystring");
const key = "b693a36ea67a3677ad8ba03220df6798";
const user = "rongshu1";
const pwd = "rstjftz1";
const url = 'http://m.5c.com.cn/api/send/?';

module.exports.sendSMS = async function(phoneNumber, msg) {
    var cont = querystring.stringify({content: msg});
    let info = `${url}apikey=${key}&username=${user}&password=${pwd}&mobile=${phoneNumber}&${cont}`;
    let json = await axios.get(info);
    return json;
}
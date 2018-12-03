

module.exports.copy = function(source, StartChar, Count ) {
    return source.slice(StartChar - 1, StartChar + Count - 1);
}

// 通过 Node.js 提供的 Buffer 类
const getByBuffer = function(str) {
    var buffer = new Buffer(str);
    var len = buffer.length;
    return len;
};
 
// 通过原生的正则
const getByReg = function(str) {
    var cArr = str.match(/[^x00-xff]/ig);
    return str.length + (cArr == null ? 0 : cArr.length);
};
 
// 通过原生的字符码
const getByCode = function(str) {
    var realLength = 0,
        len = str.length,
        charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
};

module.exports.length = function(source) {
    if(source) {
        return getByCode(source);
    }
    return 0;
}

module.exports.inttostr = function(i) {
    return i.toString();
}

module.exports.strtoint = function(i) {
    return parseInt(i);
}

module.exports.strtoFloat = function(i) {
    if(isNaN(i)){
        return '0';
    }else{
        return parseFloat(i);
    }
}

module.exports.trim = function(text) {
    return text.trim();
}
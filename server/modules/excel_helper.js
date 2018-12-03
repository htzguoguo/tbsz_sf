const XlsxTemplate = require('xlsx-template');
const fs = require("fs");
const path = require("path");

module.exports.toExcel = function(fileName, sheetName, values) {
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', `${fileName}.xlsx`));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    // Set up some placeholder values matching the placeholders in the template   
    // Perform substitution
    template.substitute(sheetName, values);
    // Get binary data
    return template.generate({type: 'base64'});
}

module.exports.toExcelMultiSheets = function(fileName, sheetNames, values) {
    let data = fs.readFileSync(path.join('./', 'assets', 'excel', `${fileName}.xlsx`));
    let template = new XlsxTemplate(data);
    // Replacements take place on first sheet
    // Set up some placeholder values matching the placeholders in the template   
    // Perform substitution
    for(let i = 0; i < sheetNames.length; i++) {
        template.substitute(sheetNames[i], values[i]);
    }
    // Get binary data
    return template.generate({type: 'base64'});
}
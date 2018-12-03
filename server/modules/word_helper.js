const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4'); 
module.exports.toWord = function(fileName, data, isSaved) {
    //Load the docx file as a binary
    let content = fs.readFileSync(path.join('./', 'assets', 'word', `${fileName}.docx`), 'binary');        
    var zip = new JSZip(content);
    var doc = new Docxtemplater();
    doc.loadZip(zip);
    //set the templateVariables
    doc.setData(data);
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
    var buf = doc.getZip()
            .generate({type: 'base64'});
    buf = new Buffer(buf, 'base64');        
    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    if(isSaved) {
        const savename = uuidv4();
        fs.writeFileSync(path.join('./', 'output', 'word', `${savename}.docx`), buf);
        return {buf, savename};
    }else {
        return {buf};
    }
}

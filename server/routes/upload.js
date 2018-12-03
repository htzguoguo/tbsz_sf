const express = require('express');
const router = express.Router();
const path = require('path');
const formidable = require('formidable');
const Helper = require( '../modules/http_helper' );



router.post('/',function (req,res,next){
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join('./', 'uploadfiles',);
    form.keepExtensions = true;
    form.parse(req,function (err,fileds,files){
        if(err) next(err);
        let name = files.file.path.split('\\')[1];
        Helper.ResourceFound( res, {name : name } );
    })
})


module.exports = router;

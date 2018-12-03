const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/contract/:name', (req, res, next) => {
    let {name} = req.params;
    var file = path.join( './' , 'output', 'word',`${name}.docx` );
    res.download(file); // Set disposition and send it.
});

router.get('/contract/html/:name', (req, res, next) => {
    let {name} = req.params;
    var file = path.join( './' , 'output', 'word',`${name}.docx` );
    res.download(file); // Set disposition and send it.
});

router.get('/file/:name', (req, res, next) => {
    let {name} = req.params;
    var file = path.join( './' , 'uploadfiles',  name );
    res.download(file); // Set disposition and send it.
});


module.exports = router;
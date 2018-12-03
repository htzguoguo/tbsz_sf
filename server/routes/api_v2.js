const mobile = require('./mobile');
const express = require( 'express' );
const router = express.Router();

router.use( '/mobile', mobile );
module.exports = router;
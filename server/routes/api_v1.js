/**
 * Created by Administrator on 2017-12-28.
 */
const express = require( 'express' );
const router = express.Router();
const users = require( './user' );
const menu = require('./menu');
const workitems = require('./workitem');
const waterfee = require('./waterfee');
const unit = require('./unit');

router.use( '/users', users );
router.use( '/menu', menu );
router.use( '/workitems', workitems );
router.use( '/water', waterfee );
router.use( '/unit', unit );

module.exports = router;

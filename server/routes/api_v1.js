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
const stat = require('./stat');
const report = require('./report');
const detail = require('./detail');
const collection = require('./collection');
const upload = require('./upload');
const dict = require('./dict');
const contract = require('./contract');
const files = require('./files');
const reminder = require('./reminder');

router.use( '/users', users );
router.use( '/menu', menu );
router.use( '/workitems', workitems );
router.use( '/water', waterfee );
router.use( '/unit', unit );
router.use( '/stat', stat );
router.use( '/report', report );
router.use('/detail', detail);
router.use('/collection', collection);
router.use('/upload', upload);
router.use('/dict', dict);
router.use('/contract', contract);
router.use('/files', files);
router.use('/reminder', reminder);
module.exports = router;

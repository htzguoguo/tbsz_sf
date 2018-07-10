/**
 * Created by Administrator on 2017-12-26.
 */

var express = require( 'express' ),
    router = express.Router(),
    oauth = require( '../modules/oauth2-middleware' );

router.post( '/', oauth.authenticate );
router.delete( '/', oauth.logout );

module.exports  = router;

/**
 * Created by Administrator on 2017-12-26.
 */

module.exports.InternalServerError = function ( res, error, context ) {
    "use strict";
    var result = {
        "error": {
            "code": "bf-500",
            "message":  error,
            "context":  context
        }
    };
    res.status( 500 );
    res.setHeader( 'Content-Type', 'application/json' );
    res.send( result );
};

module.exports.BadRequest = function ( res, error, context ) {
    "use strict";
    var result = {
        "error": {
            "code": "bf-400",
            "message":  error,
            "context":  context
        }
    };
    res.status( 400 );
    res.setHeader('Content-Type', 'application/json' );
    res.send( result );
};

module.exports.ResourceNotFound = function ( res,  context, message ) {
    "use strict";
    var result = {
        "error": {
            "code": "bf-404",
            "message":  message || 'Not Found',
            "context":  context
        }
    };
    res.status( 404 );
    res.setHeader('Content-Type', 'application/json' );
    res.send( result );
};

module.exports.ResourceDeleted = function ( res ) {
    "use strict";
    res.status( 204 );
    res.end();
};

module.exports.ResourceCreated = function ( res, data ) {
    "use strict";
    res.status( 201 );
    res.setHeader( 'Content-Type', 'application/json' );
    if ( data ) {
        res.send( data );
    }else {
        res.send( { "data" : 'Created' }  );
    }
};

module.exports.ResourceUpdated = function ( res, data ) {
    "use strict";
    res.status( 201 );
    res.setHeader( 'Content-Type', 'application/json' );
    if ( data ) {
        res.send(  data );
    }else {
        res.send( { "data" : 'Updated'} );
    }
};

module.exports.ResourceFound = function ( res, data ) {
    "use strict";
    var result = data;
    res.status( 200 );
    res.setHeader( 'Content-Type', 'application/json' );
    res.send(  result   );
    /* res.end();*/
    /* res.end();*/
};

module.exports.NotAuthorized = function ( req, res ) {
    var result = {
        "error": {
            "code": "bf-401",
            "message": "Not Authorized",
            "context": {
                "url": req.url
            }
        }
    };
    res.status(401).send( result );
};

module.exports.ConvertNullToZeroString = function ( data ) {
    "use strict";
    Object.keys(data).forEach(
        key => {
            if(data[key] === null ) {
                data[key] = '';
            }
        }
    );
};



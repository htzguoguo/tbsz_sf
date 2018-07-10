/**
 * Created by Administrator on 2017/4/10.
 */

function handle_Get_request( response ) {
    "use strict";
    response.writeHead( 200, {
        'Content-type' : 'text/plain'
    } );
    response.end( 'Get action was requested' );
}

function handle_Post_request( response ) {
    "use strict";
    response.writeHead( 200, {
        'Content-type' : 'text/plain'
    } );
    response.end( 'Post action was requested' );
}

function handle_Put_request( response ) {
    "use strict";
    response.writeHead( 200,  {
        'Content-type' : 'text/plain'
    } );
    response.end( 'Put action was requested' );
}

function handle_Head_request( response ) {
    "use strict";
    response.writeHead( 200, {
        'Content-type' : 'text/plain'
    } );
    response.end( 'Head action was requested' );
}

function handle_Delete_request( response ) {
    "use strict";
    response.writeHead( 200, {
        'Content-type' : 'text/plain'
    } );
    response.end( 'Delete action was requested' );
}

function handle_bad_request( response ) {
    "use strict";
    response.writeHead( 400, {
        'Content-type' : 'text/plain'
    } );
    response.end( 'bad requested' );
}

module.exports.Handle_request = function ( request, response ) {
    "use strict";
    switch ( request.method ) {
        case 'GET':
            handle_Get_request(response);
            break;
        case 'POST':
            handle_Post_request(response);
            break;
        case 'PUT':
            handle_Put_request(response);
            break;
        case 'HEAD':
            handle_Head_request(response);
            break;
        case 'DELETE':
            handle_Delete_request(response);
            break;
        default :
            handle_bad_request(response);
            break;
    }
};

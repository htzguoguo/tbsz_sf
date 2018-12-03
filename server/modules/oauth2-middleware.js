/**
 * Created by Administrator on 2017-12-26.
 */

var _ = require( 'underscore' ),
    Helper = require( './http_helper' ),
    User = require( '../schema/userTBSZ' ),
    crispy = require( 'crispy-string' );


const db = require('../schema/tbszSqlConnection');    

// second ( 1 hour)
var DEFAULT_EXPIRATION_TIME = 3600;
var TOKEN_LENGTH = 20;

var validTokens = {},
    refreshTokens = {};

function generateToken() {
    return crispy.base32String( TOKEN_LENGTH );
}

function issueAuthorization( username, callback ) {
    var accessToken = generateToken(),
        refreshToken = generateToken(),
        token = {
            access_token : accessToken,
            token_type : 'Bearer',
            expires_in : DEFAULT_EXPIRATION_TIME,
            refresh_token : refreshToken
        };
    saveValidToken( token );
    callback( token );
}

function saveValidToken( token, username ) {
    var tokenCopy = _.clone( token );
    tokenCopy.username = username;
    validTokens[ tokenCopy.access_token ] = tokenCopy;
    refreshTokens[ tokenCopy.refresh_token ] = tokenCopy;
    setTimeout( function () {
        expireToken( tokenCopy.access_token );
    }, DEFAULT_EXPIRATION_TIME * 1000 );
}

function expireToken( token ) {
    delete validTokens[ token ];
}

async function authorize( data, req, res  ) {
    var grantType = data.grant_type,
        username = data.username,
        password = data.password;
    if ( grantType !== 'password' ) {
        return Helper.BadRequest( res, '用户名或者密码错误', { username :  username } );
    }
    if ( !username || !password ) {
        return Helper.BadRequest( res, '用户名或者密码错误', { username :  username } );
    }
    try {         
        let sqlSelect = `
        Select * from 人事操作权限 where 姓名=:username 
        `;
        let users = await db.query(sqlSelect, { replacements: {username}, type: db.QueryTypes.SELECT }
        );
        if (users.length === 1) {
            let user = users[0];
            if ( user.密码 === password ) {
                issueAuthorization( username, function ( token ) {
                    Helper.ResourceFound( res, _.extend({
                        status : 'online',
                        desc : '0',
                        user : user
                    }, token) );
                } );
            }else {
                Helper.ResourceNotFound( res , { username : username } , "密码错误");
            }
        }else {
            Helper.ResourceNotFound( res , { username : username } , "用户名不存在");
        }
    }catch(ex) {
        Helper.ResourceNotFound( res , { username : username } , "用户名或者密码错误");
    }
}

// function authorize( data, req, res  ) {
//     var grantType = data.grant_type,
//         username = data.username,
//         password = data.password;
//     if ( grantType !== 'password' ) {
//         return Helper.BadRequest( res, '用户名或者密码错误', { username :  username } );
//     }
//     if ( !username || !password ) {
//         return Helper.BadRequest( res, '用户名或者密码错误', { username :  username } );
//     }
//     User.findAll({ where: {姓名 : username} }).then(users => {
//         console.log(users);
//         if (users.length === 1) {
//             let user = users[0];
//             user.checkPassword( password, function ( err, isMatch ) {
//                 if ( isMatch ) {
//                     issueAuthorization( username, function ( token ) {
//                         Helper.ResourceFound( res, _.extend({
//                             status : 'online',
//                             desc : '0',
//                             user : user
//                         }, token) );
//                     } );
//                 }else {
//                     Helper.ResourceNotFound( res , { username : username } , "密码错误");
//                 }
//             } );
//         }else {
//             Helper.ResourceNotFound( res , { username : username } , "用户名不存在");
//         }
//     })
// }

function authenticate( token, callback ) {
    if ( _.has( validTokens, token ) ) {
        callback( { valid : true, token : validTokens[ token ] } );
    }else {
        callback( { valid : false, token : null } );
    }
}

module.exports = {
    logout : function ( req, res ) {
        var authorization = req.headers.authorization || '';
        var splitValues = authorization.split( ' ' ),
            tokenType = splitValues[0],
            token = splitValues[1];

        expireToken( token );

        Helper.ResourceFound( res, _.extend({
            status : 'offline',
            desc : '1'
        }, token) );
    },
    authenticate : function ( req, res ) {
        authorize( req.body || {}, req, res );
    },
    authorizationRequired : function ( req, res, next ) {
        var authorization = req.headers.authorization || '';
        if ( !authorization ) {
            return  Helper.NotAuthorized( req, res );
        }
        var splitValues = authorization.split( ' ' ),
            tokenType = splitValues[0],
            token = splitValues[1];
        if ( !tokenType || tokenType !== 'Bearer' || !token ) {
            return  Helper.NotAuthorized( req, res );
        }
        authenticate( token, function ( response ) {
            if ( response.valid ) {
                next();
            }else {
                return  Helper.NotAuthorized( req, res );
            }
        } );
    }
};


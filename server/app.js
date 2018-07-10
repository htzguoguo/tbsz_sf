const express = require( 'express' );
const path = require( 'path' );
const session = require( 'express-session' );
const cookieParser = require( 'cookie-parser' );
const bodyParser = require( 'body-parser' );
const CacheControl = require( 'express-cache-control' );
const cache = new CacheControl().middleware;
const admin_oauth = require( './modules/oauth2-middleware' );

const User = require('./schema/user');
const defaultRoute = require( './routes/index' );
const authrouter = require( './routes/auth' );
const apirouter_v1 = require( './routes/api_v1' );


const app = express();
const port = process.env.PORT || 8180;
/*const staticPath = path.join( __dirname, 'build' );*/
const adminUser = new User();


app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended : false } ) );
app.use(cookieParser('login'));
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: true,
    cookie : { maxAge : 300 * 1000 }
}));

/*app.use( express.static( staticPath ) );*/
defaultRoute(app);
app.use( '/auth',cache( 'minutes', 2 ), authrouter );
app.use( '/api/v1',admin_oauth.authorizationRequired,  apirouter_v1 );


adminUser.initAdminUser();
module.exports = app;
app.listen( port );

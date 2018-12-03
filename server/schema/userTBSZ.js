/**
 * Created by Administrator on 2017-12-26.
 */
const Sequelize = require('sequelize');
const Bcrypt = require( 'bcrypt-nodejs' );
const SALT_FACTOR = 10;
const db = require("./tbszSqlConnection") ;
const Helper = require( '../modules/http_helper' );
const User = db.define('user', {
        姓名: {
            type: Sequelize.STRING
        },
        单位编号: {
            type: Sequelize.STRING
        },
        单位名称: {
            type: Sequelize.STRING
        },
        部门编号: {
            type: Sequelize.STRING
        },
        部门名称: {
            type: Sequelize.STRING
        },
        密码: {
            type: Sequelize.STRING
        },
    },
    {
        timestamps: false,
        tableName: '人事操作权限'
    }
);



async function queryUser(req, res) { 
    let {username} = req.params;   
    try {         
        let result = await queryUserImpt(username);
        if (result && result.length > 0) {
            Helper.ResourceFound( res, result[0] );
        }else {
            Helper.ResourceNotFound( res , { username });
        }
    }catch(ex) {
        Helper.InternalServerError( res, ex, {username} );
    }
}

async function queryUserImpt(username) {
    let sqlSelect = `
    Select * from 人事操作权限 where 姓名=:username 
    `;
    let users = await db.query(sqlSelect, { replacements: {username}, type: db.QueryTypes.SELECT }
    );
    const menu = require(`../data/${users[0].权限1}`);
    users[0].items = menu;
    return users;
}

const BcryptPassword = function (pw, cb) {
    Bcrypt.genSalt( SALT_FACTOR, function ( err, salt ) {
        if ( !err ) {
            Bcrypt.hash( pw, salt, null, function ( err, hashedPassword ) {
                if ( !err ) {
                    cb(hashedPassword);
                }
            } );
        }
    } );
};

User.prototype.checkPassword = function (guess, done) {
    if(guess === this.密码) {
        done( null, true );
    }else{
        done( null, false );
    }    
};

User.prototype.initAdminUser = function ( req, res, next ) {
    User.findAll({ where: {姓名: 'admin1'} })
    .then(users => {
        if (users.length === 0) {
            User
                    .build({ 姓名: 'admin1', 密码: '123456'})
                    .save()
                    .then(user => {
                        console.log('Creating Admin user');
                    })
                    .catch(error => {console.log(error);});           
        }else {
            console.log('Admin user already exist');
        }
    })
    .catch(error => {console.log(error)});
};

module.exports = User;

module.exports.queryUser = queryUser;

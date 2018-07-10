/**
 * Created by Administrator on 2017-12-26.
 */
const Sequelize = require('sequelize');
const Bcrypt = require( 'bcrypt-nodejs' );
const SALT_FACTOR = 10;
const db = require('./userSqlConnection') ;
const User = db.define('user', {
        ID : {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        truename: {
            type: Sequelize.STRING
        }
    },
    {
        timestamps: false,
        tableName: 'UserEntity'
    }
);

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
    Bcrypt.compare( guess, this.password, function ( err, isMatch ) {
        done( err, isMatch );
    } );
};

User.prototype.initAdminUser = function ( req, res, next ) {
    User.findAll({ where: {name: 'admin1'} })
        .then(users => {
           if (users.length === 0) {
               BcryptPassword('123456', pw => {
                   User
                       .build({ name: 'admin1', password: pw})
                       .save()
                       .then(user => {
                           console.log('Creating Admin user');
                       })
                       .catch(error => {console.log(error);});
               })
           }else {
               console.log('Admin user already exist');
           }
        })
        .catch(error => {console.log(error)});
};

module.exports = User;

/**
 * Created by Administrator on 2017-12-26.
 */
const Sequelize = require('sequelize');
const sequelize = new Sequelize('SUP_SYS_Expressway_Usermanagement2011_20111102-G', 'sa', 'ghjsj', {
    host: '61.136.61.40',
    dialect: 'mssql',
    dialectOptions: {
    options: {
        tdsVersion: '7_3_A'
    }},
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = sequelize;

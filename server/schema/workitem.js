/**
 * Created by Administrator on 2017-12-28.
 */
const Sequelize = require('sequelize');
const db = require('./roadSqlConnection');
const Helper = require( '../modules/http_helper' );
const WorkItem = db.define('workitem', {
        ID : {
            type: Sequelize.INTEGER
        },
        CaseCatalog: {
            type: Sequelize.STRING
        },
        ParentCatalogName: {
            type: Sequelize.STRING
        },
        SubName: {
            type: Sequelize.STRING
        },
        ViewResult: {
            type: Sequelize.STRING
        },
        DealWithDesc: {
            type: Sequelize.STRING
        },
        FacilityDesc: {
            type: Sequelize.STRING
        },
        MonitoringUnit: {
            type: Sequelize.STRING
        },
        FinishedStandard: {
            type: Sequelize.STRING
        },
        RegistStandard: {
            type: Sequelize.STRING
        }
    },
    {
        timestamps: false,
        tableName: 'V_W_WorkingItems_Prices'
    }
);

function parseSortOrder(sortOrder) {
    if (sortOrder) {
        return sortOrder.replace('end', '');
    }else {
        return 'asc';
    }
}

WorkItem.pagingQuery = function (req, res) {
    let page = Number(req.query.page) || 1;
    let rowsPerPage = Number(req.query.results) || 10;
    let sortField = req.query.sortField || 'ID';
    let sortOrder = parseSortOrder(req.query.sortOrder);
    let subName = req.query.SubName || '%';
    let parentName = req.query.ParentCatalogName || '%';
    if(rowsPerPage > 100){
        rowsPerPage = 100; //this limits how many per page
    }
    let theQuery = 'declare @rowsPerPage as bigint; '+
        'declare @pageNum as bigint;'+
        'set @rowsPerPage='+rowsPerPage+'; '+
        'set @pageNum='+page+';   '+
        'With SQLPaging As   ( '+
        `Select Top(@rowsPerPage * @pageNum) ROW_NUMBER() OVER ( ORDER BY ${sortField} ${sortOrder}) `+
        'as resultNum, * '+
        'FROM V_W_WorkingItems_Prices where SubName like :subName and ParentCatalogName like :parentName)'+
        'select * from SQLPaging with (nolock) where resultNum > ((@pageNum - 1) * @rowsPerPage); ' ;

    let result = {};
    WorkItem.count(
        { where: {
            'SubName': {[Sequelize.Op.like]: '%' +  subName  + '%' } ,
            'ParentCatalogName': {[Sequelize.Op.like]: '%' +  parentName  + '%' }
        }
        }
        )
        .then(c => {
         result.count = c;
         return db.query(theQuery,
             {
                 replacements: {
                     subName: '%' +  subName + '%' ,
                     parentName: '%' +  parentName + '%'
                 },
                 model: WorkItem
             });
        })
        .then(items => {
            if (items) {
                result.data = items;
                Helper.ResourceFound( res, result );
            }else {
                Helper.ResourceNotFound( res , { ID : all });
            }
        })
        .catch(
        error => {
            console.log('error', error);
            Helper.InternalServerError( res, error, { ID : all } );
        }
    );
};

module.exports = WorkItem;


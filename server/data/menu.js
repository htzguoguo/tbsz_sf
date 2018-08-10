/**
 * Created by Administrator on 2017-12-28.
 */
/**
 * Created by Administrator on 2017-12-14.
 */

module.exports = {
    menus: [
        {
            key: 'menu1',
            name: '录入管理',
            icon: 'home',
            baseurl : '/app/toll',
            url: '/app/toll/take/0/0/0',
            child : [
                {
                    key: 'sub11',
                    name: '录入',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub111',
                            name: '录入月水费',
                            icon: 'user',
                            matchurl : '/app/toll/take/:num/:year/:month',
                            url: '/app/toll/take/0/0/0'
                        },
                        {
                            key: 'sidebarsub112',
                            name: '浏览月水费',
                            icon: 'user',
                            matchurl : '/app/toll/list',
                            url: '/app/toll/list'
                        },
                        {
                            key: 'sidebarsub113',
                            name: '查询月水费',
                            icon: 'user',
                            matchurl : '/app/toll/search',
                            url: '/app/toll/search'
                        },
                        {
                            key: 'sidebarsub114',
                            name: '自动创建月水费',
                            icon: 'user',
                            matchurl : '/app/toll/prepare',
                            url: '/app/toll/prepare'
                        },                       
                    ]
                },
                {
                    key: 'sub12',
                    name: '单位',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub121',
                            name: '录入单位基本信息',
                            icon: 'user',
                            matchurl : '/app/unit/entry',
                            url: '/app/unit/entry'
                        },
                        {
                            key: 'sidebarsub122',
                            name: '录入修改托收信息',
                            icon: 'user',
                            matchurl : '/app/unit/collection',
                            url: '/app/unit/collection'
                        },
                        {
                            key: 'sidebarsub123',
                            name: '单位信息查询',
                            icon: 'user',
                            matchurl : '/app/unit/search',
                            url: '/app/unit/search'
                        },
                        {
                            key: 'sidebarsub124',
                            name: '录入水贴费',
                            icon: 'user',
                            matchurl : '/app/unit/allowedit',
                            url: '/app/unit/allowedit'
                        },
                        {
                            key: 'sidebarsub125',
                            name: '水表过户',
                            icon: 'user',
                            matchurl : '/app/unit/change',
                            url: '/app/unit/change'
                        },
                        {
                            key: 'sidebarsub126',
                            name: '浏览过户信息',
                            icon: 'user',
                            matchurl : '/app/unit/changebrowse',
                            url: '/app/unit/changebrowse'
                        }
                    ]
                },
            ]
        },
        {
            key: 'menu2',
            name: '查询管理',
            icon: 'user',
            baseurl : '/app/yght',
            url: '/app/yght/list',
            child : [
                {
                    key: 'sub21',
                    name: '录入',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub211',
                            name: '浏览',
                            icon: 'user',
                            matchurl : '/app/yght/list',
                            url: '/app/yght/list'
                        },
                        {
                            key: 'sidebarsub212',
                            name: '录入',
                            icon: 'user',
                            matchurl : '/app/yght/view/:key',
                            url: '/app/yght/view/0'
                        }                     
                    ]
                },
            ]
        },
        {
            key: 'menu3',
            name: '报表管理',
            icon: 'laptop',
            baseurl : '/app/table',
            url: '/app/user'
        },
        {
            key: 'menu4',
            name: '明细管理',
            icon: 'notification',
            baseurl : '/app/detail',
            url: '/app/auth'
        },
        {
            key: 'menu5',
            name: '托收管理',
            icon: 'notification',
            baseurl : '/app/collection',
            url: '/app/auth'
        },
        {
            key: 'menu6',
            name: '字典管理',
            icon: 'notification',
            baseurl : '/app/dict',
            url: '/app/auth'
        }
    ]
};

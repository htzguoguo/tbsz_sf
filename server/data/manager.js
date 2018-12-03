/**
 * Created by Administrator on 2017-12-28.
 */
/**
 * Created by Administrator on 2017-12-14.
 */

module.exports = {
    menus: [
        {
            key: 'menu2',
            name: '查询管理',
            icon: 'user',
            baseurl : '/app/search',
            url: '/app/search/unit',
            child : [
                {
                    key: 'sub21',
                    name: '查询',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub211',
                            name: '单位信息查询',
                            icon: 'user',
                            matchurl : '/app/search/unit',
                            url: '/app/search/unit'
                        },
                        {
                            key: 'sidebarsub212',
                            name: '水费信息查询',
                            icon: 'user',
                            matchurl : '/app/search/toll',
                            url: '/app/search/toll'
                        },
                        {
                            key: 'sidebarsub213',
                            name: '统计水费',
                            icon: 'user',
                            matchurl : '/app/search/stattoll',
                            url: '/app/search/stattoll'
                        }                      
                    ]
                },
                {
                    key: 'sub22',
                    name: '欠费',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub221',
                            name: '按欠费单位统计',
                            icon: 'user',
                            matchurl : '/app/search/lackunit',
                            url: '/app/search/lackunit'
                        },  
                        {
                            key: 'sidebarsub222',
                            name: '催缴管理',
                            icon: 'user',
                            matchurl : '/app/search/reminderlist',
                            url: '/app/search/reminderlist'
                        },                     
                    ]
                },
            ]
        },
        {
            key: 'menu3',
            name: '报表管理',
            icon: 'laptop',
            baseurl : '/app/report',
            url: '/app/report/commission',
            child : [
                {
                    key: 'sub31',
                    name: '报表',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub311',
                            name: '委托收款报表',
                            icon: 'user',
                            matchurl : '/app/report/commission',
                            url: '/app/report/commission'
                        },
                        {
                            key: 'sidebarsub312',
                            name: '水费结算单',
                            icon: 'user',
                            matchurl : '/app/report/detail',
                            url: '/app/report/detail'
                        },
                        {
                            key: 'sidebarsub313',
                            name: '月汇总表',
                            icon: 'user',
                            matchurl : '/app/report/chargemonth',
                            url: '/app/report/chargemonth'
                        },
                        {
                            key: 'sidebarsub314',
                            name: '年汇总表',
                            icon: 'user',
                            matchurl : '/app/report/chargeyear',
                            url: '/app/report/chargeyear'
                        },
                        {
                            key: 'sidebarsub315',
                            name: '贴费汇总表',
                            icon: 'user',
                            matchurl : '/app/report/allowance',
                            url: '/app/report/allowance'
                        },
                        {
                            key: 'sidebarsub316',
                            name: '委托收款报表_临时',
                            icon: 'user',
                            matchurl : '/app/report/commissiontemp',
                            url: '/app/report/commissiontemp'
                        }                                  
                    ]
                },
            ]
        },
        {
            key: 'menu4',
            name: '明细管理',
            icon: 'notification',
            baseurl : '/app/detail',
            url: '/app/detail/allowance',
            child : [
                {
                    key: 'sub41',
                    name: '明细',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub411',
                            name: '水贴费',
                            icon: 'user',
                            matchurl : '/app/detail/allowance',
                            url: '/app/detail/allowance'
                        },
                        {
                            key: 'sidebarsub412',
                            name: '装表费',
                            icon: 'user',
                            matchurl : '/app/detail/fixwatch',
                            url: '/app/detail/fixwatch'
                        }, 
                        {
                            key: 'sidebarsub413',
                            name: '用水指标',
                            icon: 'user',
                            matchurl : '/app/detail/ration',
                            url: '/app/detail/ration'
                        }, 
                        {
                            key: 'sidebarsub414',
                            name: '供水合同',
                            icon: 'user',
                            matchurl : '/app/detail/contract',
                            url: '/app/detail/contract'
                        },  
                        {
                            key: 'sidebarsub415',
                            name: '市政公司用水',
                            icon: 'user',
                            matchurl : '/app/detail/countshizheng',
                            url: '/app/detail/countshizheng'
                        }, 
                        {
                            key: 'sidebarsub416',
                            name: '公司销售水清单',
                            icon: 'user',
                            matchurl : '/app/detail/countall',
                            url: '/app/detail/countall'
                        },                                
                    ]
                },
            ]

        },
    ]
};

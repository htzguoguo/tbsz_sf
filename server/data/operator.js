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
            icon: 'form',
            baseurl : '/app/toll',
            url: '/app/toll/take/0/0/0',
            child : [
                {
                    key: 'sub11',
                    name: '录入',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub116',
                            name: '首页',
                            icon: 'user',
                            matchurl : '/app/toll/home',
                            url: '/app/toll/home'
                          },  
                        {
                          key: 'sidebarsub115',
                          name: '创建月水费',
                          icon: 'user',
                          matchurl : '/app/toll/prepare',
                          url: '/app/toll/prepare'
                        },  
                        {
                            key: 'sidebarsub111',
                            name: '录入月水费',
                            icon: 'user',
                            matchurl : '/app/toll/take/:num/:year/:month',
                            url: '/app/toll/take/0/0/0'
                        },
                        {
                          key: 'sidebarsub112',
                          name: '缴费确认',
                          icon: 'user',
                          matchurl : '/app/toll/payment',
                          url: '/app/toll/payment',
                        },
                        {
                            key: 'sidebarsub113',
                            name: '浏览月水费',
                            icon: 'user',
                            matchurl : '/app/toll/list',
                            url: '/app/toll/list'
                        },
                        {
                            key: 'sidebarsub114',
                            name: '水费综合查询',
                            icon: 'user',
                            matchurl : '/app/toll/search',
                            url: '/app/toll/search'
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
                            name: '录入企业信息',
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
                            name: '用水企业信息查询',
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
                            name: '过户信息查询',
                            icon: 'user',
                            matchurl : '/app/unit/changebrowse',
                            url: '/app/unit/changebrowse'
                        },
                        {
                            key: 'sidebarsub127',
                            name: '水量错误检查',
                            icon: 'user',
                            matchurl : '/app/unit/errorcheck',
                            url: '/app/unit/errorcheck'
                        },
                        {
                            key: 'sidebarsub128',
                            name: '更改用户编号',
                            icon: 'user',
                            matchurl : '/app/unit/changeid',
                            url: '/app/unit/changeid'
                        },
                    ]
                },
            ]
        },
        {
            key: 'menu2',
            name: '查询管理',
            icon: 'file-search',
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
                            name: '用水企业信息查询',
                            icon: 'user',
                            matchurl : '/app/search/unit',
                            url: '/app/search/unit'
                        },
                        {
                            key: 'sidebarsub212',
                            name: '水费综合查询',
                            icon: 'user',
                            matchurl : '/app/search/toll',
                            url: '/app/search/toll'
                        },
                        {
                          key: 'sidebarsub213',
                          name: '单表用水曲线图',
                          icon: 'user',
                          matchurl : '/app/search/usage/unit',
                          url: '/app/search/usage/unit',
                        },
                        {
                          key: 'sidebarsub214',
                          name: '企业用水曲线图',
                          icon: 'user',
                          matchurl : '/app/search/usage/company',
                          url: '/app/search/usage/company',
                        },
                        {
                            key: 'sidebarsub215',
                            name: '统计购水量',
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
            icon: 'bar-chart',
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
                          name: '排污费收据',
                          icon: 'user',
                          matchurl : '/app/report/pollution',
                          url: '/app/report/pollution'
                        },
                        {
                          key: 'sidebarsub314',
                          name: '统计汇总',
                          icon: 'user',
                          matchurl : '/app/report/chargemonthdynamic',
                          url: '/app/report/chargemonthdynamic'
                        },
                        {
                            key: 'sidebarsub315',
                            name: '月汇总表',
                            icon: 'user',
                            matchurl : '/app/report/chargemonth',
                            url: '/app/report/chargemonth'
                        },
                        {
                            key: 'sidebarsub316',
                            name: '年汇总表',
                            icon: 'user',
                            matchurl : '/app/report/chargeyear',
                            url: '/app/report/chargeyear'
                        },
                        {
                            key: 'sidebarsub317',
                            name: '贴费汇总表',
                            icon: 'user',
                            matchurl : '/app/report/allowance',
                            url: '/app/report/allowance'
                        },
                        {
                            key: 'sidebarsub318',
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
            icon: 'file-protect',
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
        {
            key: 'menu5',
            name: '托收管理',
            icon: 'money-collect',
            baseurl : '/app/collection',
            url: '/app/collection/outputbank',
            child : [
                {
                    key: 'sub51',
                    name: '托收',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub511',
                            name: '按银行生成托收',
                            icon: 'user',
                            matchurl : '/app/collection/outputbank',
                            url: '/app/collection/outputbank'
                        }, 
                        {
                            key: 'sidebarsub512',
                            name: '按用户生成托收',
                            icon: 'user',
                            matchurl : '/app/collection/outputuser',
                            url: '/app/collection/outputuser'
                        }, 
                        {
                            key: 'sidebarsub513',
                            name: '打印托收信封及清单',
                            icon: 'user',
                            matchurl : '/app/collection/rsoutputbank',
                            url: '/app/collection/rsoutputbank'
                        }, 
                        {
                            key: 'sidebarsub514',
                            name: '读取回盘信息',
                            icon: 'user',
                            matchurl : '/app/collection/inputdisk',
                            url: '/app/collection/inputdisk'
                        }, 
                        {
                            key: 'sidebarsub515',
                            name: '打印托收明细',
                            icon: 'user',
                            matchurl : '/app/collection/outputdetail',
                            url: '/app/collection/outputdetail'
                        }, 
                        {
                            key: 'sidebarsub516',
                            name: '托收统计',
                            icon: 'user',
                            matchurl : '/app/collection/outputcount',
                            url: '/app/collection/outputcount'
                        },
                        {
                            key: 'sidebarsub517',
                            name: '银行默认设置',
                            icon: 'user',
                            matchurl : '/app/collection/banksetup',
                            url: '/app/collection/banksetup'
                        },                                                                      
                    ]
                },
            ]
        },
        {
            key: 'menu6',
            name: '字典管理',
            icon: 'book',
            baseurl : '/app/dict',
            url: '/app/dict/usekind',
            child : [
                {
                    key: 'sub61',
                    name: '字典',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub611',
                            name: '用水形式字典',
                            icon: 'user',
                            matchurl : '/app/dict/usekind',
                            url: '/app/dict/usekind'
                        },  
                        {
                            key: 'sidebarsub612',
                            name: '收费形式字典',
                            icon: 'user',
                            matchurl : '/app/dict/chargekind',
                            url: '/app/dict/chargekind'
                        }, 
                        {
                            key: 'sidebarsub613',
                            name: '抄表形式字典',
                            icon: 'user',
                            matchurl : '/app/dict/InputKind',
                            url: '/app/dict/InputKind'
                        }, 
                        {
                            key: 'sidebarsub614',
                            name: '费用标准字典',
                            icon: 'user',
                            matchurl : '/app/dict/chargestandard',
                            url: '/app/dict/chargestandard'
                        }, 
                        {
                            key: 'sidebarsub615',
                            name: '防火费标准字典',
                            icon: 'user',
                            matchurl : '/app/dict/firestandard',
                            url: '/app/dict/firestandard'
                        },                                                                   
                    ]
                },
            ]
        },
        {
            key: 'menu7',
            name: '文档管理',
            icon: 'copy',
            baseurl : '/app/contract',
            url: '/app/contract/creation',
            child : [
                {
                    key: 'sub71',
                    name: '供水合同',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub711',
                            name: '供水合同创建',
                            icon: 'user',
                            matchurl : '/app/contract/creation',
                            url: '/app/contract/creation',
                        }, 
                        {
                            key: 'sidebarsub712',
                            name: '查询',
                            icon: 'user',
                            matchurl : '/app/contract/list',
                            url: '/app/contract/list',
                        },                                                                 
                    ]
                },
                {
                    key: 'sub73',
                    name: '终止供水合同',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub731',
                            name: '合同创建',
                            icon: 'user',
                            matchurl : '/app/contract/teardowncreation',
                            url: '/app/contract/teardowncreation',
                        }, 
                        {
                            key: 'sidebarsub732',
                            name: '查询',
                            icon: 'user',
                            matchurl : '/app/contract/teardownlist',
                            url: '/app/contract/teardownlist',
                        },                                                                 
                    ]
                },
                {
                    key: 'sub72',
                    name: '文件',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub721',
                            name: '资料上传',
                            icon: 'user',
                            matchurl : '/app/contract/upload',
                            url: '/app/contract/upload',
                        }, 
                        {
                            key: 'sidebarsub722',
                            name: '资料查询',
                            icon: 'user',
                            matchurl : '/app/contract/search',
                            url: '/app/contract/search',
                        },                                                             
                    ]
                },
            ]
        }
    ]
};

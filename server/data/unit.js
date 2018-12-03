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
            name: '用水企业',
            icon: 'home',
            baseurl : '/app/unit',
            url: '/app/unit/summary',
            child : [
                {
                    key: 'sub11',
                    name: '信息',
                    icon: 'user',
                    child : [
                        {
                            key: 'sidebarsub111',
                            name: '水费信息',
                            icon: 'user',
                            matchurl : '/app/unit/summary',
                            url: '/app/unit/summary'
                        },                
                    ]
                },
            ]
        },
    ]
};

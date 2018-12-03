import YGHT from '../views/YGHT';
import YGHT_List from '../views/YGHT/List';
import YGHT_View from '../views/YGHT/View';
import YGHT_Edit from '../views/YGHT/Edit'; 

export const yghtChildRoutes = [
    {
        'path':'/app/yght/list',
        'component': YGHT_List,
        'exactly': true
    },
    {
        'path':'/app/yght/view/:key',
        'component': YGHT_View,
        'exactly': false
    }
    ,
    {
        'path':'/app/yght/edit/:key',
        'component': YGHT_Edit,
        'exactly': false
    }
];
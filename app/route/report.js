import Commission from '../views/Report/Commission';
import Detail from '../views/Report/Detail';
import ChargeMonth from '../views/Report/ChargeMonth';
import ChargeYear from '../views/Report/ChargeYear';
import Allowance from './../views/Report/Allowance';
import CommissionTemp from '../views/Report/CommissionTemp';
export const reportChildRoutes = [
    {
        'path':'/app/report/commission',
        'component': Commission,
        'exactly': true
    },  
    {
        'path':'/app/report/detail',
        'component': Detail,
        'exactly': true
    },  
    {
        'path':'/app/report/chargemonth',
        'component': ChargeMonth,
        'exactly': true
    }, 
    {
        'path':'/app/report/chargeyear',
        'component': ChargeYear,
        'exactly': true
    },  
    {
        'path':'/app/report/allowance',
        'component': Allowance,
        'exactly': true
    },
    {
        'path':'/app/report/commissiontemp',
        'component': CommissionTemp,
        'exactly': true
    },   
];
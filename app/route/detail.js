import Allowance from '../views/Detail/AllowanceDetail';
import FixWatch from '../views/Detail/FixWatch';
import Ration from '../views/Detail/Ration';
import Contract from '../views/Detail/Contract';
import CountShiZheng from '../views/Detail/CountShiZheng';
import CountAll from '../views/Detail/CountAll';
export const detailChildRoutes = [
    {
        'path':'/app/detail/allowance',
        'component': Allowance,
        'exactly': true
    },
    {
        'path':'/app/detail/fixwatch',
        'component': FixWatch,
        'exactly': true
    },
    {
        'path':'/app/detail/ration',
        'component': Ration,
        'exactly': true
    },
    {
        'path':'/app/detail/contract',
        'component': Contract,
        'exactly': true
    },
    {
        'path':'/app/detail/countshizheng',
        'component': CountShiZheng,
        'exactly': true
    },
    {
        'path':'/app/detail/countall',
        'component': CountAll,
        'exactly': true
    },
];
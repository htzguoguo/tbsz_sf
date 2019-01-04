import TakeToll from '../views/Toll/TakeToll';
import ListToll from '../views/Toll/List';
import EditTable from '../views/Toll/EditTable';
import PrepareToll from '../views/Toll/Prepare';
import SearchToll from '../views/Toll/Search';
import Payment from '../views/Toll/Payment';
import home1 from '../views/home1';

export const tollChildRoutes = [
    {
        'path':'/app/toll/take/:num/:year/:month',
        'component': TakeToll,
        'exactly': true
    },
    {
        'path':'/app/toll/list',
        'component': ListToll,
        'exactly': false
    }, 
    {
        'path':'/app/toll/prepare',
        'component': PrepareToll,
        'exactly': false
    }, 
    {
        'path':'/app/toll/search',
        'component': SearchToll,
        'exactly': false
    },
    {
      'path':'/app/toll/payment',
      'component': Payment,
      'exactly': false
  },
  {
    'path':'/app/toll/home1',
    'component': home1,
    'exactly': false
},

];
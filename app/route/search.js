import SearchToll from '../views/Toll/Search';
import UnitSearch from '../views/Unit/Search';
import StatToll from '../views/Stat/StatToll';
import LackUnit from '../views/Stat/LackUnit';
import ReminderList from '../views/Reminder/List';
import UsageByUnit from '../views/Toll/UsageByUnit';

export const searchChildRoutes = [
    {
        'path':'/app/search/unit',
        'component': UnitSearch,
        'exactly': true
    },
    {
        'path':'/app/search/toll',
        'component': SearchToll,
        'exactly': true
    },
    {
        'path':'/app/search/stattoll',
        'component': StatToll,
        'exactly': true
    },
    {
        'path':'/app/search/lackunit',
        'component': LackUnit,
        'exactly': true
    },
    {
        'path':'/app/search/reminderlist',
        'component': ReminderList,
        'exactly': true
    },
    {
      'path':'/app/search/usage/unit',
      'component': UsageByUnit,
      'exactly': true
    },
];
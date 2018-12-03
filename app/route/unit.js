import UnitEntry from '../views/Unit/Entry';
import UnitCollectionEntry from '../views/Unit/Collection';
import UnitSearch from '../views/Unit/Search';
import AllowanceEdit from '../views/Unit/AllowanceEdit';
import Change from '../views/Unit/Change';
import ChangeBrowse from '../views/Unit/ChangeBrowse';
import ErrorCheck from '../views/Unit/ErrorCheck';
import ChangeID from '../views/Unit/ChangeID';
import UnitSummary from '../views/Unit/Summary';
export const unitChildRoutes = [    
    {
        'path':'/app/unit/entry',
        'component': UnitEntry,
        'exactly': false
    }, 
    {
        'path':'/app/unit/search',
        'component': UnitSearch,
        'exactly': false
    },
    {
        'path':'/app/unit/allowedit',
        'component': AllowanceEdit,
        'exactly': false
    }, 
    {
        'path':'/app/unit/collection',
        'component': UnitCollectionEntry,
        'exactly': false
    },
    {
        'path':'/app/unit/change',
        'component': Change,
        'exactly': false
    },
    {
        'path':'/app/unit/changebrowse',
        'component': ChangeBrowse,
        'exactly': false
    },
    {
        'path':'/app/unit/errorcheck',
        'component': ErrorCheck,
        'exactly': false
    },
    {
        'path':'/app/unit/summary',
        'component': UnitSummary,
        'exactly': false
    },
];
import ContractCreation from '../views/Contract/Creation';
import ContractList from '../views/Contract/List';
import Upload from '../views/Contract/Upload';
import Search from '../views/Contract/Search';
import TearDownCreation from '../views/TearDown/Creation';
import TearDownList from '../views/TearDown/List';
export const contractChildRoutes = [
    {
        'path':'/app/contract/creation',
        'component': ContractCreation,
        'exactly': true
    },
    {
        'path':'/app/contract/list',
        'component': ContractList,
        'exactly': true
    },
    {
        'path':'/app/contract/upload',
        'component': Upload,
        'exactly': true
    },
    {
        'path':'/app/contract/search',
        'component': Search,
        'exactly': true
    },
    {
        'path':'/app/contract/teardowncreation',
        'component': TearDownCreation,
        'exactly': true
    },
    {
        'path':'/app/contract/teardownlist',
        'component': TearDownList,
        'exactly': true
    },
];
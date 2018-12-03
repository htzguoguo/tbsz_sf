import OutputBank from '../views/Collection/OutputBank';
import OutputUser from '../views/Collection/OutputUser';
import RsOutputBank from '../views/Collection/RsOutputBank';
import InputDisk from '../views/Collection/InputDisk';
import OutputDetail from '../views/Collection/OutputDetail';
import OutputCount from '../views/Collection/OutputCount';
import BankSetup from '../views/Collection/BankSetup';
export const collectionChildRoutes = [
    {
        'path':'/app/collection/outputbank',
        'component': OutputBank,
        'exactly': true
    },  
    {
        'path':'/app/collection/outputuser',
        'component': OutputUser,
        'exactly': true
    },  
    {
        'path':'/app/collection/rsoutputbank',
        'component': RsOutputBank,
        'exactly': true
    },  
    {
        'path':'/app/collection/inputdisk',
        'component': InputDisk,
        'exactly': true
    },  
    {
        'path':'/app/collection/outputdetail',
        'component': OutputDetail,
        'exactly': true
    }, 
    {
        'path':'/app/collection/outputcount',
        'component': OutputCount,
        'exactly': true
    }, 
    {
        'path':'/app/collection/banksetup',
        'component': BankSetup,
        'exactly': true
    }, 
];
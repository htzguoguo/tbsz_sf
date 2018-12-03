import UseKind from '../views/Dict/UseKind';
import ChargeKind from '../views/Dict/ChargeKind';
import InputKind from '../views/Dict/InputKind';
import ChargeStandard from '../views/Dict/ChargeStandard';
import FireStandard from '../views/Dict/FireStandard';

export const dictChildRoutes = [
    {
        'path':'/app/dict/usekind',
        'component': UseKind,
        'exactly': true
    },
    {
        'path':'/app/dict/chargekind',
        'component': ChargeKind,
        'exactly': true
    },
    {
        'path':'/app/dict/InputKind',
        'component': InputKind,
        'exactly': true
    },
    {
        'path':'/app/dict/chargestandard',
        'component': ChargeStandard,
        'exactly': true
    },
    {
        'path':'/app/dict/firestandard',
        'component': FireStandard,
        'exactly': true
    },
];
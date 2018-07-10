/**
 * Created by Administrator on 2017-11-21.
 */

import makeFinalStore from 'alt-utils/lib/makeFinalStore';

export default function (alt, storage, storeName) {
    const finalStore = makeFinalStore(alt);
    try {
        alt.bootstrap(storage.get(storeName));
    }catch(e) {
       // console.error('Failed to bootstrap data', e);
        let log;
    }
    finalStore.listen(() => {
        if (!storage.get('debug')) {
            storage.set(storeName, alt.takeSnapshot());
        }
    });
}

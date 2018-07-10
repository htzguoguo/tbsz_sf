/**
 * Created by Administrator on 2017-11-21.
 */

export default {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key))
        }catch (err) {
            return null;
        }
    },
    set(key, v) {
        localStorage.setItem(key, JSON.stringify(v))
    }
}

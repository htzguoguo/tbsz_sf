/**
 * Created by Administrator on 2017-12-14.
 */
import { combineReducers } from 'redux';
import auth from './auth';
import menu from './menu';

const rootReducer = combineReducers({
  auth,
  menu
});

export default rootReducer;

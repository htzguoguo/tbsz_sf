/**
 * Created by Administrator on 2017-12-14.
 */
import {
  LOGIN_PENDING,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT_SUCCESS,
  FETCH_PROFILE_PENDING,
  FETCH_PROFILE_SUCCESS
} from '../actions/auth';
import {saveAuth, dropAuth} from '../utils/loginSession';

const initialState = {
  user: null,
  loggingIn: false,
  loggingOut: false,
  loginErrors: null
};

export default function auth(state = initialState, action = {}) {
  console.log('action.type',action.type);
  switch (action.type) {
    case LOGIN_PENDING:
      return Object.assign({}, initialState, {loggingIn: true});
    case LOGIN_SUCCESS:
      let user = action.payload.data;
      saveAuth(user.token_type, user.access_token, user.user.ID);
     /* window.localStorage.setItem('uid', user.access_token);*/
      return Object.assign({}, state, {user: user, loggingIn: false, loginErrors: null});
    case LOGIN_ERROR:
      return {
        ...state,
        loggingIn: false,
        user: null,
        loginErrors: action.payload.response.data.error.message
      };
    case LOGOUT_SUCCESS:
      dropAuth();
    /*  window.localStorage.removeItem('uid');*/
      return {
        ...state,
        loggingOut: false,
        user: null,
        loginErrors: null
      };
    case FETCH_PROFILE_SUCCESS:
      return Object.assign({}, state, {user: action.payload.data, loggingIn: false, loginErrors: null});
    default:
      return state;
  }
}

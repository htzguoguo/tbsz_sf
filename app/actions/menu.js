/**
 * Created by Administrator on 2017-12-14.
 */
import api from '../api';

export const GET_ALL_MENU = 'GET_ALL_MENU';
export const GET_ALL_MENU_SUCCESS = 'GET_ALL_MENU_SUCCESS';
export const UPDATE_NAVPATH = 'UPDATE_NAVPATH';
export const UPDATE_SUBMENU = 'UPDATE_SUBMENU';

export function updateNavPath(path, key) {
  return {
    type: UPDATE_NAVPATH,
    payload: {
      data: path,
      key: key
    }
  }
}

export function updateSubMenu(openKey, activeKey, navpath) {  
  return {
    type: UPDATE_SUBMENU,
    payload: {
      openKey,
      activeKey,
      navpath
    }
  }
}

export function getAllMenu(op) {
  return {
    type: GET_ALL_MENU,
    payload: {
      promise: api.get(`menu/${op}`)
    }
  }
}

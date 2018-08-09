/**
 * Created by Administrator on 2017-12-14.
 */
import _ from 'lodash';

import { 
  GET_ALL_MENU,
  GET_ALL_MENU_SUCCESS,
  UPDATE_NAVPATH,
  UPDATE_SUBMENU
} from '../actions/menu';

const initialState = {
  items: [],
  navpath: [],
  menu : {
    openKey: "sub1",
    activeKey: "sidebarsub1",
  }
};

const defaultMenuKey = {
  'menu1' : {
    openKey: "sub1",
    activeKey: "sidebarsub1",
  }
}

export default function menu(state = initialState, action = {}) {
  switch (action.type) {
    case GET_ALL_MENU_SUCCESS:
      return Object.assign({}, state, {items: action.payload.data.menus});
    case UPDATE_SUBMENU:{
      let nav = state.navpath;
      nav.push({ 
        name : action.payload.navpath,
        key : action.payload.activeKey
      });
      return Object.assign({}, state, {menu: action.payload, navpath : nav});
    }
    case UPDATE_NAVPATH: {
      let nav = [];
      nav.push({ 
        name : action.payload.data,
        key : action.payload.key
      });
      return Object.assign({}, state, {
      currentIndex: action.payload.key*1,
      navpath: nav,
      menu : defaultMenuKey[action.payload.key]
      }); 
      // let navpath = [], tmpOb, tmpKey, child;
      // if(Array.isArray(action.payload.data)){
      //   action.payload.data.reverse().map((item)=>{          
      //     if(item.indexOf('sub') != -1){
      //       tmpKey = item.replace('sub', '');
      //       tmpOb = _.find(state.items, function(o) {
      //         return o.key == tmpKey;
      //       });
      //       child = tmpOb.child;
      //       navpath.push({
      //         key: tmpOb.key,
      //         name: tmpOb.name
      //       })
      //     }
      //     if(item.indexOf('menu') != -1){
      //       tmpKey = item.replace('menu', '');
      //       if(child){
      //         tmpOb = _.find(child, function(o) {
      //           return o.key == tmpKey;
      //         });
      //         navpath.push({
      //           key: tmpOb.key,
      //           name: tmpOb.name
      //         });
      //       }
      //     }
      //   })
      // }          
      //   return Object.assign({}, state, {
      //   currentIndex: action.payload.key*1,
      //   navpath: navpath,
      //   menu : defaultMenuKey[action.payload.key]
      // }); 

    }     
    default:
      return state;
  }
}

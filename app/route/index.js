/**
 * Created by Administrator on 2017-12-14.
 */
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Layout from '../views/Layout1';
import Login from '../views/Login3';
import Toll from '../views/Toll';
import TakeToll from '../views/Toll/TakeToll';
import ListToll from '../views/Toll/List';
import PrepareToll from '../views/Toll/Prepare';
import SearchToll from '../views/Toll/Search';
import YGHT from '../views/YGHT';
import YGHT_List from '../views/YGHT/List';
import YGHT_View from '../views/YGHT/View';
import YGHT_Edit from '../views/YGHT/Edit'; 



export const appChildRoutes = [
  {
    'path':'/app/toll',
    'component': Toll,
    'exactly': true
  },
  {
    'path':'/app/yght',
    'component': YGHT,
    'exactly': true
  }
];

export const tollChildRoutes = [
  {
    'path':'/app/toll/take/:num/:year/:month',
    'component': TakeToll,
    'exactly': true
  },
  {
    'path':'/app/toll/list',
    'component': ListToll,
    'exactly': false
  }, 
  {
    'path':'/app/toll/prepare',
    'component': PrepareToll,
    'exactly': false
  }, 
  {
    'path':'/app/toll/search',
    'component': SearchToll,
    'exactly': false
  },
];



export const yghtChildRoutes = [
  {
    'path':'/app/yght/list',
    'component': YGHT_List,
    'exactly': true
  },
  {
    'path':'/app/yght/view/:key',
    'component': YGHT_View,
    'exactly': false
  }
  ,
  {
    'path':'/app/yght/edit/:key',
    'component': YGHT_Edit,
    'exactly': false
  }
];

const routes = (
  <Switch>
    <Route path="/login" component={Login}/>
    <Route path="/app" component={Layout}/>
    <Route path="/" component={Login}/>
  </Switch>
);



export default routes

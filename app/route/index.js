/**
 * Created by Administrator on 2017-12-14.
 */
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Layout from '../views/Layout1';
import Login from '../views/Login3';
import YGHT from '../views/YGHT';
import YGHT_List from '../views/YGHT/List';
import YGHT_View from '../views/YGHT/View';
import YGHT_Edit from '../views/YGHT/Edit';



export const appChildRoutes = [
  {
    'path':'/app/yght',
    'component': YGHT,
    'exactly': true
  }
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

/**
 * Created by Administrator on 2017-12-14.
 */
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

// import Layout from '../views/Layout1';
import LayoutWithSideBar from '../views/LayoutWithSideBar';
import home from '../views/home';
import Login from '../views/Login4';
import {tollChildRoutes} from './toll';
import {unitChildRoutes} from './unit';
import {yghtChildRoutes} from './yght';
import {searchChildRoutes} from './search';
import {reportChildRoutes} from './report';
import {detailChildRoutes} from './detail';
import {collectionChildRoutes} from './collection';
import {dictChildRoutes} from './dict';
import {contractChildRoutes} from './contract';


export const childRoutes = [
  ...tollChildRoutes,
  ...yghtChildRoutes,
  ...unitChildRoutes,
  ...searchChildRoutes,
  ...reportChildRoutes,
  ...detailChildRoutes,
  ...collectionChildRoutes,
  ...dictChildRoutes,
  ...contractChildRoutes
  ];

const routes = (
  <Switch>
    <Route path="/login" component={Login}/>
     <Route path="/app" component={LayoutWithSideBar}/>{/*菜单页入口 */}
     <Route path="/home" component={home}/>{/*菜单页入口 */}
    <Route path="/" component={Login}/>
  </Switch>
);



export default routes

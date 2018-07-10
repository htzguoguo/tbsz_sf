/**
 * Created by Administrator on 2017-12-14.
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import route from '../route';
import { HashRouter as Router } from 'react-router-dom';
import { LocaleProvider } from 'antd';
import CHS from 'antd/lib/locale-provider/zh_CN';

export default class Root extends Component {
  render() {
    const { store } = this.props;
    if (!this.route) this.route = route;
    return (
      <Provider store={store}>
        <LocaleProvider locale={CHS}>
          <Router children={this.route}/>
        </LocaleProvider>
      </Provider>
    );
  }
}

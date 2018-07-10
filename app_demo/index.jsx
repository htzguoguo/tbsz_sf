/**
 * Created by Administrator on 2017-11-16.
 */

/*import './main.css';*/
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import alt from './libs/alt';
import storage from './libs/storage';
import persist from './libs/persist';
import HeaderContentFooter from './components/layout/header-content-footer.jsx';
import HeaderSiderContentFooter from './components/layout/header-sider-content-footer.jsx';
import HeaderContentSiderContentFooter from './components/layout/header-content-sider-content-footer.jsx';
import SiderHeaderContentFooter from './components/layout/sider-header-content-footer.jsx';
import CustomTriggerSiderHeaderContentFooter from './components/layout/custom_trigger_sider_header_content_footer.jsx';
import FixedHeaderContentFooter from './components/layout/fixed-header-content-footer.jsx';
import FixedSiderHeaderContentFooter from './components/layout/fixed-sider-header-content-footer.jsx';
persist(alt, storage, 'app');


ReactDOM.render(
    <CustomTriggerSiderHeaderContentFooter/>,
    document.getElementById('app')
);

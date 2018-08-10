import React from 'react';
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Layout, Row, Col, Icon, Badge, Menu, Dropdown, Avatar, Popover} from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Route, Redirect } from 'react-router-dom';

import {  matchPath } from 'react-router'
import { childRoutes} from '../../route';
import authHOC from '../../utils/auth';

import NavPath from '../../components/NavPath';
import Header from '../../components/Header2';
import Footer from '../../components/Footer';
import { fetchProfile, logout} from '../../actions/auth';
import { getAllMenu, updateNavPath } from '../../actions/menu'
import './index.less';
import SiderMenu from './../../components/SiderMenu/index';
const SubMenu = Menu.SubMenu;
const { Sider, Content } = Layout;

class App extends React.Component {
    state = {
        firstHide: true,        // 点击收缩菜单，第一次隐藏展开子菜单，openMenu时恢复
    };

    constructor(props) {
        super(props);
    }   
    // 自动获取浏览器可视区域高度
    autoHeigth(){
        this.setState({
            height: document.body.clientHeight
        });
    }
    componentDidMount () {
        this.props.actions.getAllMenu()
    }
    componentWillMount() {
        this.setState({
            height: document.body.clientHeight
        });
        const {actions} = this.props;
        actions.fetchProfile();
    }    

    isActive = (path) => {
        let url = this.props.history.location.pathname;
        return matchPath(url, {
            path,
            exact: false,
            strict: false
        })
    }

    openMenu = v => {
        
        this.setState({
            openKey: v[v.length - 1],
            firstHide: false,
        })
    };

    render() {
        var documentHeight = this.state.height - 64;
        const {auth, navpath, items, actions} = this.props;
        // let activeKey, openKey; 
        // const _menuProcess = (nodes) => {
        //     if(nodes && nodes.length > 0) {
        //         let i1, i2, i3;
        //         loop1:
        //         for(i1 = 0; i1 < nodes.length; i1++) {
        //             let menu = nodes[i1];
        //             for(i2 = 0; i2 < menu.child.length; i2++) {
        //                 let summenu = menu.child[i2];
        //                 openKey = summenu.key.toString();
        //                 for(i3 = 0; i3 < summenu.child.length; i3++) {
        //                     if(this.isActive(summenu.child[i3].matchurl)) {
        //                         activeKey = summenu.child[i3].key.toString();
        //                         break loop1;
        //                     }
        //                 }
        //             }
        //         }
        //         let menus = nodes[i1].child;
        //         return menus.map(
        //             (m, i) => {
        //                 return (
        //                 <SubMenu key={m.key}  title={<span><Icon type="bars" />{m.name}</span>}>
        //                     {m.child.map(
        //                         (cc, i) => {
        //                             return (
        //                                 <Menu.Item 
        //                                 key={cc.key}
        //                                 keyPath={cc.name}
        //                                 >
        //                                     <Link to={cc.url}>
        //                                         <span><Icon type="minus" />{cc.name}</span>
        //                                     </Link>
        //                                 </Menu.Item>
        //                             );
        //                         }
        //                     )}
        //                 </SubMenu>
        //                 );
        //             }
        //         );
        //     }
            
        // }
        // let menu = _menuProcess(items);
          
        return (
            <Layout className="ant-layout-has-sider">
                <Layout>
                    <Header profile={auth} logout={actions.logout} />
                    <Content >
                        <div style={{ minHeight: 360 }}>
                            <Layout className="ant-layout-container" style={{background : '#fff'}}>
                                {/* <Sider className="left-menu-sider" >               
                                    <Menu mode="inline" 
                                        style={{minHeight: documentHeight}} 
                                        inlineCollapsed={false}        
                                        // defaultSelectedKeys={[activeKey]}                         
                                        defaultOpenKeys={[openKey]}
                                        openKeys={this.state.firstHide ? [openKey] : [this.state.openKey]}
                                        onClick={this.menuClickHandle}
                                        selectedKeys={[activeKey]}
                                        onOpenChange={this.openMenu}
                                    >
                                        {menu}
                                    </Menu>
                                </Sider> */}
                                <SiderMenu />
                                <Layout className='right-content-body'>
                                    {/* <NavPath data={navpath} /> */}                     
                                    <Content className="ant-row" style={{ margin: '0 16px' }}>
                                        <div className="ant-col-md-24" style={{clear: 'both'}}>
                                            {childRoutes.map((route, index) => (
                                                <Route key={index} path={route.path} component={authHOC(route.component)} exactly={route.exactly} />
                                            ))}
                                        {/* {this.props.children}*/}
                                        </div>
                                    </Content>
                                </Layout>
                            </Layout>                            
                        </div>
                    </Content>
                   <Footer />
                </Layout>
            </Layout>
        );
    }
}

App.propTypes = {
    auth: PropTypes.object,
    navpath: PropTypes.array
};

const mapStateToProps = (state) => {
    const { auth, menu } = state;     
    return {
        auth: auth ? auth : null,
        navpath: menu.navpath,
        items : menu.items,
    };
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({fetchProfile, logout, getAllMenu}, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

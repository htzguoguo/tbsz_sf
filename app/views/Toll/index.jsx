
import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { Link, withRouter } from 'react-router-dom';
import { Route, Redirect } from 'react-router-dom';
import { Menu, Icon, Layout} from 'antd';
import { tollChildRoutes } from '../../route';
import authHOC from '../../utils/auth';
import { updateSubMenu, updateNavPath } from '../../actions/menu';
const { Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
import NavPath from '../../components/NavPath';


import './index.less';
class Toll extends Component {     
    constructor(pros) {
        super(pros);
        this.state = {
            openKey: "sub1",
            activeKey: "sidebarsub1",
        };
    }   
    componentWillMount(){
        this.setState({
            height: document.body.clientHeight
        });
    }
    // 自动获取浏览器可视区域高度
    autoHeigth(){
        this.setState({
            height: document.body.clientHeight
        });
    }
    componentDidMount(){
        // 监听window窗口变化,自动调整左侧菜单的高度
        window.addEventListener('resize', this.autoHeigth.bind(this));
    }
    componentWillUnmount(){
        // 组件注销时,移除window的resize事件监听,释放浏览器内存
        window.removeEventListener('resize',this.autoHeigth.bind(this));
    }

    componentWillReceiveProps(nextProps) {
         
    }
    
    menuClickHandle = (item) => {
        this.setState({
            activeKey: item.key
        }) 
        this.props.updateSubMenu('sub1', item.key)
    }


    render() {
        var documentHeight = this.state.height - 64;
        const {navpath} = this.props;
        let { activeKey, openKey } = this.props.menu; 
        //let { activeKey, openKey } = this.state;
            
        return(
            <Layout className="ant-layout-container" style={{background : '#fff'}}>
                <Sider className="left-menu-sider" >               
                    <Menu mode="inline"
                        style={{minHeight: documentHeight}}                         
                        // defaultSelectedKeys={[activeKey]}                         
                        defaultOpenKeys={[openKey]}
                        onClick={this.menuClickHandle}
                        selectedKeys={[activeKey]}
                    >
                        <SubMenu key="sub1"  title={<span><Icon type="bars" />录入</span>}>
                            <Menu.Item key="sidebarsub1">
                                <Link to="/app/toll/take/0/0/0">
                                    <span><Icon type="minus" />录入月水费</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="sidebarsub2">
                                <Link to="/app/toll/list">
                                    <span><Icon type="minus" />浏览月水费</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="sidebarsub3">
                                <Link to="/app/toll/search">
                                    <span><Icon type="minus" />查询月水费</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="sidebarsub4">
                                <Link to="/app/toll/prepare">
                                    <span><Icon type="minus" />自动创建月水费</span>
                                </Link>
                            </Menu.Item>
                            
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout className='right-content-body'>
                    {/* <NavPath data={navpath} /> */}
                    <Content className="ant-row" style={{ margin: '0 16px' }}>
                        <div className="ant-col-md-24" style={{clear: 'both'}}>
                            {tollChildRoutes.map((route, index) => (
                                <Route key={index} path={route.path} component={authHOC(route.component)} exactly={route.exactly} />
                            ))}
                           {/* {this.props.children}*/}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

Toll.propTypes = {     
    navpath: PropTypes.array
};

const mapStateToProps = (state) => {
const { menu } = state;
return {    
    navpath: menu.navpath,
    menu : menu.menu
};
};

function mapDispatchToProps(dispatch) {
    return {
        updateSubMenu: bindActionCreators(updateSubMenu, dispatch),
        updateNavPath: bindActionCreators(updateNavPath, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toll);

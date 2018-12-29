
import React from 'react'
import PropTypes from 'prop-types'
import {  matchPath } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Layout, Row, Col, Icon, Badge, Menu, Dropdown, Avatar, Popover } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getAllMenu, updateNavPath } from '../../actions/menu'
import styles from './index.less';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const defaultProps = {
    items: []
};
const propTypes = {
    items: PropTypes.array,
    profile : PropTypes.object,
    logout : PropTypes.object,
    history : PropTypes.object,
    updateNavPath : PropTypes.func
};

const isActive = (path, history) => {
    let url = history.location.pathname;
    return url.indexOf(path) != -1 || matchPath(path, {
        path: history.location.pathname,
        exact: false,
        strict: false
    })
}

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            current:'video',
            openKey: "sub1",
            activeKey: "menu1",
            collapsed: false,
            mode: 'inline'
        };
    }
    handleLogOut = () => {
        const {logout} = this.props;
        logout().payload.promise.then(() => {
            this.props.history.replace('/login');
        });
    }
    componentDidMount () {
        // this.props.getAllMenu()
    }

    // componentWillReceiveProps(nextProps) {
    //     Array.isArray(nextProps.items) && nextProps.items.map((item, i) => {
    //         Array.isArray(item.child) && item.child.map((node) => {
    //             if(node.baseurl && isActive(node.baseurl, this.props.history)){
    //                 this.menuClickHandle({
    //                     key: 'menu'+node.key,
    //                     keyPath: [node.name, item.name]
    //                 })
    //             }
    //         })
    //     });
    // }
    menuClickHandle = (item) => {
        this.setState({
            activeKey: item.key
        });
        
        this.props.updateNavPath(item.item.props.keyPath, item.key)
    }
    handleClick(e) {
        this.setState({
            current: e.key
        });
    }
    handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            this.handleLogOut();
        }
    }
    render() {
        const { items, updateNavPath, history } = this.props;
        const {profile} = this.props;   
        let { activeKey, openKey } = this.state;             
        let username = profile.user ? profile.user.姓名 : '';
        const adminPanle = (
            <Menu onClick={this.handleMenuClick}>               
                <Menu.Item disabled><Icon type="user" />个人中心</Menu.Item>
                <Menu.Item disabled><Icon type="setting" />设置</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="logout"><Icon type="logout" />
                    退出登录                
                </Menu.Item>
            </Menu>
        );
        const _menuProcess = (nodes, pkey) => {
            return Array.isArray(nodes) && nodes.map((item, i) => {
                    //const menu = _menuProcess(item.child, item.key);
                    if(item.baseurl && isActive(item.baseurl, history)){
                        activeKey = 'menu'+item.key
                        openKey = 'sub'+pkey
                        this.props.updateNavPath(item.name, item.key)
                    }
                    return (
                        <Menu.Item 
                        key={'menu'+item.key}
                        keyPath = {item.name}
                        >
                            {
                                item.url ? <Link to={item.url}>{item.icon && <Icon type={item.icon} theme="outlined"/>}{item.name}</Link> : <span>{item.icon && <Icon type={item.icon} />}{item.name}</span>
                            }
                        </Menu.Item>
                    )
                });
        }

        const menu = _menuProcess(items);

        return(
            <div className="ant-layout-top">
                <div className='header'>
                    <div className='headerWrapper'>
                        <div className='logo'>
                                天保市政水费收费管理系统
                        </div>
                        <Menu theme="dark"
                            mode="horizontal"
                            onClick={this.menuClickHandle}
                            selectedKeys={[activeKey]}
                            defaultSelectedKeys={[activeKey]}
                            style={{}}>
                            {menu}
                          <div className='userInfo'>
                            <Dropdown overlayStyle={{top : '70px'}} placement="bottomCenter" overlay={adminPanle}>
                                <a className="ant-dropdown-link">
                                    <Avatar icon="user"  size="default"  >{username}</Avatar> <Icon type="down" />
                                </a>
                            </Dropdown>
                          </div>
                        </Menu>

                    </div>
                </div>
            </div>


        )
    }

}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

function mapStateToProps(state) {
    return {
        //items: state.menu.items
    }
}

function mapDispatchToProps(dispatch) {
    return {
        //getAllMenu: bindActionCreators(getAllMenu, dispatch),
        updateNavPath: bindActionCreators(updateNavPath, dispatch)
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))



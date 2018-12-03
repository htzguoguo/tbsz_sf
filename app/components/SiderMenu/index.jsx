import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux'
import {Layout, Icon,  Menu} from 'antd';
import { Link, withRouter} from 'react-router-dom';
import {  matchPath } from 'react-router';
import {updateSubMenu } from '../../actions/menu'
import './index.less';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { Sider} = Layout;

class SiderMenu extends React.Component {
    state = {
        firstHide: true,// 点击收缩菜单，第一次隐藏展开子菜单，openMenu时恢复
    };

    constructor(props) {
        super(props);

        this.isInit = false;
    }   
    // 自动获取浏览器可视区域高度
    autoHeigth(){
        this.setState({
            height: document.body.clientHeight
        });
    } 
    
    componentWillMount() {
        this.setState({
            height: document.body.clientHeight
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            activeKey: '',
        })
    }

    isActive = (path) => {
        let url = this.props.history.location.pathname;
        return matchPath(url, {
            path,
            exact: false,
            strict: false
        })
    }

    componentDidUpdate = () => {
        //this.scrollElement();
    }

    openMenu = v => {        
        this.setState({
            openKey: v[v.length - 1],
            firstHide: false,
        })
    };

    menuClickHandle = (v) => {
        this.setState({
            activeKey: v,
        })
        //this.props.updateSubMenu('', v.key, v.item.props.keyPath);
    }

    render() {
        let initUrl = false;
        var documentHeight = this.state.height - 64;
        const {items} = this.props;
        let activeKey, openKey; 
        const _menuProcess = (nodes) => {
            if(nodes && nodes.length > 0) {
                let i1, i2, i3;
                loop1:
                for(i1 = 0; i1 < nodes.length; i1++) {
                    let menu = nodes[i1];
                    for(i2 = 0; i2 < menu.child.length; i2++) {
                        let summenu = menu.child[i2];
                        openKey = summenu.key.toString();
                        for(i3 = 0; i3 < summenu.child.length; i3++) {
                            if(this.isActive(summenu.child[i3].matchurl)) {
                                activeKey = summenu.child[i3].key.toString();
                                this.props.updateSubMenu('', summenu.child[i3].key, summenu.child[i3].name);
                                break loop1;
                            }
                        }
                    }
                }
                let menus;
                if(i1 < nodes.length) {
                    menus =  nodes[i1].child;
                }else {
                    menus = nodes[0].child;
                    initUrl = true;
                }
                return menus.map(
                    (m, i) => {
                        return (
                        <MenuItemGroup key={m.key}  title={<span><Icon type="bars" />{m.name}</span>}>
                            {m.child.map(
                                (cc, i) => {
                                    return (
                                        <Menu.Item 
                                        key={cc.key}
                                        keyPath={cc.name}
                                        >
                                            <Link
                                            ref={
                                                input => {
                                                    if(initUrl) {
                                                        initUrl = false;
                                                        this.props.updateSubMenu('', cc.key, cc.name);
                                                        this.props.history.replace(cc.url);
                                                    }
                                                }
                                            } 
                                            to={cc.url}>
                                                <span><Icon type="minus" />{cc.name}</span>
                                            </Link>
                                        </Menu.Item>
                                    );
                                }
                            )}
                        </MenuItemGroup>
                        );
                    }
                );
            }
            
        }
        
        let menu = _menuProcess(items);
        return (
            <Sider className="left-menu-sider" >               
                <Menu mode="inline" 
                    style={{minHeight: documentHeight}} 
                    inlineCollapsed={true}        
                    //defaultSelectedKeys={[activeKey]}                         
                    defaultOpenKeys={[openKey]}
                    openKeys={this.state.firstHide ? [openKey] : [this.state.openKey]}
                    onClick={this.menuClickHandle}
                    selectedKeys={[activeKey]}
                    onOpenChange={this.openMenu}
                >
                    {menu}
                </Menu>
            </Sider>
        );
    }
}

SiderMenu.propTypes = {
    history : PropTypes.object,
    items: PropTypes.array,
    updateSubMenu : PropTypes.func
};

const mapStateToProps = (state) => {
    // const {  menu } = state;     
    // return {
    //     items : menu.items,
    // };
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        //getAllMenu: bindActionCreators(getAllMenu, dispatch),
        updateSubMenu: bindActionCreators(updateSubMenu, dispatch)
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SiderMenu));

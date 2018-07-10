
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Route, Redirect } from 'react-router-dom';
import { Menu, Icon, Layout} from 'antd';
import { yghtChildRoutes } from '../../route'
import authHOC from '../../utils/auth'
const { Sider, Content } = Layout;
const SubMenu = Menu.SubMenu;
import './index.less';
export default class Video extends Component {
    constructor(pros) {
        super(pros);
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
    render() {
        var documentHeight = this.state.height - 64;
        return(
            <Layout className="ant-layout-container" style={{background : '#fff'}}>
                <Sider className="left-menu-sider" >
                    <Menu mode="inline"
                          style={{minHeight: documentHeight}}
                          defaultOpenKeys={['sub1','sub2']}
                    >
                        <SubMenu key="sub1" title={<span><Icon type="bars" />养护项目管理</span>}>
                            <Menu.Item key="1">
                                <Link to="/app/yght/list">
                                    <span><Icon type="minus" />项目列表</span>

                                </Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Link to="/app/yght/edit/0">
                                    <span><Icon type="minus" />新建</span>

                                </Link>
                            </Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout className='right-content-body'>
                    <Content className="ant-row" style={{ margin: '0 16px' }}>
                        <div className="ant-col-md-24" style={{clear: 'both'}}>
                            {yghtChildRoutes.map((route, index) => (
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

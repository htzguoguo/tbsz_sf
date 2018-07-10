import React from 'react';
import {Layout, Menu, Breadcrumb, Icon} from 'antd';
const {SubMenu} = Menu;
const {Header, Content, Sider, Footer} = Layout;
import App from '../App.jsx';

export default class SiderHeaderContentFooter extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed : false
        };
    }
    onCollagse = (collapsed) => this.setState({collapsed})
    render () {
        return (
            <Layout className="layout" style={{minHeight : '100vh'}}>
                <Sider  collapsible

                        collapsed={this.state.collapsed}
                        onCollapse={this.onCollagse}
                >
                    <div className="logo"></div>
                    <Menu theme="dark"
                          mode="inline"
                          defaultSelectedKeys={['2']}
                    >
                        <Menu.Item key="1">
                            <Icon type="pie-chart"/>
                            <span>Option1</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="desktop"/>
                            <span>Option2</span>
                        </Menu.Item>
                        <SubMenu key="sub1" title={<span><Icon type="user"/><span>user</span></span>}>
                            <Menu.Item key="3">Mike</Menu.Item>
                            <Menu.Item key="4">Tom</Menu.Item>
                            <Menu.Item key="5">Lily</Menu.Item>
                        </SubMenu>
                        <SubMenu key="sub2" title={<span><Icon type="team"/><span>team</span></span>}>
                            <Menu.Item key="6">team 1</Menu.Item>
                            <Menu.Item key="7">team 2</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="8">
                            <Icon type="file"/>
                            <span>file</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{background : '#fff', padding : 0}}>
                        <Menu
                            mode="horizontal"
                            theme="light"
                            defaultSelectedKeys={['12']}
                            style={{lineHeight : '64px'}}
                        >
                            <Menu.Item key="11">巡查上报</Menu.Item>
                            <Menu.Item key="12">巡查派单</Menu.Item>
                            <Menu.Item key="13">巡查反馈</Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{margin : '0 16px'}}>
                        <Breadcrumb style={{margin : '16px 0'}}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>App</Breadcrumb.Item>
                            <Breadcrumb.Item>List</Breadcrumb.Item>
                        </Breadcrumb>
                        <App/>
                    </Content>
                    <Footer style={{textAlign : 'center'}}>
                        Ant Design ©2016 Created by Ant UED
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

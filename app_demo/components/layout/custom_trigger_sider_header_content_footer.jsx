import React from 'react';
import App from '../App.jsx';
import {Layout, Menu, Icon, Breadcrumb, Dropdown, Button} from 'antd';
import {Avatar} from 'antd';
import {Row, Col} from 'antd';
const {SubMenu} = Menu;
const {Header, Content, Footer, Sider} = Layout;

export default class CustomTriggerSiderHeaderContentFooter extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed : false
        };
    }
    toggle = () => this.setState({collapsed : !this.state.collapsed});
    render () {
        const User = (
            <Menu>
                <Menu.Item>信息</Menu.Item>
                <Menu.Item>设置</Menu.Item>
                <Menu.Item>退出</Menu.Item>
            </Menu>
        );
        return (
            <Layout style={{minHeight : '100vh'}}>
                <Sider collapsible
                        collapsed={this.state.collapsed}
                        trigger={null}
                        collapsedWidth={0}
                        breakpoint="lg"

                >
                    <div className="logo"></div>
                    <Menu mode='inline'
                          theme="dark"
                          defaultSelectedKeys={['user1']}
                          defaultOpenKeys={['user']}
                    >
                        <Menu.Item key="1">
                            <Icon type="mail"/>
                            <span>巡查点位</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="link"/>
                            <span>巡查记录</span>
                        </Menu.Item>
                        <SubMenu key="user" title={<span><Icon type="user"/>用户管理</span>}>
                            <Menu.Item key="user1">添加用户</Menu.Item>
                            <Menu.Item key="user2">编辑用户</Menu.Item>
                            <Menu.Item key="user3">删除用户</Menu.Item>
                        </SubMenu>
                        <SubMenu key="utility" title={<span><Icon type="solution"/>权限管理</span>}>
                            <Menu.Item key="utility1">添加权限</Menu.Item>
                            <Menu.Item key="utility2">编辑权限</Menu.Item>
                            <Menu.Item key="utility3">删除权限</Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout>
                    <Header mode='horizontal' style={{background : '#fff', padding : 0}}>
                        <Row type='flex' align='middle' justify='start'>
                            <Col span={2}>
                                <Icon
                                    className="trigger"
                                    onClick={this.toggle}
                                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                />
                            </Col>
                            <Col span={20}>
                                <Menu
                                    style={{lineHeight : '64px'}}
                                    defaultSelectedKeys={['2']}
                                    mode='horizontal'
                                >
                                    <Menu.Item key="1">巡查上报</Menu.Item>
                                    <Menu.Item key="2">案件派单</Menu.Item>
                                    <Menu.Item key="3">派单反馈</Menu.Item>
                                </Menu>
                            </Col>
                            <Col span={2}>
                                <Dropdown overlay={User} placement="bottomCenter">
                                    <Icon type="user" className="trigger"/>
                                </Dropdown>
                            </Col>
                        </Row>
                    </Header>
                    <Content style={{margin : '24px 16px', padding : 24, background : '#fff'}}>
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

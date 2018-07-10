import React from 'react';
import {Layout, Menu, Breadcrumb, Icon} from 'antd';
const {SubMenu} = Menu;
const {Content, Header, Footer, Sider} = Layout;
import App from '../App.jsx';

export default class HeaderSiderContentFooter extends React.Component {
    render () {
        return (
            <Layout>
                <Header className="header">
                    <div className="logo"></div>
                    <Menu  theme="dark"
                           mode="horizontal"
                           defaultSelectedKeys={['2']}
                           style={{lineHeight : '64px'}}>
                        <Menu.Item key="1">巡查上报</Menu.Item>
                        <Menu.Item key="2">巡查派单</Menu.Item>
                        <Menu.Item key="3">派单反馈</Menu.Item>
                    </Menu>
                </Header>
                <Layout>
                    <Sider width={200} style={{background : '#fff'}}>
                        <Menu mode="inline"
                              defaultSelectedKeys={["1"]}
                              defaultOpenKeys={['sub1']}
                              style={{height : '100%', borderRight : 0}}
                        >
                            <SubMenu key="sub1" title={<span><Icon type="user"/>subnav 1</span>}>
                                <Menu.Item key="1">option 5</Menu.Item>
                                <Menu.Item key="2">option 6</Menu.Item>
                                <Menu.Item key="3">option 7</Menu.Item>
                                <Menu.Item key="4">option 8</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" title={<span><Icon type="laptop"/>subnav 2</span>}>
                                <Menu.Item key="5">option 1</Menu.Item>
                                <Menu.Item key="6">option 1</Menu.Item>
                                <Menu.Item key="7">option 1</Menu.Item>
                                <Menu.Item key="8">option 1</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub3" title={<span><Icon type="notification"/>subnav 3</span>}>
                                <Menu.Item key="9">option 1</Menu.Item>
                                <Menu.Item key="10">option 1</Menu.Item>
                                <Menu.Item key="11">option 1</Menu.Item>
                                <Menu.Item key="12">option 1</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Layout style={{padding : '0 24px 24px'}}>
                        <Breadcrumb style={{margin : '16px 0'}}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>List</Breadcrumb.Item>
                            <Breadcrumb.Item>App</Breadcrumb.Item>
                        </Breadcrumb>
                        <Content style={{background : '#fff', padding : '24px', margin : 0, minHeight : '280px'}}>
                            <App/>
                        </Content>
                    </Layout>
                </Layout>
                <Footer>

                </Footer>
            </Layout>
        );
    }
}

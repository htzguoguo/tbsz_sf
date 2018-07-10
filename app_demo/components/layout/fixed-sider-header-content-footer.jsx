import React from 'react';
import App from '../App.jsx';
import {Layout, Icon, Breadcrumb, Menu} from 'antd';
const {Header, Content, Footer, Sider} = Layout;

export default class FixedSiderHeaderContentFooter extends React.Component{
    render () {
        return (
            <Layout>
                <Sider style={{overflow : 'auto', height : '100vh', position : 'fixed', left : 0}}>
                    <div className="logo"></div>
                    <Menu mode="inline"
                          theme="dark"
                          defaultSelectedKeys={['3']}

                    >
                        <Menu.Item key="1">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="1">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="5">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="6">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="7">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                        <Menu.Item key="8">
                            <Icon type="user"/>
                            <span>nav1</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{marginLeft : 200}}>
                    <Header style={{background : '#fff', padding : 0}}></Header>
                    <Content style={{margin : '24px 16px 0', padding : 8, background : '#fff'}}>
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

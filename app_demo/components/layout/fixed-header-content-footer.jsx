import React from 'react';
import {Layout, Menu, Breadcrumb, Icon} from 'antd';
import App from '../App.jsx';
const {Header, Content, Footer} = Layout;

export default class FixedHeaderContentFooter extends React.Component {
    render () {
        return (
            <Layout>
                <Header style={{width : '100%',zIndex : '9999', position : 'fixed'}}>
                    <div className="logo-header"></div>
                    <Menu mode="horizontal"
                          theme="dark"
                          defaultSelectedKeys={['1']}
                          style={{lineHeight : '64px'}}
                    >
                        <Menu.Item key="1">Nav1</Menu.Item>
                        <Menu.Item key="2">Nav2</Menu.Item>
                        <Menu.Item key="3">Nav3</Menu.Item>
                    </Menu>
                </Header>
                <Content style={{padding : '0 50px', marginTop : '64px'}}>
                    <Breadcrumb style={{margin : '8px 0'}}>
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
        );
    }
}

import React from 'react';
import {Layout, Menu, Breadcrumb} from 'antd';
const {Header, Content, Footer} = Layout;
import App from '../App.jsx';

export default class HeaderContentFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state =  {
            windowHeight: window.innerHeight
        };
    }
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = (e) => {
        this.setState({windowHeight: window.innerHeight})
    };
    render () {
        const minHeight = this.state.windowHeight - 172;
        return (
                <Layout className="layout" style={{height:"100vh"}}>
                    <Header theme="light">
                        <div className="logo"></div>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            defaultSelectedKeys={['2']}
                            style={{lineHeight : '64px'}}
                        >
                            <Menu.Item key="1">Nav1</Menu.Item>
                            <Menu.Item key="2">Nav2</Menu.Item>
                            <Menu.Item key="3">Nav3</Menu.Item>
                        </Menu>
                    </Header>
                    <Content style={{padding : '0 50px'}}>
                        <Breadcrumb style={{margin : '16px 0'}}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>List</Breadcrumb.Item>
                            <Breadcrumb.Item>App</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{minHeight : '240px', padding : 24, background : '#fff' }}>
                            <App/>
                        </div>
                    </Content>
                    <Footer style={{textAlign : 'center'}}>
                        Ant Design ©2016 Created by Ant UED
                    </Footer>
                </Layout>
            )

    }
}

import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Icon, message, notification, Row, Col, Checkbox  } from 'antd'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { login } from '../../actions/auth'
const FormItem = Form.Item
import styles from './index.less';

function noop() {
    return false;
}

const propTypes = {
    user: PropTypes.object,
    loggingIn: PropTypes.bool,
    loginErrors: PropTypes.string
};
//import './login.less';

class Login extends React.Component  {
    constructor(pros) {
        super(pros);
        this.state = {
            loading: false,
            height: document.body.clientHeight
        }
    }

    handleSubmit (e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                this.props.login(values.user, values.password).payload.promise.then(res => {
                    this.setState({
                        loading: false
                    });
                    if (res.error) {
                        /* message.error(res.payload.response.data.message);*/
                        notification.error({
                            message: '提示',
                            description: res.payload.response.data.error.message,
                            duration: 3,
                        });
                    }
                    if (!res.error && res.payload.data)  {
                        /*  message.success('Welcome ' + res.payload.data.name);*/
                        notification.success({
                            message: '提示',
                            description: '欢迎登陆：' + res.payload.data.user.姓名,
                            duration: 3,
                        });
                        //this.props.history.replace('/app/toll/take/0/0/0');
                        this.props.history.replace('/home');
                    }
                }).catch(err => {
                    this.setState({
                        loading: false
                    });
                })
            }
        });

    }

    componentWillMount(){
        // this.setState({
        //     height: document.body.clientHeight
        // });
    }
    // 自动获取浏览器可视区域高度

    autoHeigth(){
        this.setState({
            height: document.body.clientHeight
        });
    }

    componentDidMount(){
        // 监听window窗口变化,自动调整左侧菜单的高度
        //window.addEventListener('resize', this.autoHeigth.bind(this));
    }

    componentWillUnmount(){
        // 组件注销时,移除window的resize事件监听,释放浏览器内存
        //window.removeEventListener('resize',this.autoHeigth.bind(this));
    }

    render() {
        const { getFieldProps, getFieldDecorator  } = this.props.form;
        var documentHeight = this.state.height - 64;

        return(
            <div className="user-login-5"  style={{minHeight: documentHeight}}>
                <Row className="bs-reset">
                    <Col span={24} className="login-top">
                        <div className="login-ban">
                        </div>
                        <Col className="login-form">
                            <Form horizontal>
                                <Col xs={3} sm={5} md={7} lg={9} xl={11} className="login-logo"></Col>
                                <Col xs={3} sm={5} md={7} lg={9} xl={11} className="login-pic"></Col>
                                <Col xs={3} sm={5} md={7} lg={9} xl={11}className="div-login">
                                <Row type="flex" justify="space-between">
                                    <Col span={14}>
                                        <FormItem>
                                                {getFieldDecorator(
                                                    'user',
                                                    {
                                                        rules: [{ required: true, message: '请输入用户名!' }],
                                                        initialValue: '刘海英',
                                                    }
                                                )(
                                                    <Input                                                    
                                                        id="ant-input-user" type="text"
                                                        placeholder="账户"                                                     
                                                        />
                                                )}
                                            </FormItem>
                                    
                                    
                                        <FormItem>
                                                {getFieldDecorator(
                                                    'password',
                                                    {
                                                        rules: [{ required: true, message: '请输入密码!' }],
                                                        initialValue: '123',
                                                    }
                                                )(
                                                    <Input  type="password"
                                                            autoComplete="off"
                                                            placeholder="密码"
                                                            onContextMenu={noop}
                                                            onPaste={noop}
                                                            onCopy={noop}
                                                            onCut={noop}
                                                            setFieldsValue="123456"
                                                    />
                                                )}

                                            </FormItem>
                                        </Col>
                                            
                                        <Col span={7} className="text-right">
                                            <FormItem>
                                                <Button type="primary" size="large" icon="poweroff" loading={this.state.loading} style={{width:"100%",height:38,fontSize:16}}
                                                        onClick={this.handleSubmit.bind(this)}
                                                >
                                                    登录
                                                </Button>
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    </Col>
                            </Form>
                        </Col>
                    </Col>
                      <div className="login-footer">
                            <div className="row">
                                <div className="col-xs-24 bs-reset">
                                    <div className="login-copyright">
                                        <p>天津容数科技 版权所有 © 2017 www.tjxrs.cn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                </Row>
            </div>
        );
    }
}
Login.propTypes = propTypes;
Login = Form.create()(Login);

function mapStateToProps(state) {
    const {auth} = state;
    if (auth.user) {
        return {user: auth.user, loggingIn: auth.loggingIn, loginErrors: ''};
    }

    return {user: null, loggingIn: auth.loggingIn, loginErrors: auth.loginErrors};
}

function mapDispatchToProps(dispatch) {
    return {
        login: bindActionCreators(login, dispatch)
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login))

import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, message, notification, Row, Col, Checkbox  } from 'antd'
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
            loading: false
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
                        console.log('res.payload.data',res.payload.data );
                        notification.success({
                            message: '提示',
                            description: '欢迎登陆：' + res.payload.data.user.truename,
                            duration: 3,
                        });
                        this.props.history.replace('/app/yght/list');
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
        const { getFieldProps, getFieldDecorator  } = this.props.form;
        var documentHeight = this.state.height - 64;

        return(
            <div className="user-login-5"  style={{minHeight: documentHeight}}>
                <Row className="bs-reset">
                    <Col span={12} className="bs-reset mt-login-5-bsfix">
                        <div className="login-bg">
                          {/*  <img className="login-logo" src="./assets/images/login/logo.png" />*/}
                        </div>
                    </Col>
                    <Col span={12} className="login-container bs-reset mt-login-5-bsfix">
                        <div className="login-content">
                            <h1 style={{color: 'dodgerblue',marginBottom: '0px'}}>欢迎登录</h1>
                            <h1 style={{marginTop: '0px'}}>天保市政水费收费管理系统</h1>
                            <Form  className="login-form" >
                                <Row type="flex" justify="space-between">
                                    <Col span={11}>
                                        <FormItem  className='bottom-line-input'>
                                            {getFieldDecorator('user')(
                                                <Input id="ant-input-user" type="text"
                                                       placeholder="账户"
                                                       style={{height:38, border : '0px'}} />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={11}>
                                        <FormItem className='bottom-line-input'>
                                            {getFieldDecorator('password')(
                                                <Input  type="password"
                                                        autoComplete="off"
                                                        placeholder="密码"
                                                        style={{height:38, border : '0px'}}
                                                        onContextMenu={noop}
                                                        onPaste={noop}
                                                        onCopy={noop}
                                                        onCut={noop}
                                                />
                                            )}

                                        </FormItem>
                                    </Col>

                                </Row>
                                <Row className="row">
                                    <Col span={20}>
                                        <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                                            <Checkbox>
                                                记住密码
                                            </Checkbox>
                                        </div>
                                    </Col>
                                    <Col span={4} className="text-right">
                                        <FormItem>
                                            <Button type="primary" size="large" icon="poweroff" loading={this.state.loading} style={{width:"100%",height:38,fontSize:16}}
                                                    onClick={this.handleSubmit.bind(this)}
                                            >
                                                登录
                                            </Button>
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <div className="login-footer">
                            <div className="row bs-reset">
                                <div className="col-xs-5 bs-reset">

                                </div>
                                <div className="col-xs-7 bs-reset">
                                    <div className="login-copyright text-right">
                                        <p>天津容数科技 版权所有 © 2017 www.tjxrs.cn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
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

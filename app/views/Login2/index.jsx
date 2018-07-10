import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, message, notification } from 'antd'
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

    submitLogin(e) {
        e.preventDefault();
        let loginInfo = this.props.form.getFieldsValue();

        if(loginInfo.userName !='admin' || loginInfo.password !='123456' ){
            message.error('登录账号错误,请重新登录!(admin,123456)');
        }else{
            hashHistory.push('/app');
        }
    }

     handleSubmit (e) {
         e.preventDefault();
         this.setState({
             loading: true
         });
         const data = this.props.form.getFieldsValue();
         this.props.login(data.user, data.password).payload.promise.then(res => {
             this.setState({
                 loading: false
             });
             if (res.error) {
                /* message.error(res.payload.response.data.message);*/
                 notification.error({
                     message: '提示',
                     description: res.payload.response.data.message,
                     duration: 3,
                 });
             }
             if (!res.error && res.payload.data)  {
               /*  message.success('Welcome ' + res.payload.data.name);*/
                 notification.success({
                     message: '提示',
                     description: '欢迎登陆：' + res.payload.data.name,
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
        const { getFieldProps } = this.props.form;
        var documentHeight = this.state.height - 64;

        return(
            <div className='loginBg' style={{minHeight: documentHeight}}>
                <div className='login_header'>

                    <div className='login_header_nav'>

                        <h1 className='pull-left'>
                            <span className='my_logo'>
	                            天津长深高速公路（北段）精细化日常养护管理系统
                            </span>
                        </h1>
                        <div className="pull-right">
                            <ul className="my-nav">


                            </ul>
                        </div>
                    </div>
                </div>
                <div className='login_content'>
                    <section className='login_form'>
                        <div className='login_title'>
                            <h2 style={{fontSize:'18px',color:'#666666'}}>欢迎登录长深高速养护系统管理平台</h2>
                        </div>
                        <div className='login_input'>
                            <Form horizontal>
                                <FormItem
                                >

                                    <Input type="text"
                                           {...getFieldProps('user')}
                                           placeholder="账户"
                                           style={{height:38}} />

                                </FormItem>

                                <FormItem
                                >

                                    <Input  type="password"
                                            {...getFieldProps('password')}
                                            autoComplete="off"
                                            placeholder="密码"
                                            style={{height:38}}
                                            onContextMenu={noop}
                                            onPaste={noop}
                                            onCopy={noop}
                                            onCut={noop}
                                    />

                                </FormItem>

                                <FormItem>


                                        <Button type="primary" size="large" icon="poweroff" loading={this.state.loading} style={{width:"100%",height:38,fontSize:16}}
                                            onClick={this.handleSubmit.bind(this)}
                                        >
                                            登录
                                        </Button>
                                    </FormItem>
                                </Form>
                        </div>
                    </section>
                </div>
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

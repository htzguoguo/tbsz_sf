import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    Button, Form, Input,
    Select,  notification,
    Row, Divider, Checkbox,
    Col, 
    Icon, Spin } from 'antd';
 
   
const Option = Select.Option; 
const FormItem = Form.Item;
import api from '../../../api';
import styles from './index.less';


const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

class UnitCollectionEntry extends Component{

    constructor(props) {
        super(props);
        this.num = props.match.params.num;           
        this.selectedNum = '0000'; 
        this.collectionType = '0';      
    }

    state = {
        units: [],
        value: [],
        fetching: false,
        banks : [],
        pipes : [],
        chargestandard : [],
        unitkinds : [],         
        usekinds : [] ,
        inputkinds : [],
        chargekinds : [],
        firestandard : []
    }

    componentDidMount() {
        api.get(`unit/unitparas`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;            
            this.setState({...data});           
        }).catch(this.handleError);         
    }    

    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，请您检查!',
                    duration: 3,
                });
                return;
            } 
            if(values.开户行行名 && values.开户行行名.length > 0) {
                if(!values.开户行行号) {
                    this.props.form.setFields({
                        开户行行号: {
                            value: values.开户行行号,
                            errors: [new Error('请输入银行代码!')],
                        },
                    });
                    this.bankid.focus();
                    return;
                }
            }                       
            api.put('unit/collection',values).then((data) => {
                notification.success({
                    message: '提示',
                    description: data.data,
                    duration: 3,
                });
            }).catch(this.handleError);
        });
    }  

    showNotification = (type, desc) => {
        notification[type]({ 
            message: '提示',            
            description: desc,
            duration: 3,
        });
    }

    handleError = (error) => {
        if(error.response.status === 404) {
            this.showNotification('warning', '没有发现相关的记录!');
        }
    }

    handlePrior = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) > 0 ?
        this.props.form.getFieldValue('编号') : this.selectedNum;       
        api.get(`unit/collection/prior/${num}/${this.collectionType}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的前一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }

    handleNext = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) > 0 ?
                    this.props.form.getFieldValue('编号') : this.selectedNum;
        api.get(`unit/collection/next/${num}/${this.collectionType}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的后一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }

    onSelectChange = (e) => {
        this.selectType = e.target.value;       
    }  

    onBankNameChange = (value) => {
        const {setFieldsValue} = this.props.form;
        let bank = this.state.banks.find(
            b => b.开户行行名 === value
        );        
        if(bank) {
            setFieldsValue({'开户行行号' : bank.开户行行号 });
            if(bank.是否验证 === 'Y') {
                setFieldsValue({'帐号' : bank.帐号相同代码 });
                this.IA = parseInt(bank.帐号位数 ); 
                this.IB = parseInt(bank.帐号相同位数 );
                this.SSB = bank.帐号相同代码;
            }
            setFieldsValue({'业务种类' : bank.业务种类 });
            setFieldsValue({'银行代码' :  bank.开户行行号.slice(0,3) });
        }
    }

    fetchUser = (value) => {   
        if(value && value.length > 0) {
            this.setState({ units: [], fetching: true });
            api.get(`unit/unitsabbr/${value}`, {            
                responseType: 'json'
            }).then((data) => {
                let units = data.data;             
                this.setState({ units, fetching: false });
            });    
        }
    }
    
    handleAfterFetchQuery(item) {        
        this.props.form.resetFields();           
        this.props.form.setFieldsValue(item);
    }

    fetchUnitByNum = (value) => {
        api.get(`unit/units/${value}`, {            
            responseType: 'json'
        }).then((data) => {
            let units = data.data; 
            this.handleAfterFetchQuery(units[0]);
        });  
    }
    
    handleChange = (value) => {         
        this.setState({
            value,
            fetching: false,
        });        
        this.fetchUnitByNum(value.key);
    }

    onCollectionChange = (e) => {        
        this.collectionType = e.target.checked;       
    }

    render() {
        const { fetching, units, value } = this.state;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        const {  getFieldDecorator } = this.props.form;
        return (
            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>{'托收信息录入修改'}</h5>
                    </div>
                </div>
                <Row style={{ marginBottom: 16 }}  >                   
                    <Col span={10}>
                    <Select
                        showSearch
                        labelInValue
                        value={value}
                        placeholder="用户拼音"
                        notFoundContent={fetching ? <Spin size="small" /> : null}
                        filterOption={false}
                        onSearch={this.fetchUser}
                        onChange={this.handleChange}
                        style={{ width: '100%' }}
                    >
                        {units.map(d => <Option key={d.编号}>{d.编号}-{d.用户拼音}-{d.户名}</Option>)}
                    </Select>
                    </Col>
                    <Col offset={1} span={5}>
                        <Button.Group size="default">
                            <Button onClick={this.handlePrior} type="primary">
                                <Icon type="left" />前一项
                            </Button>
                            <Button onClick={this.handleNext} type="primary">
                                后一项<Icon type="right" />
                            </Button>
                            </Button.Group>
                    </Col> 
                    <Col> 
                        <Checkbox style={{marginTop : '5px'}} onChange={this.onCollectionChange}>托收</Checkbox>
                    </Col>  
                </Row>                
                <Form id="unitEntryForm" className={styles.unitEntryForm} layout="horizontal" form={this.props.form}>
                    <Divider dashed><h5>基本信息</h5></Divider>  
                    <Row> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="编号"                                     
                                >
                                    {getFieldDecorator(
                                        '编号',
                                        {
                                            rules: [{
                                                required: true, message: '请点击[增加]按钮生成企业编号!',
                                            }] ,
                                                                                        
                                        }
                                    )(
                                        <Input  placeholder="" disabled/>
                                    )}
                            </FormItem>            
                        </Col>
                        <Col span={16}>
                            <FormItem
                                    label="户名"
                                    labelCol={{span: 3}}
                                    wrapperCol= {{ span: 20 }}
                                >
                                    {getFieldDecorator(
                                        '户名',
                                        {
                                            rules: [{
                                                required: true, message: '请输入企业名称!',
                                            }]                                             
                                        }
                                    )(
                                        <Input  placeholder=""/>
                                    )}
                            </FormItem>   
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="用户简称"
                                    
                                >
                                    {getFieldDecorator('用户简称')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="用户拼音"                                     
                                >
                                    {getFieldDecorator(
                                        '用户拼音',
                                        {                               
                                            initialValue : ''
                                        }  
                                    )(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="组织代码"
                                    
                                >
                                    {getFieldDecorator(
                                        '组织代码',
                                        {                               
                                            initialValue : ''
                                        } 
                                    )(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="帐户地址"
                                    
                                >
                                    {getFieldDecorator('帐户地址')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="联系人"
                                    
                                >
                                    {getFieldDecorator('联系人')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="电话"
                                    
                                >
                                    {getFieldDecorator('电话')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="开户行"
                                >
                                    {getFieldDecorator('开户行行名')(
                                        <Select
                                        showSearch
                                        allowClear={true}
                                        onChange={this.onBankNameChange}
                                        style={{ width: '100%' }}
                                        >   
                                            {banks.map(d => <Option key={d.开户行行名}>{d.开户行行名}</Option>)}                                      
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="行号"                                    
                                >
                                    {getFieldDecorator(
                                        '开户行行号'
                                    )(
                                        <Select
                                        ref={input => this.bankid = input}
                                        showSearch
                                        allowClear={true}
                                        style={{ width: '100%' }}
                                        >  
                                        {banks.map(d => <Option key={d.开户行行号}>{d.开户行行号}</Option>)}                                         
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="银行代码"
                                >
                                    {getFieldDecorator('银行代码')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="银行账号"
                                    
                                >
                                    {getFieldDecorator('帐号')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="协议书号"
                                >
                                    {getFieldDecorator('协议书号')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="业务种类"
                                    
                                >
                                    {getFieldDecorator('业务种类')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>   
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="托收联系人"
                                    
                                >
                                    {getFieldDecorator('托收联系人')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={16}>
                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="托收电话"
                                    
                                >                                 
                                {getFieldDecorator('托收电话')(
                                    <Input  placeholder="" />
                                )}                                
                            </FormItem>      
                            </Col>        
                            <Col span={12}>
                            </Col>         
                        </Col>
                    <Divider dashed><h5>分类信息</h5></Divider>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="单位性质"
                                >
                                    {getFieldDecorator('单位性质编号')(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        >  
                                        {unitkinds.map(d => <Option key={d.单位性质编号}>{d.单位性质编号}-{d.单位性质}</Option>)}                                       
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="扣水单位编号"
                                    
                                >
                                    {getFieldDecorator('扣水单位编号')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>                                     
                    </Row> 
                    <Divider></Divider>
                    <FormItem wrapperCol={{ span: 10 }}>
                        <Col span={12} >                           
                        </Col>    
                        <Col span={12} >
                            <Button type="primary" icon="save" onClick={this.handleSubmit.bind(this)}>保存</Button>
                            &nbsp;&nbsp;&nbsp;
                            <Button type="ghost" icon="close" onClick={this.handleReset.bind(this)}>重置</Button>
                        </Col>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

UnitCollectionEntry.propTypes = {
    form: PropTypes.object,
    match : PropTypes.object,
};


let entry = Form.create({})(UnitCollectionEntry);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

function mapDispatchToProps(dispatch) {
return {actions: bindActionCreators({}, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(entry);

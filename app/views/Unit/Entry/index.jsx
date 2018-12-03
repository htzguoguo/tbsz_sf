import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    Button, Form, Input,
    Select,  notification,
    Row, Divider, 
    Col, Radio, DatePicker,
    InputNumber, Icon, Spin } from 'antd';
 
import moment from 'moment';    
const Option = Select.Option;



const FormItem = Form.Item;
import api from '../../../api';
import styles from './index.less';

const dateFormat = 'YYYYMMDD';
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};
const datePickers =  ['用水日期', '装表日期', '使用期限',
'退续用手续' , '拆表日期', '表损日期', '换表日期'];

class UnitEntry extends Component{

    constructor(props) {
        super(props);
        this.num = props.match.params.num;
        this.isEdit = this.num === '0' ? false : true;
        this.year = props.match.params.year;
        this.month = props.match.params.month;
        
        this.onFeeSearch = this.onFeeSearch.bind(this);
        this.onYearChange = this.onYearChange.bind(this);
        this.onMonthChange = this.onMonthChange.bind(this);
        this.handleQueryUnitNum = this.handleQueryUnitNum.bind(this);
        this.selectedYear = this.isEdit ? this.year : 2017;
        this.selectedMonth = this.isEdit ? this.month : '07';
        //this.selectedNum = this.isEdit ? this.num : '0002';
        this.selectedNum = '0002';
        this.selectType = '3';
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
        // if (this.isEdit) {
        //     this.onFeeSearch(this.num);
        // }
    }    

    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    } 
    
    formatDatePickerValue = (obj, keys) => {
        keys.forEach(
            key => {
                obj[key] = obj[key] ? obj[key].format(dateFormat) : '';
            }
        );
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
            this.formatDatePickerValue(
                values,
                datePickers
            );            
            api.put('unit/unit',values).then((data) => {
                notification.success({
                    message: '提示',
                    description: data.data,
                    duration: 3,
                });
            }).catch(this.handleError);
        });
    }

    handleQueryUnitNum() {         
        this.props.form.validateFieldsAndScroll(['用水形式编号'], (errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '请先选择用水形式,才能自动生成编号!',
                    duration: 3,
                });
                return;
            }           
            api.get(`unit/unitnum/${values.用水形式编号}`).then((data) => {
                data = data.data;  
                this.props.form.resetFields();       
                this.props.form.setFieldsValue(data);
                this.showNotification(
                    'success',
                    `生成编号为[${data.编号}]`
                );                
            }).catch(this.handleError);
        });
    }

    onYearChange(year) {
        this.selectedYear = year;
    }

    onMonthChange(month) {
        this.selectedMonth = month;
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

    onFeeSearch(num) {        
        let year = this.selectedYear;
        let month = this.selectedMonth;
        this.selectedNum = num;
        api.get(`water/fee/${num}/${year}/${month}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);
            
        }).catch(this.handleError);
    }

    handlePrior = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) > 0 ?
        this.props.form.getFieldValue('编号') : this.selectedNum;       
        api.get(`unit/prior/${num}`, {            
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
        api.get(`unit/next/${num}`, {            
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

    onPipeDiaChange = (value) => {         
        value = parseInt(value);
        let index = 0;
        this.state.firestandard.forEach(
            item => {
                if (value >= parseInt(item.管径)) {
                    index = parseInt(item.防火标准编号)
                }
            }
        );
        this.props.form.setFieldsValue({'防火标准编号' : (index + 1).toString() });
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
        datePickers.forEach(
            d => {
                if(item[d] && item[d].length > 0) {
                    item[d] = moment(item[d], dateFormat);
                }
                
            }
        );
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

    render() {
        const { fetching, units, value } = this.state;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        const {  getFieldDecorator } = this.props.form;
        const userWater = this.props.form.getFieldValue('用水形式编号');
        return (
            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>{this.isEdit ? '修改单位基本信息' : '录入单位基本信息'}</h5>
                    </div>
                </div>
                <Row style={{ marginBottom: 16 }} >                   
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
                        <Button type="danger" icon="code-o" onClick={this.handleQueryUnitNum}>增加</Button>                                                  
                    </Col>  
                </Row>                
                <Form id="unitEntryForm" className={styles.unitEntryForm} layout="horizontal" form={this.props.form}>
                  <Row>
                    <Divider dashed><h5>分类信息</h5></Divider> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="费用标准"
                                >
                                    {getFieldDecorator(
                                        '区号',
                                        {
                                            rules: [{
                                                required: true, message: '请选择费用标准!',
                                            }]                                             
                                        }
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        > 
                                        {chargestandard.map(d => <Option key={d.区号}>{d.区号}-{d.单价}</Option>)}                                      
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="抄表形式"
                                >
                                    {getFieldDecorator(
                                        '抄表形式编号',                                        
                                        {
                                            rules: [{
                                                required: true, message: '请选择抄表形式!',
                                            }]                                             
                                        }
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        >  
                                        {inputkinds.map(d => <Option key={d.抄表形式编号}>{d.抄表形式编号}-{d.抄表形式}</Option>)}                                      
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="用水形式"
                                >
                                    {getFieldDecorator(
                                        '用水形式编号',
                                        {
                                            rules: [{
                                                required: true, message: '请选择用水形式!',
                                            }]                                             
                                        }
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        > 
                                        {usekinds.map(d => <Option key={d.用水形式编号}>{d.用水形式编号}-{d.用水形式}</Option>)}    
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="收费形式"
                                >
                                    {getFieldDecorator(
                                        '收费形式编号',
                                        {
                                            rules: [{
                                                required: true, message: '请选择收费形式!',
                                            }]                                             
                                        }
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        > 
                                        {chargekinds.map(d => <Option key={d.收费形式编号}>{d.收费形式编号}-{d.收费形式}</Option>)}                                       
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col> 
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
                                    label="防火标准"
                                >
                                    {getFieldDecorator(
                                        '防火标准编号',
                                        {                               
                                            initialValue : '1'
                                        } 
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        >  
                                        {firestandard.map(d => <Option key={d.防火标准编号}>{d.防火标准编号}-{d.管径}</Option>)}                                       
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
                    <Divider dashed><h5>基本信息</h5></Divider>
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
                                    {getFieldDecorator(
                                        '业务种类',
                                        {                               
                                            initialValue : '00201'
                                        } 
                                        )(
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
                        <Col span={8}>
                            <FormItem
                                {...formItemLayout}
                                label="托收电话"
                                
                            >                                 
                            {getFieldDecorator('托收电话')(
                                <Input  placeholder="" />
                            )}                                
                        </FormItem>      
                        </Col>        
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="行别"
                                    
                                >
                                    {getFieldDecorator(
                                        '行别',
                                        {                               
                                            initialValue : '1'
                                        } 
                                        )(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>     
                        </Col>                      
                    <Divider dashed><h5>用水信息</h5></Divider>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="用水日期"
                                >
                                    {getFieldDecorator('用水日期')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="使用期限"
                                >
                                    {getFieldDecorator('使用期限')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="装表日期"
                                >
                                    {getFieldDecorator('装表日期')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="装表地点"
                                    
                                >
                                    {getFieldDecorator('装表地点')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="节门状态"                                    
                                >
                                    {getFieldDecorator(
                                        '节门状态',
                                        {                               
                                            initialValue : '开'
                                        }    
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        >
                                            <Option value="开">开</Option>
                                            <Option value="闭">闭</Option>                                         
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="管径"                                    
                                >
                                    {getFieldDecorator(
                                        '管径',
                                        {                               
                                            initialValue : '50'
                                        } 
                                    )(
                                        <InputNumber                                                                             
                                        min={0}
                                        onChange={this.onPipeDiaChange}
                                        precision={0} 
                                        style={{ width: '100%' }}                                   
                                        />
                                        // <Select  
                                        // mode="tags"                                       
                                        // style={{ width: '100%' }}
                                        // > 
                                        // {pipes.map(d => <Option key={d.管径}>{d.管径}</Option>)}                                        
                                        // </Select>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="日定额"
                                    
                                >
                                    {getFieldDecorator(
                                        '定额',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber
                                        disabled={userWater === '2' ? false : true}                                                                             
                                        min={0}
                                        precision={2} 
                                        style={{ width: '100%' }}                                   
                                    />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={16}>
                            <Col span={12}>
                            <FormItem
                                    {...formItemLayout}
                                    label="申请水量"
                                    
                                >
                                    {getFieldDecorator(
                                        '申请水量',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber
                                        disabled={userWater === '0' ? false : true}                                                                             
                                        min={0}
                                        precision={2} 
                                        style={{ width: '100%' }}                                   
                                    />
                                    )}
                            </FormItem>     
                            </Col>        
                            <Col span={12}>
                            </Col>         
                        </Col>                    
                    <Divider dashed><h5>装表信息</h5></Divider>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="贴费状态"                                    
                                >
                                    {getFieldDecorator(
                                        '水贴费状态'                                           
                                    )(
                                        <Select                                         
                                        style={{ width: '100%' }}
                                        >
                                            <Option value="收">收</Option>
                                            <Option value="免">免</Option>
                                            <Option value="欠">欠</Option>
                                            <Option value="管">管</Option>                                         
                                        </Select>
                                    )}
                            </FormItem>           
                        </Col> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="水贴费"
                                    
                                >
                                    {getFieldDecorator(
                                        '水贴费',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber                                                                             
                                        min={0}
                                        precision={2} 
                                        style={{ width: '100%' }}                                   
                                    />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="贴费日期"
                                >
                                    {getFieldDecorator('拆表日期')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="装表费"
                                    
                                >
                                    {getFieldDecorator(
                                        '装表费',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber                                                                             
                                        min={0}
                                        precision={2} 
                                        style={{ width: '100%' }}                                   
                                    />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="退续用"
                                    
                                >
                                    {getFieldDecorator('退续用手续')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col> 
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="现场负责"
                                    
                                >
                                    {getFieldDecorator('现场负责')(
                                        <Input  placeholder="" />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="表损日期"
                                >
                                    {getFieldDecorator('表损日期')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={16}>
                            <Col span={12}>
                            <FormItem
                                    {...formItemLayout}
                                    label="换表日期"
                                >
                                    {getFieldDecorator('换表日期')(
                                        <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                    )}
                            </FormItem>      
                            </Col>        
                            <Col span={12}>
                            </Col>         
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

UnitEntry.propTypes = {
    form: PropTypes.object,
    match : PropTypes.object,
};


let entry = Form.create({})(UnitEntry);

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

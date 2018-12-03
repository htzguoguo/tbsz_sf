import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    Button, Form, Input,
    Select,  notification,
    Row, Divider, Checkbox,
    Col, Card , DatePicker,
    InputNumber, Icon, Radio } from 'antd';
 
import moment from 'moment';

import PHE from 'print-html-element';   
const Option = Select.Option; 
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { MonthPicker} = DatePicker;
import api from '../../../api';
import {handleError, showNotification} from '../../../utils/notification';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import styles from './index.less'; 

const oldUnitFields = ['编号', '户名', '开户行行名' ,'帐号' , 
    '联系人','电话','用水日期','装表日期','使用期限','用水形式编号',
    '装表地点', '管径','申请水量','定额','扣水单位编号','节门状态', '本月表底', '水表编号'];



const newUnitFields = oldUnitFields.map(
    field => field + 'n'
);


class UnitChangeNameEntry extends Component{

    constructor(props) {
        super(props);
        this.num = props.match.params.num;  
        this.onUnitNumChange = this.onUnitNumChange.bind(this);
        this.onNewUnitNumChange = this.onNewUnitNumChange.bind(this);
        this.handleAfterFetchQuery = this.handleAfterFetchQuery.bind(this); 
        this.handleAfterNewNumChange = this.handleAfterNewNumChange.bind(this);
        this.handleAfterOldNumChange = this.handleAfterOldNumChange.bind(this);        
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
        }).catch(handleError);         
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
            formatDatePickerValue(
                values,
                ['过户日期'],
                monthFormat
            );
            formatDatePickerValue(
                values,
                ['用水日期n', '使用期限n', '装表日期n'], dateFormat
            );              
            api.put('unit/change',values).then((data) => {
                notification.success({
                    message: '提示',
                    description: data.data,
                    duration: 3,
                });
            }).catch(handleError);
        });
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
                showNotification('warning', `编号[${num}]没有对应的前一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(handleError);
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
                showNotification('warning', `编号[${num}]没有对应的后一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(handleError);
    }

    onSelectChange = (e) => {
        this.selectType = e.target.value;       
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
    
    handleAfterFetchQuery(item, resetFields) {
        this.props.form.resetFields(resetFields);           
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

    onNewUnitNumChange(e) {
        this.handleUnitNumChange(e, this.handleAfterNewNumChange);
    }

    handleAfterNewNumChange(item) {
        let nn = {};
        Object.keys(item).forEach(
            key => nn[key + 'n'] = item[key]
        ); 
        nn.本月表底n =  this.props.form.getFieldValue('本月表底');       
        convertPropertiesToMoment(nn, ['用水日期n', '使用期限n', '装表日期n'], dateFormat)
        this.handleAfterFetchQuery(nn, newUnitFields);
    }

    onUnitNumChange(e) {
        this.handleUnitNumChange(e, this.handleAfterOldNumChange);
    }

    handleAfterOldNumChange(item) {
        convertPropertiesToMoment(item, ['用水日期', '使用期限', '装表日期'], dateFormat)
        this.handleAfterFetchQuery(item, oldUnitFields);
    }

    handleUnitNumChange(e, cb) {
        e.preventDefault();
        let {value} = e.target;   
        let dd = this.props.form.getFieldValue('过户日期');
        if (value && value.length === 4) {
            api.get(`unit/change/${value}/${dd.year()}/${dd.month() + 1}`, {            
            responseType: 'json'
            }).then((data) => {
                let item = data.data;                
                if (!item.hasOwnProperty('户名')) {
                    showNotification('warning', `编号[${value}]没有对应的记录！`)
                    return;
                } 
                item.水表编号 = value;
                cb(item);                
            }).catch(handleError);
        }else if(value && value.length > 4){
            showNotification('error', `编号[${value}]的有效长度是4位！`)
        }
    }
    
    handleUnitChange(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(['编号', '户名n'], (errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，请您检查!',
                    duration: 3,
                });
                return;
            }                             
            api.get(`unit/changecreate/${values.编号}/${values.用水形式编号n}`,values).then((data) => {
                let item = data.data;                
                if (!item.hasOwnProperty('编号')) {
                    showNotification('warning', item.desc)
                    return;
                } 
                let vvv = this.props.form.getFieldsValue([...oldUnitFields, '沿用原指标']);
                let res = {
                    编号n : item.编号,
                    用水日期n :moment(new Date(), monthFormat) ,
                    使用期限n : vvv.使用期限,
                    装表地点n : vvv.装表地点,
                    装表日期n : vvv.装表日期,
                    节门状态 : '闭',
                    节门状态n : '开',
                    管径n : vvv.管径,
                    定额n : vvv.定额,
                    本月表底n : vvv.本月表底,
                    水表编号n : item.编号
                }
                if(vvv.沿用原指标) {
                    res.申请水量n = vvv.申请水量;
                    res.扣水单位编号n = item.编号;
                }               
                this.props.form.setFieldsValue(res);
            }).catch(handleError);
        });
    }

    render() {
        const { fetching, units, value } = this.state;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        const {  getFieldDecorator } = this.props.form;
        let vvv = this.props.form.getFieldsValue(['过户日期', '户名', '户名n', 
        '开户行行名', '开户行行名n', '帐号', '帐号n', '联系人',
        '联系人n', '电话', '电话n', '使用期限', '使用期限n', '用水日期', '用水日期n',
        '沿用原指标', '水表编号', '本月表底n', '装表地点n', '过户理由']);
        formatDatePickerValue(
            vvv,
            ['过户日期'],
            'YYYY-MM-DD'
        );
        console.log('vvv', vvv);
        formatDatePickerValue(
            vvv,
            ['使用期限', '使用期限n', '用水日期', '用水日期n'],
            'YYYYMMDD'
        );
        return (
            <div>
                <div className="ant-row" style={{marginTop:20}}>
                    <div className=' console-title-border console-title'>
                        <div className="pull-left">
                            <h5>{'单位过户'}</h5>
                        </div>
                    </div>     
                    <Form id="unitEntryForm" className={styles.unitEntryForm} layout="horizontal" form={this.props.form}>
                    <Divider dashed><h5>过户信息</h5></Divider>
                        <Row style={{ marginBottom: 16 }}  >                   
                            <Col span={6}>
                                <FormItem
                                    {...formItemLayout}                                                        
                                    label="过户日期">
                                    {getFieldDecorator(
                                        '过户日期',
                                        {initialValue : moment(new Date(), monthFormat)}
                                )(
                                        <MonthPicker placeholder="" format={monthFormat} />
                                    )}
                                </FormItem>            
                            </Col>
                            <Col span={6}>
                                <FormItem
                                        {...formItemLayout}
                                        label="过户理由"                                    
                                    >
                                        {getFieldDecorator('过户理由')(
                                            <Input  placeholder="" />
                                        )}
                                </FormItem>           
                            </Col> 
                            <Col span={3}>
                                <FormItem
                                        {...formItemLayout}                                  
                                        labelCol= {0}
                                        wrapperCol= {24}                                  
                                    >
                                        {getFieldDecorator('沿用原指标', {                                  
                                            initialValue : true,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox   >沿用原指标</Checkbox>
                                        )}
                                </FormItem>           
                            </Col>    
                            <Col span={9}>
                                <FormItem
                                        {...formItemLayout}
                                        label="备注"                                    
                                    >
                                        {getFieldDecorator('备注', {                                  
                                            initialValue : '水费已付清',                                         
                                        })(
                                            <Input  placeholder="" />
                                        )}
                                </FormItem>           
                            </Col>   
                        </Row>   
                        <Divider ></Divider>  
                        <Row> 
                            <Col span={12}>
                                <Card
                                    type="inner"
                                    title="原单位基本信息"
                                >
                                    <Col span={24}>
                                        <FormItem
                                                wrapperCol={{ span: 20 }}
                                                labelCol={{span : 3}}
                                                label="编号"                                     
                                            >
                                                {getFieldDecorator(
                                                    '编号',  
                                                    {
                                                        rules: [{
                                                            required: true, message: '原单位编号不能为空!',
                                                        }] ,
                                                    }                                              
                                                )(
                                                    <Input onChange={this.onUnitNumChange}  placeholder="" />
                                                )}
                                        </FormItem>            
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                                label="户名"
                                                wrapperCol={{ span: 20 }}
                                                labelCol={{span : 3}}
                                            >
                                                {getFieldDecorator(
                                                    '户名',                                                
                                                )(
                                                    <Input  placeholder=""/>
                                                )}
                                        </FormItem>   
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="开户行"
                                            >
                                                {getFieldDecorator('开户行行名')(
                                                    <Select
                                                    showSearch
                                                    allowClear={true}
                                                    
                                                    style={{ width: '100%' }}
                                                    >   
                                                        {banks.map(d => <Option key={d.开户行行名}>{d.开户行行名}</Option>)}                                      
                                                    </Select>
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="账号"
                                            >
                                                {getFieldDecorator('帐号')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="联系人"
                                                
                                            >
                                                {getFieldDecorator('联系人')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="电话"
                                            
                                        >                                 
                                        {getFieldDecorator('电话')(
                                            <Input  placeholder="" />
                                        )}                                
                                        </FormItem>
                                    </Col>
                                </Card>
                                <Card
                                    type="inner"
                                    title="原单位用水信息"
                                >
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="用水日期"
                                            >
                                                {getFieldDecorator('用水日期')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="使用期限"
                                            >
                                                {getFieldDecorator('使用期限')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="装表地点"
                                                
                                            >
                                                {getFieldDecorator('装表地点')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="装表日期"
                                            >
                                                {getFieldDecorator('装表日期')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>

                                    <Col span={12}>
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
                                    <Col span={12}>
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
                                                )}
                                        </FormItem>           
                                    </Col>

                                    <Col span={12}>
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
                                                    min={0}
                                                    precision={2} 
                                                    style={{ width: '100%' }}                                   
                                                />
                                                )}
                                        </FormItem>           
                                    </Col>
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
                                                    min={0}
                                                    precision={2} 
                                                    style={{ width: '100%' }}                                   
                                                />
                                                )}
                                        </FormItem>     
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="扣水单位编号"
                                                
                                            >
                                                {getFieldDecorator('扣水单位编号')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                </Card>
                                <Card
                                    type="inner"
                                    title="原单位水表信息"
                                >
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="表底数"
                                                
                                            >
                                                {getFieldDecorator(
                                                    '本月表底',
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
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="水表编号"
                                                
                                            >
                                                {getFieldDecorator('水表编号')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                </Card>           
                            </Col>
                            <Col id="newUnitForm" span={12}>
                                <Card
                                    type="inner"
                                    title="新单位基本信息"
                                >
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="编号"                                     
                                            >
                                                {getFieldDecorator(
                                                    '编号n',
                                                    {
                                                        rules: [{
                                                            required: true, message: '新单位编号不能为空!',
                                                        }] ,
                                                    }                                                  
                                                )(
                                                    <Input onChange={this.onNewUnitNumChange}  placeholder="" />
                                                )}
                                        </FormItem>            
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="用水形式"                                     
                                            >
                                                {getFieldDecorator(
                                                    '用水形式编号n', 
                                                    {                               
                                                        initialValue : '2'
                                                    }                                              
                                                )(
                                                    <RadioGroup>
                                                        <Radio value={'0'}>临时</Radio>
                                                        <Radio value={'2'}>正式</Radio>                                                   
                                                    </RadioGroup>
                                                )}
                                        </FormItem>            
                                    </Col>
                                    <Col span={24}>
                                        <FormItem
                                                label="户名"
                                                wrapperCol={{ span: 20 }}
                                                labelCol={{span : 3}}
                                            >
                                                {getFieldDecorator(
                                                    '户名n',
                                                    {
                                                        rules: [{
                                                            required: true, message: '新单位名称不能为空!',
                                                        }] ,
                                                    }                                                  
                                                )(
                                                    <Input  placeholder=""/>
                                                )}
                                        </FormItem>   
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="开户行"
                                            >
                                                {getFieldDecorator('开户行行名n')(
                                                    <Select
                                                    showSearch
                                                    allowClear={true}
                                                
                                                    style={{ width: '100%' }}
                                                    >   
                                                        {banks.map(d => <Option key={d.开户行行名}>{d.开户行行名}</Option>)}                                      
                                                    </Select>
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="账号"
                                                
                                            >
                                                {getFieldDecorator('帐号n')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="联系人"
                                                
                                            >
                                                {getFieldDecorator('联系人n')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="电话"
                                        >                                 
                                        {getFieldDecorator('电话n')(
                                            <Input  placeholder="" />
                                        )}                                
                                        </FormItem>
                                    </Col>
                                </Card>
                                <Card
                                    type="inner"
                                    title="新单位用水信息"
                                >
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="用水日期"
                                            >
                                                {getFieldDecorator('用水日期n')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="使用期限"
                                            >
                                                {getFieldDecorator('使用期限n')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="装表地点"
                                                
                                            >
                                                {getFieldDecorator('装表地点n')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="装表日期"
                                            >
                                                {getFieldDecorator('装表日期n')(
                                                    <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                                )}
                                        </FormItem>           
                                    </Col>

                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="节门状态"                                    
                                            >
                                                {getFieldDecorator(
                                                    '节门状态n',
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
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="管径"                                    
                                            >
                                                {getFieldDecorator(
                                                    '管径n',
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
                                                )}
                                        </FormItem>           
                                    </Col>

                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="日定额"
                                                
                                            >
                                                {getFieldDecorator(
                                                    '定额n',
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
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="申请水量"
                                                
                                            >
                                                {getFieldDecorator(
                                                    '申请水量n',
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
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="扣水单位编号"
                                                
                                            >
                                                {getFieldDecorator('扣水单位编号n')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                </Card>
                                <Card
                                    type="inner"
                                    title="新单位水表信息"
                                >
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="表底数"
                                                
                                            >
                                                {getFieldDecorator(
                                                    '本月表底n',
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
                                    <Col span={12}>
                                        <FormItem
                                                {...formItemLayout}
                                                label="水表编号"
                                                
                                            >
                                                {getFieldDecorator('水表编号n')(
                                                    <Input  placeholder="" />
                                                )}
                                        </FormItem>           
                                    </Col>
                                </Card>
                            </Col>  
                        </Row>
                        <Divider></Divider>
                        <FormItem wrapperCol={{ span: 24 }}>
                            <Col span={5}>
                            </Col>                            
                            <Col span={19} >
                                <Button type="danger" icon="save" onClick={this.handleUnitChange.bind(this)}>过户</Button>
                                &nbsp;&nbsp;&nbsp;                
                                <Button type="primary" icon="save" onClick={this.handleSubmit.bind(this)}>保存</Button>
                                &nbsp;&nbsp;&nbsp;
                                <Button type="ghost" icon="close" onClick={this.handleReset.bind(this)}>重置</Button>
                                &nbsp;&nbsp;&nbsp;
                                <Button type="danger" icon="save" onClick={() => {PHE.printHtml(document.getElementById('printForm').innerHTML)}}>打印</Button>                
                            </Col>
                        </FormItem>
                    </Form>
                </div>
                <div id="printForm">
                    <div className="noborder print-container paging "  >
                    <table className="printtable  page-4">
                            <tr>
                                <td style={{height: '10mm', colSpan : '2'}}>
                                    <p style={{display: 'flex', justifyContent: 'center'}} >                                         
                                        <span style={{fontSize : '20pt'}}>
                                            过户协议
                                        </span>
                                    </p>    
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style={{display: 'flex', justifyContent: 'flex-end', paddingRight : '2.4cm'}}><span >{vvv.过户日期}</span></p>
                                </td>
                            </tr>
                        </table>
                        <table className="printtable printtable-border page-4">
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>原单位</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}}>{vvv.户名}　</td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >接受单位</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.户名n}　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>开户银行</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.开户行行名}　</td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >开户银行</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}}  >{vvv.开户行行名n}　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>账号</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.帐号}　</td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >账号</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.帐号n}　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>经办人</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.联系人}　</td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >经办人</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.联系人n}　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>电话</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.电话}　</td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >电话</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.电话n}　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>使用期限</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.用水日期 && vvv.使用期限 ? vvv.用水日期 + ' - ' + vvv.使用期限 : '' }  </td>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}} >使用期限</td>
                                <td style={{width : "6.6cm",textAlign: 'left', paddingLeft : '3mm'}} >{vvv.用水日期n && vvv.使用期限n ? vvv.用水日期n + ' - ' + vvv.使用期限n : '' }　</td>
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>沿用原指标</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> {vvv.沿用原指标 ? '是' : '否'}　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>水表编号</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> {vvv.水表编号}　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>表底数</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> {vvv.本月表底n}　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>接水地点</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> {vvv.装表地点n}　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>过户理由</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> {vvv.过户理由}　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>双方确认</td>
                                <td colSpan={3} style={{textAlign: 'right'}}>
                                    <div  style={{marginRight : '3mm', paddingTop : '10mm', display : 'inline-block'}}>
                                        <div style={{ display : 'inline-block'}}>年</div><div style={{display : 'inline-block', width : '7mm'}}></div>
                                        <div style={{ display : 'inline-block'}}>月</div><div style={{display : 'inline-block', width : '7mm'}}></div>
                                        <div style={{ display : 'inline-block'}}>日</div><div style={{display : 'inline-block', width : '7mm'}}></div>
                                    </div>
                                </td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "1.7cm",textAlign: 'center'}}>运行部签字</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}> 　</td>                                
                            </tr>
                            <tr>
                                <td style={{width : "2.6cm",height : "3.7cm",textAlign: 'center'}}>备注</td>
                                <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}>天津市绿化工程公司</td>                                
                            </tr>
                        </table>                               
                    </div>                       
                </div> 
            </div>
        );
    }
}

UnitChangeNameEntry.propTypes = {
    form: PropTypes.object,
    match : PropTypes.object,
};


let entry = Form.create({})(UnitChangeNameEntry);

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

import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    Button, Form, Input,
    Select,  notification,
    Row, Divider, 
    Col, Card , DatePicker,
    InputNumber,  Radio } from 'antd';
 
  
const Option = Select.Option; 
const FormItem = Form.Item;

import api from '../../../api';
import {handleError, showNotification} from '../../../utils/notification';
import { dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import styles from './index.less'; 

const oldUnitFields = ['编号', '户名', '开户行行名' ,'帐号' , 
    '联系人','电话','用水日期','装表日期','使用期限','用水形式编号',
    '装表地点', '管径','申请水量','定额','扣水单位编号','节门状态', '本月表底', '水表编号'];

class UnitChangeNameEntry extends Component{

    constructor(props) {
        super(props);
        this.num = props.match.params.num;  
        this.onUnitNumChange = this.onUnitNumChange.bind(this);
        this.handleAfterFetchQuery = this.handleAfterFetchQuery.bind(this);
        this.handleAfterOldNumChange = this.handleAfterOldNumChange.bind(this);
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
                ['用水日期', '使用期限', '装表日期'], dateFormat
            );              
            api.post('unit/changeid',values).then((data) => {
                showNotification('success', '更改用户编号保存成功！')
            }).catch(handleError);
        });
    }    

    onSelectChange = (e) => {
        this.selectType = e.target.value;       
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
        if (value && value.length === 4) {
            api.get(`unit/units/${value}`, {            
            responseType: 'json'
            }).then((data) => {
                let item = data.data[0];                
                if (!item.hasOwnProperty('编号')) {
                    this.showNotification('warning', `编号[${value}]没有对应的记录！`)
                    return;
                }
                cb(item);
            }).catch(this.handleError);
        }else if(value && value.length > 4){
            showNotification('error', `编号[${value}]的有效长度是4位！`)
        }
    }

    handleCheck(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(['编号', '编号n'], (errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，请您检查!',
                    duration: 3,
                });
                return;
            }                             
            api.get(`unit/changeid/check/${values.编号n}`, {            
                responseType: 'json'
                }).then((data) => {
                let isOk = data.data;                
                if (isOk) {
                    showNotification('success', '没有重复信息，可以更改编号！')
                }else{
                    showNotification('error', '新单位已经存在，不能更改编号！')
                }
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
            ['使用期限', '使用期限n', '用水日期', '用水日期n'],
            'YYYYMMDD'
        );
        return (
            <div>
                <div className="ant-row" style={{marginTop:20}}>
                    <div className=' console-title-border console-title'>
                        <div className="pull-left">
                            <h5>{'更改用水单位编号'}</h5>
                        </div>
                    </div> 
                    <Row >
                        <Col span={5}>                         
                            <Input addonBefore="编号：" onChange={this.onUnitNumChange}   placeholder="" />                              
                        </Col>
                        <Col offset={2} span={10}>          
                            <Col span={24} > 
                                <Button type="danger" icon="save" onClick={this.handleCheck.bind(this)}>校验</Button>
                                &nbsp;&nbsp;&nbsp;                            
                                <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit.bind(this)}>更改</Button>
                                &nbsp;&nbsp;&nbsp;
                                <Button type="ghost" icon="close" onClick={this.handleReset.bind(this)}>重置</Button>
                            </Col>
                        </Col>
                    </Row>     
                    <Form id="unitEntryForm" className={styles.unitEntryForm} layout="horizontal" form={this.props.form}>
                        <Divider dashed><h5>过户信息</h5></Divider>
                        <Row> 
                            <Col span={24}>
                            <Card
                                id="newUnitForm"
                                    type="inner"
                                    title="新单位信息"
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
                                                    <Input onChange={
                                                        (e) => {
                                                            let {value} = e.target;
                                                            this.props.form.setFieldsValue({
                                                                扣水单位编号n : value
                                                            });
                                                        }
                                                    }  placeholder="" />
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
                                    title="单位基本信息"
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
                                    title="单位用水信息"
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
                            </Col>
                        </Row>
                    </Form>
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

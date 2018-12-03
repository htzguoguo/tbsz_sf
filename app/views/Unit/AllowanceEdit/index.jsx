import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {
    Button, Form, Input,
    Select,  notification,
    Row, Divider, Checkbox,
    Col, Radio, Alert, DatePicker,
    InputNumber, Icon } from 'antd';
import moment from 'moment';
const Option = Select.Option; 
const FormItem = Form.Item;
import api from '../../../api';
import styles from './index.less';
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 18 },
};
const dateFormat = 'YYYYMMDD';
const datePickers =  ['交费日期', '增容日期1', '增容日期2',
'增容日期3' , '增容日期4', '增容日期5'];

const PriceNew = 600;
const PriceAdd = 500;

const amountFields = ['申请容量', '增加容量1', '增加容量2', '增加容量3', '增加容量4', '增加容量5'];
const feeFields = ['水贴费', '增容费1', '增容费2', '增容费3', '增容费4', '增容费5'];

class AllowanceEdit extends Component{
    constructor(props) {
        super(props);        
        this.onUnitNumChange = this.onUnitNumChange.bind(this);
        this.selectedNum = '0000';
    }

    componentDidMount() {
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
                    description: '输入的数据有误，您检查',
                    duration: 3,
                });
                return;
            }  
            this.formatDatePickerValue(
                values,
                datePickers
            );  
            api.put('/unit/allowance',values).then((data) => {
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

    onUnitNumChange(e) {
        e.preventDefault();
        let {value} = e.target;               
        if (value && value.length === 4) {
            api.get(`unit/allowance/${value}`, {            
            responseType: 'json'
            }).then((data) => {
                let item = data.data;                
                if (!item.hasOwnProperty('编号')) {
                    this.showNotification('warning', `编号[${value}]没有对应的记录！`)
                    return;
                } 
                this.handleAfterFetchQuery(item);
                
            }).catch(this.handleError);
        }
    }

    handleAmountChange = (amount, key, updateKey, price) => {         
        let chkKey = key + '半价'; 
        let updateObj = {};   
        let isChecked = this.props.form.getFieldValue(chkKey);
        if(Number.isFinite(amount)) {
            updateObj[updateKey] = isChecked  
                            ? price * 0.5 * parseFloat(amount).toFixed(2) 
                            : price  * parseFloat(amount).toFixed(2) 
        }
        this.calSumAmountAndFee(amount, key,updateObj[updateKey], updateKey, updateObj );
        this.props.form.setFieldsValue(updateObj);         
    } 
    
    calSumWithLeftFields = (allFields, exclude) => {
        let LeftFields = allFields.filter( field => field != exclude);        
        let Values = this.props.form.getFieldsValue(LeftFields);
        let sum1 = 0;
        Object.keys(Values).forEach(
            key => {
                if(Number.isFinite(Values[key])) {
                    sum1 += parseFloat(Values[key]) 
                }
            }
        );         
        return sum1;
    }
    
    calSumAmountAndFee = (amount, amountKey, fee, feeKey, updateObj) => {        
        let leftAmount = this.calSumWithLeftFields(amountFields, amountKey);
        let leftFee = this.calSumWithLeftFields(feeFields, feeKey);         
        updateObj.容量合计 = parseFloat(amount)   + parseFloat(leftAmount) ;
        updateObj.合计 =parseFloat(fee)   + parseFloat(leftFee) ;       
    }

    handleFeeChange = (price, key) => { 
        let updateObj = {};         
        let leftFee = this.calSumWithLeftFields(feeFields, key);
        updateObj.合计 =parseFloat(price)   + parseFloat(leftFee) ;       
        this.props.form.setFieldsValue(updateObj);
    }

    handlePrior = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) >= 0 ?
        this.props.form.getFieldValue('编号') : this.selectedNum;         
        api.get(`unit/allowance/prior/${num}`, {            
            responseType: 'json'
        }).then((data) => {
            let item = data.data;             
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的前一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }

    handleNext = () => { 
        console.log(parseInt(this.props.form.getFieldValue('编号')) >= 0);        
        let num = parseInt(this.props.form.getFieldValue('编号')) >= 0 ?
                    this.props.form.getFieldValue('编号') : this.selectedNum;
        console.log(num);            
        api.get(`unit/allowance/next/${num}`, {            
            responseType: 'json'
        }).then((data) => {
            let item = data.data;             
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的后一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }     

    render() {
        var self = this;
        const { getFieldProps,getFieldDecorator, getFieldError, isFieldValidating } = this.props.form;
        
        return (
            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>录入水贴费</h5>
                    </div>
                </div>
                    <Row >
                    <Col span={5}>                         
                        <Input addonBefore="编号：" onChange={this.onUnitNumChange}   placeholder="" />                              
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
                    <Col span={10}>          
                        <Col span={24} >                            
                            <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit.bind(this)}>保存</Button>
                            &nbsp;&nbsp;&nbsp;
                            <Button type="ghost" icon="close" onClick={this.handleReset.bind(this)}>重置</Button>
                        </Col>
                    </Col>
                    </Row>                    
                    <Alert
                    style={{marginTop : '15px'}}
                    banner={true}
                    message="提示："
                    description="新增用户贴费单价：600；老用户增容贴费单价：500"
                    type="info"
                    showIcon
                    />
                    <Divider dashed><h5>单位基本信息</h5></Divider> 
                    <Form id="allowanceEditForm" className={styles.searchParasForm} layout="horizontal" form={this.props.form}> 
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
                                                required: true, message: '编号不能为空!',
                                            }] ,
                                        }
                                    )(
                                        <Input  placeholder="" disabled/>
                                    )}
                            </FormItem>            
                        </Col>
                        <Col span={8}>
                        <FormItem
                                    {...formItemLayout}
                                    label="户名"                                    
                                >
                                    {getFieldDecorator(
                                        '户名',
                                        {
                                            rules: [{
                                                required: true, message: '户名不能为空!',
                                            }] ,
                                        }
                                    )(
                                        <Input  placeholder="" disabled/>
                                    )}
                            </FormItem>   
                        </Col>
                        <Col span={8}>
                        <FormItem
                                    {...formItemLayout}
                                    label="装表地点"                                    
                                >
                                    {getFieldDecorator('装表地点')(
                                        <Input  placeholder="" disabled/>
                                    )}
                            </FormItem>           
                        </Col>           
                    <Divider dashed><h5>贴费情况</h5></Divider>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="交费日期">
                            {getFieldDecorator('交费日期', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="申请容量">
                            {getFieldDecorator('申请容量', {
                                initialValue : '0',                                
                            })(
                                <InputNumber   
                                    onChange={
                                        value => {
                                            this.handleAmountChange(value, '申请容量', '水贴费', PriceNew);

                                        }}                                  
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('申请容量半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="水贴费">
                            {getFieldDecorator('水贴费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '水贴费');

                                    }}                          
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('贴费备注', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="增容日期1">
                            {getFieldDecorator('增容日期1', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="增加水量">
                            {getFieldDecorator('增加容量1', {
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleAmountChange(value, '增加容量1', '增容费1', PriceAdd);

                                    }}                                     
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('增加容量1半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="增容费">
                            {getFieldDecorator('增容费1', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '增容费1');
                                    }}                           
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('备注1', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="增容日期2">
                            {getFieldDecorator('增容日期2', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="增加水量">
                            {getFieldDecorator('增加容量2', {
                                initialValue : '0'
                            })(
                                <InputNumber
                                    onChange={
                                    value => {
                                        this.handleAmountChange(value, '增加容量2', '增容费2', PriceAdd);

                                    }}                                       
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('增加容量2半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="增容费">
                            {getFieldDecorator('增容费2', {                               
                                initialValue : '0'
                            })(
                                <InputNumber
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '增容费2');
                                    }}                             
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('备注2', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="增容日期3">
                            {getFieldDecorator('增容日期3', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="增加水量">
                            {getFieldDecorator('增加容量3', {
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleAmountChange(value, '增加容量3', '增容费3', PriceAdd);

                                    }}                                      
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('增加容量3半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="增容费">
                            {getFieldDecorator('增容费3', {                               
                                initialValue : '0'
                            })(
                                <InputNumber  
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '增容费3');
                                    }}                           
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('备注3', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="增容日期4">
                            {getFieldDecorator('增容日期4', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="增加水量">
                            {getFieldDecorator('增加容量4', {
                                initialValue : '0'
                            })(
                                <InputNumber 
                                onChange={
                                    value => {
                                        this.handleAmountChange(value, '增加容量4', '增容费4', PriceAdd);

                                    }}                                      
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('增加容量4半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="增容费">
                            {getFieldDecorator('增容费4', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '增容费4');
                                    }}                            
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('备注4', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="增容日期5">
                            {getFieldDecorator('增容日期5', {                               
                            })(
                                <DatePicker style={{width : '100%'}}  format={dateFormat} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="增加水量">
                            {getFieldDecorator('增加容量5', {
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleAmountChange(value, '增加容量5', '增容费5', PriceAdd);

                                    }}                                      
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >
                            {getFieldDecorator('增加容量5半价', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                            })(
                                <Checkbox>半价</Checkbox>
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}                             
                            label="增容费">
                            {getFieldDecorator('增容费5', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    onChange={
                                    value => {
                                        this.handleFeeChange(value, '增容费5');
                                    }}                            
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    <Col span={3}>
                        <FormItem
                            {...formItemLayout}
                            label="备注">
                            {getFieldDecorator('备注5', {                               
                                initialValue : ''
                            })(
                                <Input style={{ width: '100%' }} />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                                                        
                            label="贴费状态">
                            {getFieldDecorator('贴费状态', {
                                initialValue : '收'                               
                            })(
                                <Select  style={{ width: '100%' }}  >
                                    <Option value="收">收</Option>
                                    <Option value="免">免</Option>
                                    <Option value="欠" >欠</Option>
                                    <Option value="管">管</Option>
                                </Select>
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={7}>
                        <FormItem
                            {...formItemLayout}                           
                            label="水量总和">
                            {getFieldDecorator('容量合计', {
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col> 
                    <Col span={2}>
                        <FormItem
                            {...formItemLayout}
                            >                            
                        </FormItem>      
                    </Col> 
                    <Col span={5}>
                        <FormItem
                            {...formItemLayout}  

                            label="费用和">
                            {getFieldDecorator('合计', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                          
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}

AllowanceEdit.propTypes = {
    form: PropTypes.object,
    match : PropTypes.object,
};


let form = Form.create({})(AllowanceEdit);

const mapStateToProps = (state) => {     
};

function mapDispatchToProps(dispatch) {
return {actions: bindActionCreators({}, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(form);

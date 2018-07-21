import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, Icon,
    notification, Popconfirm, Tooltip,
    Divider, Input, Row, Col, Radio,
    Select, Card, Form, Alert,
    DatePicker,  InputNumber, Checkbox
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';


const { MonthPicker } = DatePicker;
const Option = Select.Option;
const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let _data = [];
const monthFormat = 'YYYYMM';
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
};

function cancel() {
    message.error('点击了取消');
}

class SearchWaterFees extends Component {
    constructor(props){
        super(props);
        this.selectedDate = '201707';         
        this.state = {
            dd : '201707',
            data: [],
            pagination: {},
            loading: false,
            expandForm: false,             
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        }; 

        const onEdit = this.onEdit.bind(this);        
        this.columns = [
            {
                title: '编号',
                dataIndex: '编号',
                key: '编号',                
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
            },
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名',
                sorter: (a, b) => a.户名.length - b.户名.length,
            },
            {
                title: '上月表底',
                dataIndex: '上月表底',
                key: '上月表底',
                sorter: (a, b) => parseFloat(a.上月表底) - parseFloat(b.上月表底)  
            },
            {
                title: '本月表底',
                dataIndex: '本月表底',
                key: '本月表底',
                sorter: (a, b) => parseFloat(a.本月表底) - parseFloat(b.本月表底)  
            },
            {
                title: '应收水费',
                dataIndex: '应收水费',
                key: '应收水费',
                sorter: (a, b) => parseFloat(a.应收水费) - parseFloat(b.应收水费)  
            },
            {
                title: '实收水费',
                dataIndex: '实收水费',
                key: '实收水费',
                sorter: (a, b) => parseFloat(a.实收水费) - parseFloat(b.实收水费)  
            },
            {
                title: '操作',
                dataIndex: '编号',
                key : '编号',
                render:function(text, record, index){
                    return (
                        <span>                           
                            <a onClick={onEdit.bind(this,text, record, index)}>单录  </a>                            
                        </span>
                    )
                } ,
                width: '15%'
            }
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    }
    
    fetch = ({year, month, type}) => {
        this.setState({ loading: true });
        api.get(`water/fees/${year}/${month}/${type}`, 
        {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;             
            _data = data;
            const pagination = this.state.pagination;
            // Read total count from server
            // pagination.total = data.totalCount;
            pagination.total = data.length;             
            this.setState({
                loading: false,
                data: data,
                pagination,
            });
        }).catch(
            err => {
                handleError(err);
                const pagination = this.state.pagination;
                pagination.total = 0;             
                this.setState({
                    loading: false,
                    data: [],
                    pagination,
                });
            }
        ); 
    }    

    componentDidMount() {
        api.get(`water/feeparas`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;            
            this.setState({...data});           
        }).catch(this.handleError);
    }

    onEdit(text, record, index) {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.history.replace(`/app/toll/take/${text}/${record.年}/${record.月}`);                               
            }
        });
        
    } 

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
            values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
            api.post('/water/feesearch', values).then((dt) => {
                let data = dt.data;             
                _data = data;
                const pagination = this.state.pagination;             
                pagination.total = data.length;             
                this.setState({
                    loading: false,
                    data: data,
                    pagination,
                });
                notification.success({
                    message: '提示',
                    description: `成功获取${data.length}条记录`,
                    duration: 3,
                });
            }).catch(
                err => {
                    handleError(err);
                    const pagination = this.state.pagination;
                    pagination.total = 0;             
                    this.setState({
                        loading: false,
                        data: [],
                        pagination,
                    });
                    notification.success({
                        message: '提示',
                        description: `没有满足条件的记录,请重试。`,
                        duration: 3,
                    });
                }
            );  
        });
    }

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
                values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
                api.post(
                    `water/feesearchtoexcel`, 
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `天保市政公司水费统计表${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading: false                
                    });
                }
                );  
            }
        });
    }

    toggleForm = () => {
        this.setState({
            expandForm: !this.state.expandForm,
        });
    }  
    
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();        
    }

    renderToggleMarker = (isSimple) => {
        return isSimple ? (<span>展开 <Icon type="down" /></span>) : (<span>收起 <Icon type="up" /></span>)
    }
        

    renderSearchButtons = (isSimple) => 
    <div style={{ overflow: 'hidden', marginTop : '20px' }}>
        <span style={{ float: 'right', marginBottom: 24 }}>
            <Button onClick={this.onSearch} type="primary">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <Button style={{ marginLeft: 8 }} type="danger"   onClick={this.onToExcel}>导出Excel</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
            {this.renderToggleMarker(isSimple)} 
            </a>
        </span>
    </div>    

    renderSimpleForm() {
        const { getFieldDecorator } = this.props.form;
        const {dd} = this.state;
        return (
            <Form id="searchParasForm" className={styles.searchParasForm} layout="horizontal" form={this.props.form}>
                <Row  >
                    <Col span={8}>
                        <FormItem
                        label="年月" 
                        {...formItemLayout}                     
                        >
                        <Col span={11}>
                            {getFieldDecorator(
                                '起始年月',
                                {initialValue : moment(dd, monthFormat)}
                            )(
                                <MonthPicker format={monthFormat}/>                                
                            )}
                        </Col>
                        <Col span={2}  >
                            <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                            -
                            </span>
                        </Col>
                        <Col span={11}>
                            {getFieldDecorator(
                                '终止年月',
                                {initialValue : moment(dd, monthFormat)}
                            )(
                                <MonthPicker format={monthFormat}/> 
                            )}
                        </Col>
                        </FormItem>
                    </Col>                    
                    <Col span={8}>
                        <FormItem
                        label="编号" 
                        {...formItemLayout}                      
                        >
                        <Col span={11}>
                            {getFieldDecorator(
                                '起始编号',
                                {initialValue : ''}
                            )(
                                <Input        />                                
                            )}
                        </Col>
                        <Col span={2}  >
                            <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                            -
                            </span>
                        </Col>
                        <Col span={11}>
                            {getFieldDecorator(
                                '终止编号',
                                {initialValue : ''}
                            )(
                                <Input        /> 
                            )}
                        </Col>
                        </FormItem>
                    </Col> 
                    <Col span={8}>
                        <FormItem
                        label="户名"  
                        {...formItemLayout}                 
                        >                        
                            {getFieldDecorator(
                                '户名',
                                {initialValue : ''}
                            )(
                                <Input />                                
                            )}                       
                        </FormItem>
                    </Col>                   
                </Row>                 
                {this.renderSearchButtons(true)} 
            </Form>
        );
    }
    
    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {charges, inputkinds, usekinds, chargekinds, dd} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >
                <Col span={8}>
                    <FormItem
                    label="年月" 
                    {...formItemLayout}                     
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始年月',
                            {initialValue : moment(dd, monthFormat)}
                        )(
                            <MonthPicker format={monthFormat}/>                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止年月',
                            {initialValue : moment(dd, monthFormat)}
                        )(
                            <MonthPicker format={monthFormat}/> 
                        )}
                    </Col>
                    </FormItem>
                </Col>                    
                <Col span={8}>
                    <FormItem
                    label="编号" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始编号',
                            {initialValue : ''}
                        )(
                            <Input        />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止编号',
                            {initialValue : ''}
                        )(
                            <Input        /> 
                        )}
                    </Col>
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="户名"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            '户名',
                            {initialValue : ''}
                        )(
                            <Input />                                
                        )}                       
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="费用标准" 
                    {...formItemLayout}                         
                    >
                    {getFieldDecorator(
                        '费用标准',
                        // {initialValue : charges[0].区号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {charges.map(
                                item => (<Option key={`charge${item.区号}`} value={item.区号}>{item.单价} {item.单位类别}</Option>)
                            )}                        
                        </Select>     
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem 
                    label="抄表形式"
                    {...formItemLayout}                           
                    >
                    {getFieldDecorator(
                        '抄表形式',
                        // {initialValue : inputkinds[0].抄表形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {inputkinds.map(
                                item => (<Option key={`inputkind${item.抄表形式编号}`} value={item.抄表形式编号}>{item.抄表形式}</Option>)
                            )} 
                        </Select>
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem 
                    label="用水形式" 
                    {...formItemLayout}                          
                    >
                    {getFieldDecorator(
                        '用水形式',
                        // {initialValue : usekinds[0].用水形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"  style={{ width: '100%' }} >
                            {usekinds.map(
                                item => (<Option key={`usekind${item.用水形式编号}`} value={item.用水形式编号}>{item.用水形式}</Option>)
                            )} 
                        </Select>
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem 
                    label="收费形式"
                    {...formItemLayout} 
                    >
                    {getFieldDecorator(
                        '收费形式',
                        // {initialValue : chargekinds[0].收费形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"  style={{ width: '100%' }} >
                            {chargekinds.map(
                                item => (<Option key={`chargekind${item.收费形式编号}`} value={item.收费形式编号}>{item.收费形式}</Option>)
                            )} 
                        </Select>
                    )}
                    </FormItem>
                </Col>  
                <Col span={8}>                        
                    <FormItem
                    {...formItemLayout} 
                    label="欠费"
                    >
                    {getFieldDecorator('欠费标志', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox></Checkbox>
                        )}
                    </FormItem>                                       
                </Col>
            </Row>
            <Row>                 
                <Col span={8}>
                    <FormItem
                    label="上月表底" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始上月表底',
                            {initialValue : ''}
                        )(
                            <InputNumber                                                                  
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%', color : 'red' }}                                   
                                />                          
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止上月表底',
                            {initialValue : ''}
                        )(
                            <InputNumber                                                                  
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%', color : 'red' }}                                   
                                />
                        )}
                    </Col>
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="本月表底" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始本月表底',
                            {initialValue : ''}
                        )(
                            <InputNumber                                                                  
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%', color : 'red' }}                                   
                                />                            
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止本月表底',
                            {initialValue : ''}
                        )(
                            <InputNumber                                                                  
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%', color : 'red' }}                                   
                                />
                        )}
                    </Col>
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="用水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始用水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止用水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                /> 
                        )}
                    </Col>
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="计划水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始计划水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />                                 
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止计划水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />  
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="计划水费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始计划水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止计划水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="应收水费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始应收水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                 
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止应收水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />  
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="超额水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始超额水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />                                  
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止超额水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="超额水费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始超额水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                  
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止超额水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="排污费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始排污费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止排污费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            /> 
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="防火费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始防火费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                 
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止防火费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />  
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="手续费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始手续费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止手续费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            /> 
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="其它" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始其它',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止其它',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            /> 
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="申请水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始申请水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止申请水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="年用水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始年用水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />                                  
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止年用水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="剩余水量" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始剩余水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />                                  
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止剩余水量',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={0} 
                                style={{ width: '100%' }}                                   
                            />   
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="减免水费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始减免水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                  
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止减免水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />  
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="减其它" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始减其它',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                 
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止减其它',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />  
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem
                    label="实收水费" 
                    {...formItemLayout}                      
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始实收水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />                                 
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止实收水费',
                            {initialValue : ''}
                        )(
                            <InputNumber                            
                                min={0}
                                precision={2} 
                                style={{ width: '100%' }}                                   
                            />  
                        )}
                    </Col>
                    </FormItem>
                </Col>            
            </Row>             
            {this.renderSearchButtons(false)} 
        </Form>
        );
    }
    
    renderForm() {
        return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
    }

    render() {  
        const { getFieldDecorator } = this.props.form;          
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>查询月水费</h5>
                    </div>
                </div>
                {this.renderForm()}
                <Divider></Divider>
                <Table columns={this.columns}                     
                    rowKey={record => parseInt(record.编号)}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    bordered
                    footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                />
            </div>
        );
    }


}
let searchLists = Form.create({})(SearchWaterFees);
export default withRouter(searchLists)




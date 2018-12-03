import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, 
    notification, 
    Divider,  Row, Col,
    Form, 
    DatePicker,  InputNumber, Checkbox
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError, showNotification} from "../../../utils/notification";
import {monthFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import styles from './index.less';


const { MonthPicker } = DatePicker; 
const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class ErrorCheck extends Component {


    constructor(props){
        super(props);          
        this.state = {            
            data: [],
            pagination: {},
            loading: false, 
            para1Check : true,
            para2Check : true              
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };    
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
                title: '装表地点',
                dataIndex: '装表地点',
                key: '装表地点',               
            },
            {
                title: '用水量',
                dataIndex: '用水量',
                key: '用水量', 
                sorter: (a, b) => parseFloat(a.用水量) - parseFloat(b.用水量)                
            },
            {
                title: '对比年',
                dataIndex: '对比年',
                key: '对比年',                
            },
            {
                title: '对比月',
                dataIndex: '对比月',
                key: '对比月',                
            },
            {
                title: '对比内容',
                dataIndex: '对比内容',
                key: '对比内容',              
            },
            {
                title: '对比水量',
                dataIndex: '对比水量',
                key: '对比水量',
                sorter: (a, b) => parseFloat(a.对比水量) - parseFloat(b.对比水量)  
            }          
        ];
        this.radioFilter = '';
        this.searchFilter = '';
        this.today = moment(new Date(), monthFormat);
    }
    
    fetch = ({year, month, type}) => {
        this.setState({ loading: true });
        api.get(`water/fees/${year}/${month}/${type}`, 
        {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
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

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if(!values.para1 && !values.para2) {
                showNotification('warning', '请先选择分析类型 => 大于 或者 小于');
                return;
            }
            this.setState({ loading: true });
            formatDatePickerValue(
                values,
                ['date', 'date1', 'date2'],
                monthFormat
            );
            api.post('/unit/errorcheck', values).then((dt) => {
                let data = dt.data;
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
                formatDatePickerValue(
                    values,
                    ['date', 'date1', 'date2'],
                    monthFormat
                );
                api.get(
                    `unit/error/excel/${values.date}`,
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
                        link.download = `天保市政公司水费误差分析统计表${moment().format('YYYYMMDD')}.xlsx`
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
    
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();        
    }  

    renderSearchButtons = () => 
    <div style={{ overflow: 'hidden', marginTop : '20px' }}>
        <span style={{ float: 'right', marginBottom: 24 }}>
            <Button icon="search" onClick={this.onSearch} type="primary">分析</Button>
            <Button icon="reload" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <Button icon="save" style={{ marginLeft: 8 }} type="danger"   onClick={this.onToExcel}>导出Excel</Button>
            
        </span>
    </div>

    onPara1Change = (e) => {
        this.props.form.setFieldsValue({
            date1 : this.today.clone().subtract(1, 'month')
        });         
        this.setState(
            {para1Check : !e.target.checked}
        );
    }

    onPara2Change = (e) => { 
        this.props.form.setFieldsValue({
            date2 : this.today.clone().subtract(1, 'month')
        });        
        this.setState(
            {para2Check : !e.target.checked}
        );
    }

    onFeeDateChange = (date, dateString) => {         
        this.today = date;
        this.props.form.setFieldsValue({
            date1 : this.today.clone().subtract(1, 'month')
        }); 
        this.props.form.setFieldsValue({
            date2 : this.today.clone().subtract(1, 'month')
        });
    }

    disabledDate = (current) => {
        return current && current.year() === this.today.year() &&  current.month() === this.today.month();
    }

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        return (
        <Form id="errorCheckForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row>
                <Col span={19}>
                    <FormItem
                            {...formItemLayout}
                            label="水费月份"
                        >
                            {getFieldDecorator(
                                'date',
                                {initialValue : moment(new Date(), monthFormat)}
                            )(
                                <MonthPicker
                                    onChange={this.onFeeDateChange}                                     
                                    style={{width : '58%'}} 
                                    format={monthFormat}/>
                            )}
                    </FormItem>           
                </Col>
            </Row>
            <Row  >
                
                <Col span={2}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('para1', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox onChange={this.onPara1Change}>(1)大于</Checkbox>
                        )}
                    </FormItem>                                       
                </Col>             
                <Col span={11}>
                    <FormItem
                            {...formItemLayout}
                            label="比较日期"
                        >
                            {getFieldDecorator('date1')(
                                <MonthPicker
                                    disabledDate={this.disabledDate}
                                    disabled={this.state.para1Check}
                                    style={{width : '100%'}} 
                                    format={monthFormat}/>
                            )}
                    </FormItem>           
                </Col>
                <Col span={11}>
                    <FormItem
                    label="水量超过比例"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            'proportion1',
                            {initialValue : '0.2'}
                        )(
                            <InputNumber 
                            disabled={this.state.para1Check}                                                                            
                            min={0}
                            precision={1} 
                            style={{ width: '100%' }}                                   
                            />                                
                        )}                       
                    </FormItem>
                </Col>
                <Col span={2}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('para2', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox onChange={this.onPara2Change}>(2)小于</Checkbox>
                        )}
                    </FormItem>                                       
                </Col>             
                <Col span={11}>
                    <FormItem
                            {...formItemLayout}
                            label="比较日期"
                        >
                            {getFieldDecorator('date2')(
                                <MonthPicker 
                                disabledDate={this.disabledDate}
                                disabled={this.state.para2Check} 
                                style={{width : '100%'}} 
                                format={monthFormat}/>
                            )}
                    </FormItem>           
                </Col>
                <Col span={11}>
                    <FormItem
                    label="水量超过比例"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            'proportion2',
                            {initialValue : '0.2'}
                        )(
                            <InputNumber 
                            disabled={this.state.para2Check}                                                                            
                            min={0}
                            precision={1} 
                            style={{ width: '100%' }}                                   
                            />                         
                        )}                       
                    </FormItem>
                </Col>                           
            </Row>                      
            {this.renderSearchButtons(false)} 
        </Form>
        );
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>水量错误检查</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
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

ErrorCheck.propTypes = {
    form: PropTypes.object,
};

let errorCheck = Form.create({})(ErrorCheck);
export default withRouter(errorCheck)




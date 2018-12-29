import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, message,  
    notification, Input,
    Divider,  Row, Col, 
    Form, Checkbox,  
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
 
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
 
function cancel() {
    message.error('点击了取消');
}

class CountAll extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            loading2: false,
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };    
        this.columns = [
            {
                title: '收入水量',
                dataIndex: '收入水量',
                key: '收入水量'    
            },
            {
                title: '年累计收入量',
                dataIndex: '年累计收入量',
                key: '年累计收入量'
            },
            {
                title: '实缴排污费',
                dataIndex: '排污费',
                key: '排污费'
            },
            {
                title: '水费收入',
                dataIndex: '水费收入',
                key: '水费收入'              
            },
            {
                title: '年水费累计收入',
                dataIndex: '年水费累计收入',
                key: '年水费累计收入'              
            },
            {
                title: '超额水量',
                dataIndex: '超额水量',
                key: '超额水量',                
            },
            {
                title: '超额水费',
                dataIndex: '超额水费',
                key: '超额水费'
            },
            {
                title: '市政公司水费',
                dataIndex: '市政公司水费',
                key: '市政公司水费'
            }  
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    } 

    componentDidMount() {
    }

    onStatistics = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            this.setState({ loading1: true, loading : true });
            values.date = values.date ? values.date.format("YYYYMM") : ''; 
            api.post(`/detail/countall`, values).then((dt) => {
                let data = dt.data;
                const pagination = this.state.pagination;             
                pagination.total = data.length;             
                this.setState({
                    loading: false,
                    loading1: false,
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
                        loading1: false,
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
                this.setState({ loading2: true });
                values.date = values.date ? values.date.format("YYYYMM") : '';
                api.post(
                    `detail/countall/excel`,
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading2: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `天保市政公司销售水清单${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading2: false                
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
        <Col span={6}>
            <Button style={{ marginTop: 14 }} loading={this.state.loading1} icon="pie-chart" onClick={this.onStatistics} >统计</Button>       
            <Button loading={this.state.loading2} onClick={this.onToExcel} icon="file-excel" style={{ marginLeft: 8 }}   >导出</Button>
        </Col>

    
    
    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  align="middle">              
                <Col span={6}>
                    <FormItem
                    label="月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col span={6}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('recount', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox>重新汇总</Checkbox>
                        )}
                    </FormItem>                                       
                </Col> 
                <Col span={6}>
                    <FormItem
                    label="制单"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            'user',
                            {initialValue : userName}
                        )(
                            <Input/>
                        )}              
                    </FormItem>
                </Col>
                {this.renderSearchButtons(false)} 
            </Row>
        </Form>
        );
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>销售水清单统计窗口</h5>
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

CountAll.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let countAll = Form.create({})(CountAll);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(countAll))




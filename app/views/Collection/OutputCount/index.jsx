import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, message, 
    notification, 
    Divider,  Row, Col, 
    Form, Checkbox, Modal,
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const confirm = Modal.confirm;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}

class OutputCount extends Component {
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
                title: '托收批次',
                dataIndex: '托收批次',
                key: '托收批次'    
            },
            {
                title: '托收笔数',
                dataIndex: '托收笔数',
                key: '托收笔数'
            },
            {
                title: '托收金额',
                dataIndex: '托收金额',
                key: '托收金额'
            },
            {
                title: '成功笔数',
                dataIndex: '成功笔数',
                key: '成功笔数'              
            },
            {
                title: '成功金额',
                dataIndex: '成功金额',
                key: '成功金额'              
            },
            {
                title: '失败笔数',
                dataIndex: '失败笔数',
                key: '失败笔数',                
            },
            {
                title: '失败金额',
                dataIndex: '失败金额',
                key: '失败金额'
            } 
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    } 

    componentDidMount() {
        let date = this.props.form.getFieldValue('date');
        date = date.format("YYYYMM");
        this.fetchItems(date);
    }

    fetchItems = (date) => {
        this.setState({ loading: true });
        api.get(`/collection/count/${date}`, {            
            responseType: 'json'
        }).then((dt) => {
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
    }

    onCreation = (e) => {
        e.preventDefault(); 
        let commitApi = (values) => {
            this.setState({
                loading1: true,
                loading: true,                
            });
            api.put(
            `collection/count`, values, {            
                responseType: 'json'
            }
            ).then(
                data => {
                    data = data.data;
                    const pagination = this.state.pagination;             
                    pagination.total = data.length;             
                    this.setState({
                        loading: false,
                        data: data,
                        pagination,
                        loading1: false 
                    });
                }
            ).catch(
                err => {
                    handleError(err); 
                    const pagination = this.state.pagination;
                    pagination.total = 0;             
                    this.setState({
                        loading: false,
                        data: [],
                        pagination,
                        loading1: false   
                    }); 
                }
            ); 
        }              
        this.props.form.validateFields((err, values) => {            
            values.date = values.date ? values.date.format("YYYYMM") : ''; 
            api.get(`/collection/count/${values.date}`, {            
                responseType: 'json'
            }).then((data) => {                
                if(data.data.length > 0) {
                    confirm({
                        title: '严重警告',
                        content: '要生成托收月份的水费托收统计记录已存在，重新生成将删除原有所有记录，要继续吗?',
                        onOk() {
                            commitApi(values);
                        }, 
                        onCancel() {
                            message.info('选择不删除原有数据,创建中止!');
                        },                   
                        okText : "确认",
                        cancelText : "取消"
                    });
                }else {
                    commitApi(values);
                }             
            }).catch(
                err => {                                            
                    this.setState({
                        loading2: false                
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
                    `collection/count/excel`,
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
                        link.download = `托收情况统计${moment().format('YYYYMMDD')}.xlsx`
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

    onMonthChange = (date, dateString) => {
        date = date ? date.format("YYYYMM") : '';
        this.fetchItems(date);
    }

    renderSearchButtons = () =>
        <Col offset={12} span={6}>
            <Button style={{ marginTop: 14 }} loading={this.state.loading1} icon="pie-chart" onClick={this.onCreation} >统计</Button>       
            <Button loading={this.state.loading2} onClick={this.onToExcel} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>
        </Col>

    
    
    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
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
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
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
                        <h5>月水费数据托收统计窗口</h5>
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

OutputCount.propTypes = {
    form: PropTypes.object,    
};

let outputCount = Form.create({})(OutputCount);

export default withRouter(connect(null, null)(outputCount))




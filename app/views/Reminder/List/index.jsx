import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, Input, 
    notification,  Badge,
    Divider,  Row, Col, Alert, 
    Form, Select,Icon, Modal,
    DatePicker, List
} from 'antd';
import moment from 'moment';
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat,  formItemLayout, } from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;

class ReminderList extends Component {
    constructor(props){
        super(props);        
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            loading2: false,
            modalVisible: false,
            confirmLoading: false,
            selectedRowKeys: [],
            selectedRows:[],
            chargekinds : [],
            searchText: '',
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
                width : '15%',
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号),
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                    <div className="custom-filter-dropdown">
                        <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="搜索编号"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={this.handleSearch(selectedKeys, confirm)}
                        />
                        <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>搜索</Button>
                        <Button onClick={this.handleReset(clearFilters)}>清除</Button>
                    </div>
                    ),
                    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
                    onFilter: (value, record) => 
                    {   
                        return record.编号 === value;
                    },
                    onFilterDropdownVisibleChange: (visible) => {
                        if (visible) {
                        setTimeout(() => {
                            this.searchInput.focus();
                        });
                        }
                    },
                    render: (text) => {
                        const { searchText } = this.state;
                        return searchText && searchText === text ? (
                        <span className="highlight">
                            {text}
                        </span>
                        ) : text;
                    },     
            },
            {
                title: '户名',
                dataIndex: '户名',
                width : '15%' , 
                sorter: (a, b) => a.户名.length - b.户名.length,
            },
            {
                title: '拖欠月数',
                dataIndex: '月数',
                width : '15%' , 
                filters: [{
                    text: '正常',
                    value: '1',
                }, {
                    text: '超期',
                    value: '2',
                }],
                onFilter: (value, record) => {
                    if(value === '1') {
                        return record.月数 === 1
                    }else {
                        return record.月数 !== 1
                    }
                },
                render(val) {
                    if(parseInt(val) > 1) {
                        return <Badge status='error' text={val} />;
                    }else {
                        return val;
                    }
                },
            },
            {
                title: '拖欠月份',
                dataIndex: '月份',
                width : '15%',
                render:function(text, record, index){
                    if(record.年1 === record.年2 && record.月1 === record.月2) {
                        return <span>{`${record.年1}年${record.月1}月`}</span>
                    }else {
                        return <span>{`${record.年1}年${record.月1}月-${record.年2}年${record.月2}月`}</span>
                    }
                } ,
            },
            {
                title: '水费合计',
                dataIndex: '实收水费',
                width : '15%' , 
                sorter: (a, b) => parseInt(a.实收水费) - parseInt(b.实收水费)
            },
            {
                title: '滞纳金合计',
                dataIndex: '滞纳金',
                width : '15%' , 
                sorter: (a, b) => parseInt(a.滞纳金) - parseInt(b.滞纳金)
            },
            {
                title: '总计',
                dataIndex: '合计',
                width : '10%' 
            }
        ];
        this.selectedItems = [];
        this.today = moment(new Date(), 'YYYYMMDD');
    }

    handleSearch = (selectedKeys, confirm) => () => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }
    
    handleReset = clearFilters => () => {
        clearFilters();
        this.setState({ searchText: '' });
    }

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            values.date1 = values.date1 ? values.date1.format("YYYYMM") : '';
            values.date2 = values.date2 ? values.date2.format("YYYYMM") : '';
            api.post(`/reminder/items`, values).then((dt) => {
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

    reminderToWord = (index, flag, fileName) => {
        const {selectedRows} = this.state;
        if( !selectedRows || selectedRows.length === 0 ) {
            showNotification('error', '请先选择企业！');                
            return;
        }
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        api.post(
            `/reminder/${flag}/word`, 
            selectedRows,
            {            
                responseType: 'arraybuffer'
            }
        ).then((dt) => {  
            obj[`loading${index}`] = false; 
            this.setState(obj);
            let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } )
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `${fileName}${moment().format('YYYYMMDD')}.docx`
            link.click()
        }).catch(
        err => {
            handleError(err);                         
            obj[`loading${index}`] = false; 
            this.setState(obj);
        }
        );
    }

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >
                <Col span={4}>
                    <FormItem
                    label="起始" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date1',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>
                <Col span={4}>
                    <FormItem
                    label="终止" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date2',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>
                <Col span={6}>
                    <FormItem
                    label="编号" 
                    {...formItemLayout}                      
                    >                  
                        {getFieldDecorator(
                            '编号',
                            {initialValue : ''}
                        )(
                            <Input        />                                
                        )}
                    </FormItem>
                </Col>
                <Col  span={10}>
                  <Button icon="search" onClick={this.onSearch} style={{ marginLeft: 8, marginTop: 4 }}  type="primary">查询</Button>
                  <Button  type="primary" onClick={() => this.handleModalVisible(true)} icon="message" style={{ marginLeft: 8, marginTop: 4 }}   >短信催缴</Button>
                  <Button  type="primary" 
                  loading={this.state.loading1} 
                  onClick={() => {this.reminderToWord(1, 'reminder' ,'催款通知')}} 
                  icon="exclamation-circle" style={{ marginLeft: 8, marginTop: 4 }}   >催款通知</Button>
                  <Button  type="primary" 
                  loading={this.state.loading2} 
                  onClick={() => {this.reminderToWord(2, 'suspension' ,'停水通知')}} 
                  icon="poweroff" style={{ marginLeft: 8, marginTop: 4 }}   >停水通知</Button>
                </Col> 
            </Row>
        </Form>
        );
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    cleanSelectedKeys = () => { 
        this.onSelectChange([], []);
    }

    handleModalVisible = (flag) => {
        this.setState({
            modalVisible: !!flag,
        });
    }

    handleSMS = () => {
        const {selectedRows} = this.state;
        this.setState({
            confirmLoading: true,
        });
        api.post('reminder/sms',selectedRows).then((data) => {
            data = data.data;
            notification.success({
                message: '提示',
                description: `完成发送短信。`,
                duration: 3,
            });
            this.setState({
                confirmLoading: false,
                selectedRows : data
            });
        }).catch(
            err => {
                this.setState({
                    confirmLoading: false,
                });  
                notification.error({
                    message: '提示',
                    description: `发送短信不成功,请重试。`,
                    duration: 3,
                });
            }
        );
    }

    renderSMSResult = (item) => {
        if(item && item.desc){
            let desc = item.desc;
            if (desc.indexOf('success') !== -1) {
                //return <span>发送成功</span>
                return <Alert message="发送成功" type="success" showIcon />
            }else if(desc === 'error:Missing recipient') {
                //return <span>发送失败,原因：手机号码无效</span>
                return <Alert message="发送失败,原因：手机号码无效" type="error" showIcon />
            }else {
                //return <span>发送失败</span>
                return <Alert message="发送失败" type="error" showIcon />
            }
        }
        return '';
    }

    renderSMSForm = () => {
        const {modalVisible, selectedRows, confirmLoading} = this.state;

        return (
                <Modal
                    width={800}
                    title="发送催缴短信"
                    visible={modalVisible}
                    confirmLoading={confirmLoading}
                    onOk={this.handleSMS}
                    onCancel={() => this.handleModalVisible()}
                    okText="发送短信"
                    cancelText="取消"
                    okButtonProps={{ disabled: selectedRows.length > 0 ? false : true }}
                    >
                    <List
                        size="middle"
                        pagination={ selectedRows.length > 3 ?  {
                        onChange: (page) => {
                        },
                        pageSize: 3,
                        } : null}
                        dataSource={selectedRows}
                        renderItem={item => {
                                if(item && item.desc) {
                                    return <List.Item key={item.编号}>
                                        <List.Item.Meta
                                        avatar={<Icon type="user" />}
                                        title={`${item.编号}-${item.户名}`}
                                        description={
                                            <span className="highlight">迄今为止贵企业共欠{item.月数}个月水费,金额为{item.实收水费},滞纳金为{item.滞纳金},合计{item.合计},请尽快缴清。
                                            </span>
                                        }
                                        />
                                        {
                                            item && item.desc ? this.renderSMSResult(item) : ''
                                            }
                                    </List.Item>
                                }else {
                                    return <List.Item key={item.编号}>
                                    <List.Item.Meta
                                    avatar={<Icon type="user" />}
                                    title={`${item.编号}-${item.户名}`}

                                    description={
                                    <span className="highlight">迄今为止贵企业共欠{item.月数}个月水费,金额为{item.实收水费},滞纳金为{item.滞纳金},合计{item.合计},请尽快缴清。
                                    </span>
                                    }
                                    />
                                    </List.Item>
                                }
                    }}
                    > 
                    </List>
                </Modal>
        );
    }

    render() {
        const { loading, selectedRowKeys, data, selectedRows } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>催缴管理</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <div style={{marginBottom : '20px'}}>
                        <Alert
                            message={(
                            <div>
                                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 家&nbsp;&nbsp;
                                共 <span style={{ fontWeight: 600 }}>{data.length}</span> 家
                                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
                            </div>
                            )}
                            type="info"
                            showIcon
                        />
                    </div>
                    <Table columns={this.columns}                     
                        rowKey={record => parseInt(record.编号)}
                        dataSource={this.state.data}
                        rowSelection={rowSelection}
                        pagination={false}
                        loading={this.state.loading}
                        bordered
                        scroll={{ y: 400 }}
                        footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                    />
                    {this.renderSMSForm()}
                </div>
            </div>
        );
    }


}

ReminderList.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let form = Form.create({})(ReminderList);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(form))




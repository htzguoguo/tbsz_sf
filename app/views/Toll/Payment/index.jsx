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
const confirm = Modal.confirm;
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat,  formItemLayout, } from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;

class PaymentList extends Component {
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
          values.起始年月 = values.date ? values.date.format("YYYYMM") : '';
          values.终止年月 = values.date ? values.date.format("YYYYMM") : '';
          values.欠费标志 = true;
          api.post('/water/feesearch', values).then((dt) => {
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

    onHandlePayment = (index) => {
      const self = this;
        const {selectedRows} = this.state;
        if( !selectedRows || selectedRows.length === 0 ) {
            showNotification('error', '请先选择需要确认的缴费记录！');                
            return;
        }
        let obj = {};
        confirm({
          title: '警告:',
          content: `确定水费已经缴纳吗？`,
          onOk() {
              obj[`loading${index}`] = false; 
              self.setState(obj);
              api.post(`/water/payment`, selectedRows).then((data) => {
                notification.success({
                    message: '提示',
                    description: `完成水费缴纳操作。`,
                    duration: 3,
                });
                obj[`loading${index}`] = false; 
                self.setState(obj);
              }).catch(
                err => {
                  handleError(err);                         
                  obj[`loading${index}`] = false; 
                  self.setState(obj);
              }
              );
          }, 
          onCancel() {
          },                   
          okText : "确认",
          cancelText : "取消"
      });
    }

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >
                <Col span={4}>
                    <FormItem
                    label="日期" 
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
                <Col span={6}>
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
                <Col span={4}>
                    <Button icon="search" onClick={this.onSearch} style={{ marginLeft: 8, marginTop: 4 }}  type="primary">查询</Button>
                </Col>
                <Col span={4}>
                    <Button  type="primary" 
                    loading={this.state.loading2} 
                    onClick={() => {this.onHandlePayment(2)}} 
                    icon="check" style={{ marginLeft: 8, marginTop: 4 }}   >缴费确认</Button>
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
                            <h5>缴费确认</h5>
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
                </div>
            </div>
        );
    }


}

PaymentList.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let form = Form.create({})(PaymentList);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(form))




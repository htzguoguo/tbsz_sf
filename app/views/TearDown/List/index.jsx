import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table,  Badge, Modal, 
    notification, Popconfirm,  
    Divider, Input, Row, Col, Radio,
    Select,   Form, Alert 
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {formItemLayout} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const Search = Input.Search;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { TextArea } = Input;
class TearDownList extends Component {

    constructor(props) {
        super(props);       
        this.onContractSearch = this.onContractSearch.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.selectedNum = '0002';

        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            visible: false,
            showStat : false,
            modalVisible: false,
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };
        const downloadFile = this.downloadFile.bind(this);
        const handleTaskDone = this.handleTaskDone.bind(this); 
        const handleDelete = this.handleDelete.bind(this);
        let self = this;
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
                sorter: (a, b) => a.户名.length - b.户名.length,
            },
            {
                title: '通知人',
                dataIndex: '通知人',
            },
            {
                title: '状态',
                dataIndex: '状态',
                render(val) {
                    if(val ===  '完成') {
                        return <Badge status='success' text={val} />;
                    }else {
                        return <Badge status='processing' text={val} />;
                    }
                },
            },
            {
                title: '申请时间',
                dataIndex: '操作时间',
            },
            { 
              title: '处理结果',
              dataIndex: '处理结果',
            },
            { 
              title: '经办人',
              dataIndex: '经办人',
            },
            {
                title: '完成时间',
                dataIndex: '完成时间',
            },
            {
                title: '操作',
                dataIndex: '编号',
                render:function(text, record, index){
                    let element = [];
                    element.push(<a onClick={downloadFile.bind(this,text, record, index)} >下载</a>)
                     
                    if(record.状态 !==  '完成') {
                        element.push(<Divider type="vertical" />);
                        element.push(<a onClick={() => {
                            // confirm({
                            //     title: '系统提示:',
                            //     content: `"确定[${record.户名}]终止供水合同已经完成？`,
                            //     onOk() {
                            //         handleTaskDone(text, record, index);
                            //     }, 
                            //     onCancel() {
                            //     },                   
                            //     okText : "确认",
                            //     cancelText : "取消"
                            // }); 
                            self.record = record;
                            self.props.form.setFieldsValue(record);
                                self.setState({                                                               
                                    modalVisible: true,
                                });      
                        }}>完成合同</a>);
                        element.push(<Divider type="vertical" />);
                        element.push(<a onClick={() => {
                            confirm({
                                title: '系统提示:',
                                content: `"确定要撤销企业[${record.户名}]终止供水合同？`,
                                onOk() {
                                    handleDelete(text, record, index);
                                }, 
                                onCancel() {
                                },                   
                                okText : "确认",
                                cancelText : "取消"
                            });   
                        }}>撤销</a>);
                    } 
                    
                    return (
                        <span>                           
                            {element}
                        </span>
                    )
                } ,
                width: '15%'
            }
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    }

    componentDidMount() {
        this.onContractSearch();
    }

    handleTaskDone() {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          api.put(`contract/teardown`, values)
          .then((data) => { 
              notification.success({
                  message: '提示',
                  description: `${values.户名}的终止供水合同完成。`,
                  duration: 3,
              }); 
              this.setState({modalVisible : false});                   
              this.onContractSearch(this.selectedNum);                   
          })
          .catch(
              err => { 
                this.setState({modalVisible : false});                      
                  notification.error({
                      message: '提示',
                      description: `${values.户名}的终止供水合同不成功，请重试。"`,
                      duration: 3,
                  });
              }
          );
        }
    }); 
        
    }

    downloadFile(text, record, index) {
        api.get(
            `/files/contract/${record.文件}`,
            {            
                responseType: 'blob'
            }
        ).then((dt) => {  
            let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } )
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `${record.户名}终止供水合同${moment().format('YYYYMMDD')}.docx`
            link.click()
        }).catch(
        err => {
            handleError(err);
        }
        );
    }

    handleDelete(text, record, index) {
        api.delete(`contract/teardown/${record.编号}`)
        .then((data) => { 
            notification.success({
                message: '提示',
                description: `${record.户名}的终止供水合同撤销完成。`,
                duration: 3,
            });                    
            this.onContractSearch(this.selectedNum);                   
        })
        .catch(
            err => {                       
                notification.error({
                    message: '提示',
                    description: `${record.户名}的终止供水合同撤销不成功，请重试。"`,
                    duration: 3,
                });
            }
        );
    }

    onContractSearch(num) {
        this.selectedNum = num;
        api.get(`contract/teardown/${num ? num : 'undefined'}`, {            
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
            
        }).catch(err => {
            handleError(err);
            const pagination = this.state.pagination;
            pagination.total = 0;             
            this.setState({
                loading: false,
                data: [],
                pagination,
            });
        });
    }

    renderCompleteForm = () => {
      const { getFieldDecorator } = this.props.form;
      const {mode} = this.state;
      return (
          <Modal
              title='完成合同'
              centered
              visible={this.state.modalVisible}
              okText="确认"
              cancelText="取消"
              onOk={() => {
                  this.setState({modalVisible : true});
                  this.handleTaskDone();
                  if(mode === 'add') {                       
                      this.handleAdd();
                  }else {
                      this.handleEdit();
                  }
              }}
              onCancel={() => this.setState({modalVisible : false})}
          >
              <Form id="searchParasForm"   form={this.props.form}>
                <FormItem
                      label="编号" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '编号',
                              {initialValue : ''}
                          )(
                              <Input disabled={true}></Input>
                          )}  
                </FormItem>
                <FormItem
                      label="户名" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '户名',
                              {initialValue : ''}
                          )(
                            <Input disabled={true}></Input>
                          )}  
                </FormItem>
                <FormItem
                    label="经办人" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '经办人',
                            {initialValue : ''}
                        )(
                            <Input  ></Input>
                        )}  
                </FormItem>
                <FormItem
                    label="处理结果" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '处理结果',
                            {initialValue : ''}
                        )(
                          <TextArea rows={4} />
                        )}  
                </FormItem>
              </Form>
          </Modal>
          );
  }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>终止供水合同列表</h5>
                    </div>
                </div>
                <Row>
                <Col span={10}>
                        <Search
                            ref={input => this.Search = input}
                            placeholder="编号/户名"
                            defaultValue={''}
                            onSearch={(e => {
                                this.onContractSearch(e);
                            })}
                            enterButton="搜索"
                        />
                    </Col>
                </Row>
                {this.renderCompleteForm()}
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

let form = Form.create({})(TearDownList);
export default withRouter(form)
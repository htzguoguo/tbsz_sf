import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, 
    notification,  Modal,
    Divider, Input, Row, Col, 
     Checkbox, Form, InputNumber  
} from 'antd';

import api from '../../../api';
import {formItemLayout} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const confirm = Modal.confirm;
const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class BankSetup extends Component {
    constructor(props){
        super(props);      
        this.state = {
            data: [],
            pagination: {},
            mode : 'add',
            loading: false,
            loading1: false,
            modalVisible: false,
            visible: false,
            showStat : false    
        };
        const handleAdd = this.handleAdd.bind(this);   
        const handleDelete = this.handleDelete.bind(this);        
        const handleEdit = this.handleEdit.bind(this);
        this.onAlertClose = this.onAlertClose.bind(this);
        let self = this;
        this.columns = [
            {
                title: '开户行行号',
                dataIndex: '开户行行号',
                key: '开户行行号',
            },
            {
                title: '开户行行名',
                dataIndex: '开户行行名',
                key: '开户行行名',
            },
            {
                title: '验证',
                dataIndex: '是否验证',
                key: '是否验证',              
            },
            {
                title: '位数',
                dataIndex: '帐号位数',
                key: '帐号位数',              
            },
            {
                title: '相同',
                dataIndex: '帐号相同位数',
                key: '帐号相同位数',              
            },
            {
                title: '帐号相同代码',
                dataIndex: '帐号相同代码',
                key: '帐号相同代码',               
            },
            {
                title: '帐号相同代码1',
                dataIndex: '帐号相同代码1',
                key: '帐号相同代码1',               
            },
            {
                title: '业务种类',
                dataIndex: '业务种类',
                key: '业务种类',               
            },
            {
                title: '银行代码',
                dataIndex: '银行代码',
                key: '银行代码',               
            },
            {
                title: '银行名称',
                dataIndex: '银行名称',
                key: '银行名称',               
            },
            {
                title: '简称',
                dataIndex: '简称',
                key: '简称',               
            },
            {
                title: '使用次数',
                dataIndex: '使用次数',
                key: '使用次数',               
            },
            {
                title: '操作',
                dataIndex: '编号',
                key : '编号',
                render:function(text, record, index){
                    return (
                        <span>                           
                            <a onClick={() => {
                                record.验证 = record.是否验证 === 'Y' ? true : false;
                                self.props.form.setFieldsValue(record);
                                self.setState({
                                    mode : 'edit',                               
                                    modalVisible: true,
                                });    
                            }}>修改</a>
                            <Divider type="vertical" />
                            <a onClick={() => {
                                confirm({
                                    title: '严重警告:',
                                    content: `删除银行值可能会造成部分数据无法正确显示! 要删除 开户行行名为"${record.开户行行名}"的记录吗？`,
                                    onOk() {
                                        handleDelete(text, record, index);
                                    }, 
                                    onCancel() {
                                    },                   
                                    okText : "确认",
                                    cancelText : "取消"
                                });   
                            }}>删除</a>
                        </span>
                    )
                } 
            }
        ];
    }


    fetch = () => {
        this.setState({ loading: true });
        api.get(`collection/banks`, 
        {            
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
        this.fetch();
    }

    handleEdit() {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                api.post(`collection/banks`, 
                values,
                {            
                    responseType: 'json'
                }).then((dt) => {
                    notification.success({
                        message: '提示',
                        description: `开户行行名为"${values.开户行行名}修改完成。"`,
                        duration: 3,
                    });
                    this.setState({modalVisible : false});
                    this.fetch();
                }).catch(
                    err => {                       
                        notification.error({
                            message: '提示',
                            description: `开户行行名为"${values.开户行行名}修改不成功，请重试。"`,
                            duration: 3,
                        });
                    }
                ); 
                    }
        });     
    }

    handleDelete(text, record, index) {
        api.delete(`/collection/banks/${record.开户行行号}`)
        .then((data) => { 
            notification.success({
                message: '提示',
                description: `开户行行名为"${record.开户行行名}删除完成。`,
                duration: 3,
            });                    
            this.fetch();                   
        })
        .catch(
            err => {                       
                notification.error({
                    message: '提示',
                    description: `开户行行名为"${record.开户行行名}删除不成功，请重试。"`,
                    duration: 3,
                });
            }
        );
    }
    
    handleAdd = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                api.put(`collection/banks`, 
                values,
                {            
                    responseType: 'json'
                }).then((dt) => {
                    notification.success({
                        message: '提示',
                        description: `开户行行名为"${values.开户行行名}添加完成。"`,
                        duration: 3,
                    });
                    this.setState({modalVisible : false});
                    this.fetch();
                }).catch(
                    err => {                       
                        notification.error({
                            message: '提示',
                            description: `开户行行名为"${values.开户行行名}添加不成功，请重试。"`,
                            duration: 3,
                        });
                    }
                ); 
                    }
        });
    };    

    onAlertClose(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({            
            showStat : false          
        }); 
    }

    renderAddEditForm = () => {
        const { getFieldDecorator } = this.props.form;
        const {mode} = this.state;
        let isChecked = this.props.form.getFieldValue('验证');
        return (
            <Modal
                title={mode === 'add' ? '新建' : '修改'}
                centered
                visible={this.state.modalVisible}
                okText="确认"
                cancelText="取消"
                onOk={() => {
                    this.setState({modalVisible : true});
                    if(mode === 'add') {                       
                        this.handleAdd();
                    }else {
                        this.handleEdit();
                    }
                }}
                onCancel={() => this.setState({modalVisible : false})}
            >
                <Form id="searchParasForm" className={styles.searchParasForm} form={this.props.form}>
                    <FormItem
                        label="开户行行号" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '开户行行号',
                                {initialValue : ''}
                            )(
                                <Input disabled={mode === 'edit' ? true : false}></Input>
                            )}  
                    </FormItem>
                    <FormItem
                        label="开户行行名" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '开户行行名',
                                {initialValue : ''}
                            )(
                                <Input></Input>
                            )}  
                    </FormItem>
                    <FormItem
                        label="业务种类" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '业务种类',
                                {initialValue : ''}
                            )(
                                <Input></Input>
                            )}  
                    </FormItem>
                    <FormItem
                        label="验证" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator('验证', {                                  
                                        initialValue : false,
                                        valuePropName: 'checked'
                                    })(
                                        <Checkbox ></Checkbox>
                                    )}
                    </FormItem>
                    <FormItem
                        label="帐号总位数" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '帐号位数',
                                {initialValue : '0'}
                            )(
                                <InputNumber  disabled={!isChecked}></InputNumber >
                            )}  
                    </FormItem>
                    <FormItem
                        label="相同位数" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '帐号相同位数',
                                {initialValue : '0'}
                            )(
                                <InputNumber  disabled={!isChecked}></InputNumber >
                            )}  
                    </FormItem>
                    <FormItem
                        label="帐号相同代码" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '帐号相同代码',
                                {initialValue : ''}
                            )(
                                <Input disabled={!isChecked}></Input>
                            )}  
                    </FormItem>
                    <FormItem
                        label="或" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '帐号相同代码1',
                                {initialValue : ''}
                            )(
                                <Input disabled={!isChecked}></Input>
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
                        <h5>银行默认规则设置</h5>
                    </div>
                </div>
                <Row type="flex" justify="start">
                    <Col  span={2} >                        
                        <Button type="primary" onClick={ () => {
                            this.props.form.resetFields();
                            this.setState({
                                mode : 'add',                               
                                modalVisible: true,
                            });                            
                        }} icon="plus">增加</Button>
                    </Col>
                </Row>
                {this.renderAddEditForm()}
                <Divider></Divider>
                <Table columns={this.columns}                     
                    rowKey={record => record.开户行行号}
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

BankSetup.propTypes = {
    form: PropTypes.object,    
};

let bankSetup = Form.create({})(BankSetup);
export default withRouter(bankSetup)




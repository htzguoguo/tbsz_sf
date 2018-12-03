import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, 
    notification,  Modal,
    Divider, Input, Row, Col, 
    Form, InputNumber  
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

class FireStandard extends Component {
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
                title: '防火标准编号',
                dataIndex: '防火标准编号',
                key: '防火标准编号',
            },
            {
                title: '管径',
                dataIndex: '管径',
                key: '管径',
            },
            {
                title: '防火费',
                dataIndex: '防火费',
                key: '防火费',
            },           
            {
                title: '操作',
                dataIndex: '编号',
                key : '编号',
                render:function(text, record, index){
                    return (
                        <span>                           
                            <a onClick={() => {                                
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
                                    content: `删除字典值可能会造成部分数据无法正确计算! 要删除防火标准编号为"${record.防火标准编号}"的记录吗？`,
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
        api.get(`dict/firestandard`, 
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
                api.post(`dict/firestandard`, 
                values,
                {            
                    responseType: 'json'
                }).then((dt) => {
                    notification.success({
                        message: '提示',
                        description: `防火标准编号为"${values.防火标准编号}"的记录修改完成。"`,
                        duration: 3,
                    });
                    this.setState({modalVisible : false});
                    this.fetch();
                }).catch(
                    err => {                       
                        notification.error({
                            message: '提示',
                            description: `防火标准编号为"${values.防火标准编号}"的记录修改不成功，请重试。"`,
                            duration: 3,
                        });
                    }
                ); 
                    }
        });     
    }

    handleDelete(text, record, index) {
        api.delete(`dict/firestandard/${record.防火标准编号}`)
        .then((data) => { 
            notification.success({
                message: '提示',
                description: `防火标准编号为"${record.防火标准编号}"的记录删除完成。`,
                duration: 3,
            });                    
            this.fetch();                   
        })
        .catch(
            err => {                       
                notification.error({
                    message: '提示',
                    description: `防火标准编号为"${record.防火标准编号}"的记录删除不成功，请重试。"`,
                    duration: 3,
                });
            }
        );
    }
    
    handleAdd = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                api.put(`dict/firestandard`, 
                values,
                {            
                    responseType: 'json'
                }).then((dt) => {
                    notification.success({
                        message: '提示',
                        description: `防火标准编号为"${values.防火标准编号}"的记录添加完成。"`,
                        duration: 3,
                    });
                    this.setState({modalVisible : false});
                    this.fetch();
                }).catch(
                    err => {                       
                        notification.error({
                            message: '提示',
                            description: `防火标准编号为"${values.防火标准编号}"的记录添加不成功，请重试。"`,
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
                        label="防火标准编号" 
                        {...formItemLayout}                      
                        >
                            {getFieldDecorator(
                                '防火标准编号',
                                {initialValue : ''}
                            )(
                                <Input disabled={mode === 'edit' ? true : false}></Input>
                            )}  
                    </FormItem>                    
                    <FormItem
                        {...formItemLayout}
                        label="管径"
                        
                    >
                        {getFieldDecorator(
                            '管径',
                            {                               
                                initialValue : '0'
                            } 
                        )(
                            <InputNumber                                                                             
                            min={0}
                            precision={0} 
                            style={{ width: '100%' }}                                   
                        />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="防火费"
                        
                    >
                        {getFieldDecorator(
                            '防火费',
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
                </Form>
            </Modal>
            );
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>字典编辑窗口</h5>
                    </div>
                </div>
                <Row type="flex" justify="start">
                    <Col  span={2} >                        
                        <Button type="primary" onClick={ () => {
                            //this.props.form.resetFields();
                            let {data} = this.state;
                            let last = data.reduce(
                                (accumulator, currentValue) => accumulator > parseInt(currentValue.防火标准编号) ? accumulator : parseInt(currentValue.防火标准编号),
                                0
                            );                           
                            this.props.form.setFieldsValue({
                                防火标准编号 : last + 1,                                
                                管径 : '0',
                                防火费 : '0',                                
                            });
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
                    rowKey={record => record.防火标准编号}
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

FireStandard.propTypes = {
    form: PropTypes.object,    
};

let fireStandard = Form.create({})(FireStandard);
export default withRouter(fireStandard)




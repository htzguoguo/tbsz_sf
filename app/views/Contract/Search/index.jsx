import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message,  
    notification,  
    Divider, Input, Row, Col, Tooltip ,
    Select,   Form,  
    DatePicker,    Checkbox
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const { RangePicker  } = DatePicker;
const Option = Select.Option; 
const FormItem = Form.Item; 
const monthFormat = 'YYYYMMDD';
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

function cancel() {
    message.error('点击了取消');
}

class SearchContract extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            pagination: {},
            loading: false,
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };   
        const downloadFile = this.downloadFile.bind(this); 
        this.columns = [
            {
                title: '编号',
                dataIndex: '编号',
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号),
                width: '15%'                 
            },
            {
                title: '户名',
                dataIndex: '户名',
                sorter: (a, b) => a.户名.length - b.户名.length,
                width: '25%'
            },
            {
                title: '文档名称',
                dataIndex: '名称',
                sorter: (a, b) => a.户名.length - b.户名.length, 
                width: '15%'
            },
            {
                title: '文档名称',
                dataIndex: '分类',
                width: '15%'
            },
            {
                title: '上传日期',
                dataIndex: '操作时间',
                width: '15%'
            },
            {
                title: '下载',
                render:function(text, record, index){
                    let local = record.原始文件.split(',');
                    let server = record.本地文件.split(',');
                    let items = [];
                    console.log(local, server, index);
                    for(let i = 0; i < server.length; i++){

                        items.push(<Tooltip title={local[i]} key={i}><a  onClick={downloadFile.bind(this, server[i], local[i], i)} >文件{i + 1}</a></Tooltip>)
                        if(i < server.length - 1) {
                            items.push(<Divider type="vertical" />)
                        }
                    }
                    // let items = server.map(
                    //     (item, index) => {
                    //         return (<p key={index}><a  onClick={downloadFile.bind(this,item, local[index], index)} >文件{index + 1}</a></p>)
                    //     });
                        
                    return items;
                } ,
                width: '15%'
            }         
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    }

    downloadFile(server, local, index) {
        api.get(
            `/files/file/${server}`,
            {            
                responseType: 'blob'
            }
        ).then((dt) => { 
          let ext = server.split('.')[1];

          let blob = new Blob([dt.data])
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = local
          link.click()
        }).catch(
        err => {
            handleError(err);
        }
        );
    }

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            api.post('/contract/files/search', values).then((dt) => {
                let data = dt.data;
                const pagination = this.state.pagination;             
                pagination.total = data.length;             
                this.setState({
                    loading: false,
                    data,
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
    
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();        
    }  

    renderSearchButtons = () => 
    <div style={{ overflow: 'hidden', marginTop : '20px' }}>
        <span style={{ float: 'right', marginBottom: 24 }}>
            <Button icon="search" onClick={this.onSearch} type="primary">查询</Button>
            <Button icon="reload" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>            
        </span>
    </div>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={6}>
                    <FormItem
                    label="编号" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '编号',
                            {initialValue : ''}
                        )(
                            <Input/>                                
                        )}      
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
                <Col span={6}>
                    <FormItem 
                    label="文档名称" 
                    {...formItemLayout}                          
                    >
                    {getFieldDecorator(
                        '名称',
                        {initialValue : ''}
                    )(
                        <Input /> 
                    )}
                    </FormItem>
                </Col>
                <Col span={6}>
                    <FormItem 
                    label="文档分类"
                    {...formItemLayout}                           
                    >
                    {getFieldDecorator(
                        '分类',
                        {initialValue : ''}
                    )(
                        <Input /> 
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
                        <h5>查询资料</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
                <Divider></Divider>
                <Table 
                  columns={this.columns}                     
                  // rowKey={record => parseInt(record.编号)}
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

SearchContract.propTypes = {
    form: PropTypes.object,
};

let form = Form.create({})(SearchContract);
export default withRouter(form)




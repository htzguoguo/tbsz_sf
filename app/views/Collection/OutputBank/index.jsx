import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, message, 
    notification, Input, Transfer,
    Divider,  Row, Col, 
    Form, Checkbox, Modal,
    DatePicker,
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

class OutputBank extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            bank : [],
            targetKeys: [],
            pagination: {},
            loading: false,
            loading1: false,
            loading2: false,
            loading3: false,
            loading4: false,
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };    
        this.columns = [
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名'    
            },
            {
                title: '用水地点',
                dataIndex: '用水地点',
                key: '用水地点'
            },
            {
                title: '应收水费',
                dataIndex: '应收水费',
                key: '应收水费'
            },
            {
                title: '批次',
                dataIndex: '批次',
                key: '批次'              
            },
            {
                title: '备注',
                dataIndex: '备注',
                key: '备注'              
            } 
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    } 

    componentDidMount() {
        this.fetchParameters();
    }

    fetchParameters = () => {
        api.get(`collection/bank`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data; 
            let bank = data.map(
                item => ({key : item.银行代码, title : item.银行代码, description : item.银行名称})
            );           
            this.setState({bank});           
        }).catch(this.handleError); 
    }

    fetchItems = (e) => {
        e.preventDefault();
        let obj = this.props.form.getFieldsValue();        
        obj.date = obj.date.format("YYYYMM");
        this.setState({ loading: true, loading1 : true });
        api.post(`/collection/collection`, obj,  {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
            const pagination = this.state.pagination;             
            pagination.total = data.length;             
            this.setState({
                loading: false,
                loading1 : false,
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
                    loading1 : false,
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
                loading2: true                
            });
            api.put(
            `collection/collection`, values
            ).then(
                data => {
                    notification.success({
                        message: '提示',
                        description: '完成生成托收月份的水费记录',
                        duration: 3,
                    });
                    this.setState({
                        loading2: false                
                    }); 
                }
            ).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading2: false                
                    });
                }
            ); 
        }              
        this.props.form.validateFields((err, values) => {            
            values.date = values.date ? values.date.format("YYYYMM") : ''; 
            api.post(`/collection/collectiontable`, values,  {            
                responseType: 'json'
            }).then((data) => {                
                if(data.data.length > 0) {
                    confirm({
                        title: '严重警告',
                        content: '要生成托收月份的水费记录已存在，重新生成将删除原有所有记录，要继续吗?',
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
                    handleError(err);                         
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
                this.setState({ loading3: true });
                values.date = values.date ? values.date.format("YYYYMM") : '';
                api.post(
                    `collection/collection/excel`,
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading3: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `水费托收情况${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading3: false                
                    });
                }
                );  
            }
        });
    }

    ArrayBufferToString (buffer, encoding) {
        if (encoding == null) encoding = 'utf8'
    
        return Buffer.from(buffer).toString(encoding)
    }

    onOffer = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {               
                values.date = values.date ? values.date.format("YYYYMM") : '';
                values.banks = this.state.targetKeys;
                if(!values.banks || values.banks.length === 0) {
                    notification.error({
                        message: '提示',
                        description: `请选择托收银行`,
                        duration: 3,
                    });  
                    return;
                }
                this.setState({ loading4: true });
                api.post(
                    `collection/collection/bank/excel`,
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading4: false                  
                        });
                        //let name = dt.headers['content-disposition'].split('=')[1];
                        //let blob = new Blob([dt.data], { type:   'application/octet-stream' } )
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `银行报盘${moment().format('YYYYMMDD')}.xlsx`
                        //link.download = name
                        link.click()
                }).catch(
                    error => {
                    let str = this.ArrayBufferToString(error.response.data)
                    let bufferToJson = JSON.parse(str);                                    
                    notification.error({
                        message: '提示',
                        description: `${bufferToJson && bufferToJson.error && bufferToJson.error.message}`,
                        duration: 3,
                    });                            
                    this.setState({
                        loading4: false                
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
        <Col span={8}>
            <Button loading={this.state.loading1} icon="search" style={{ marginTop: 4 }} onClick={this.fetchItems} >查询</Button>
            <Button loading={this.state.loading2} icon="pie-chart" style={{ marginLeft: 8 }} onClick={this.onCreation} >生成</Button>       
            <Button loading={this.state.loading3} onClick={this.onToExcel} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>
            <Button loading={this.state.loading4} onClick={this.onOffer} icon="save" style={{ marginLeft: 8 }}   >报盘</Button>
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
                <Col span={5}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('recount', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox>只显示未托收用户</Checkbox>
                        )}
                    </FormItem>                                       
                </Col> 
                <Col span={5}>
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

    handleBankChange = (targetKeys, direction, moveKeys) => {       
        this.setState({ targetKeys });
    }

    renderBankForm() {
        const {bank} = this.state;
        return <Transfer
        titles={['现有银行', '托收银行']}
        notFoundContent='无匹配结果'
        dataSource={bank}
        listStyle={{
        width: '45%',
        height: 400,
        }}
        targetKeys={this.state.targetKeys}
        onChange={this.handleBankChange}
        render={
            (item) => {
                const customLabel = (
                    <span className="custom-item">
                        {item.title} - {item.description}
                    </span>
                );
            
                return {
                    label: customLabel, // for displayed item
                    value: item.title, // for title and filter matching
                };
            }
        }
        />
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>月水费数据导出窗口</h5>
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
                <Divider></Divider>                 
                {this.renderBankForm()}
                
                
            </div>
        );
    }


}

OutputBank.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let outputBank = Form.create({})(OutputBank);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(outputBank))




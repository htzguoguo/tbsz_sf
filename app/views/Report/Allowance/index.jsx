import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, message,  
    notification, Input,
    Divider,  Row, Col, 
    Form, 
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {formItemLayout} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';

const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class Allowance extends Component {
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
                title: '编号',
                dataIndex: '编号',
                key: '编号'    
            },
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名'
            },
            {
                title: '装表地点',
                dataIndex: '装表地点',
                key: '装表地点'
            },
            {
                title: '联系人',
                dataIndex: '联系人',
                key: '联系人'              
            },
            {
                title: '电话',
                dataIndex: '电话',
                key: '电话'              
            },
            {
                title: '装表日期',
                dataIndex: '装表日期',
                key: '装表日期',                
            },
            {
                title: '交费日期',
                dataIndex: '交费日期',
                key: '交费日期'
            },
            {
                title: '贴费状态',
                dataIndex: '贴费状态',
                key: '贴费状态'
            },
            {
                title: '合计',
                dataIndex: '合计',
                key: '合计'
            } ,
            {
                title: '用水形式',
                dataIndex: '用水形式',
                key: '用水形式'
            } ,
            {
                title: '单位性质',
                dataIndex: '单位性质',
                key: '单位性质'
            } ,
            {
                title: '贴费备注',
                dataIndex: '贴费备注',
                key: '贴费备注'
            } ,
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
    }

    onQuery = (e) => {
        e.preventDefault(); 
        api.get(`/report/allowance`, {responseType : 'json'}).then((dt) => {
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
    }

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading2: true });               
                api.get(
                    `/report/allowance/excel/${values.lister}`,
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
                        link.download = `用户交纳贴费一览表${moment().format('YYYYMMDD')}.xlsx`
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
    <Col offset={14} span={5}>
        <Button  loading={this.state.loading1} icon="pie-chart" onClick={this.onQuery} style={{marginTop: 4}} >显示</Button>        
        <Button loading={this.state.loading2} icon="file-excel" onClick={this.onToExcel} style={{ marginLeft: 8 }} type="danger"   >导出</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';    
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row align="middle">
                <Col   span={5}>
                    <FormItem
                    label="制单"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            'lister',
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
                        <h5>水贴费显示窗口</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
                <Divider></Divider>
                <Table columns={this.columns}  
                    scroll={{ x: 2000 }}                   
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

Allowance.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let allowance = Form.create({})(Allowance);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(allowance))




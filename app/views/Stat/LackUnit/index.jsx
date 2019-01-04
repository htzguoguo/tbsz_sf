import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {bindActionCreators} from 'redux';
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
import {monthFormat,   formItemLayout, } from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const confirm = Modal.confirm;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
function cancel() {
    message.error('点击了取消');
}

class LackUnit extends Component {
    constructor(props){
        super(props);
        this.handleStatistics = this.handleStatistics.bind(this);
        this.onToExcel = this.onToExcel.bind(this);
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
                title: '往年欠费',
                dataIndex: '往年欠费',
                key: '往年欠费'
            },
            {
                title: '本月欠费',
                dataIndex: '本月欠费',
                key: '本月欠费'              
            },
            {
                title: '前几个月累计',
                dataIndex: '前几个月累计',
                key: '前几个月累计'              
            },
            {
                title: '小计',
                dataIndex: '小计',
                key: '小计',                
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
    } 
    
    handleStatistics = (values) => {
        api.post(`/stat/lackunit`, values).then((dt) => {
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

    onStatistics = (e) => {
        e.preventDefault(); 
        let handleStatistics = this.handleStatistics;       
        this.props.form.validateFields((err, values) => {
            this.setState({ loading1: true, loading : true });
            values.月份 = values.月份 ? values.月份.format("YYYYMM") : ''; 
            let options = values.统计选项;
            if(options.includes('1')) {
                confirm({
                    title: '警告',
                    content: '选择重新汇总,将删除原有的统计数据,确定要重新汇总吗?',
                    onOk() {
                        
                        handleStatistics(values);
                    }, 
                    onCancel() {
                        values.统计选项 = values.统计选项.filter(item => item != '1');
                        handleStatistics(values);
                    },                   
                    okText : "确认",
                    cancelText : "取消"
                });
            }else{
                this.handleStatistics(values);
            }
        });
    }

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading2: true });
                values.月份 = values.月份 ? values.月份.format("YYYYMM") : ''; 
                values.user = this.props.user.姓名;
                api.post(
                    `/stat/excel/lackunit`,
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
                        link.download = `天保市政公司欠费单位统计表${moment().format('YYYYMMDD')}.xlsx`
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
    <Col span={8}>
        <Button style={{marginTop: 4}} loading={this.state.loading1} icon="pie-chart" onClick={this.onStatistics} >统计</Button>
        {/* <Button icon="delete" style={{ marginLeft: 8 }} >删除</Button>
        <Button icon="printer" style={{ marginLeft: 8 }} type="danger"   >打印</Button> */}
        <Button icon="file-excel" onClick={this.onToExcel} loading={this.state.loading2} style={{ marginLeft: 8 }} type="danger"   >导出</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row   >              
                <Col span={8}>
                    <FormItem
                    label="月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '月份',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col   span={8}>
                    <FormItem
                    label="统计选项"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            '统计选项',
                            {initialValue : ['2']}
                        )(
                            <CheckboxGroup    options={[
                                { label: '重新汇总', value: '1' },
                                { label: '小计', value: '2' },
                            ]}  />
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
                        <h5>按欠费单位统计</h5>
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

LackUnit.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object,
};

let form = Form.create({})(LackUnit);
const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};
function mapDispatchToProps(dispatch) {
return {actions: bindActionCreators({}, dispatch)};
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(form));




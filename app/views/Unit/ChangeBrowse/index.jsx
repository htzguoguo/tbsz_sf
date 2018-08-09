import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, Icon,
    notification,
    Divider,  Row, Col, 
    Form, 
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';

const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
let _data = [];
function cancel() {
    message.error('点击了取消');
}

class ChangeBrowse extends Component {
    constructor(props){
        super(props);
        this.selectedDate = '201707';         
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
        this.columns = [
            {
                title: '过户日期',
                dataIndex: '过户日期',
                key: '过户日期',                
                sorter: (a, b) => parseInt(a.过户日期) - parseInt(b.过户日期)                 
            },
            {
                title: '老户编号',
                dataIndex: '老户编号',
                key: '老户编号',
                sorter: (a, b) => parseInt(a.老户编号) - parseInt(b.老户编号)
            },
            {
                title: '老户名',
                dataIndex: '老户名',
                key: '老户名',
                sorter: (a, b) => a.老户名.length - b.老户名.length, 
            },
            {
                title: '新户编号',
                dataIndex: '新户编号',
                key: '新户编号', 
                sorter: (a, b) => parseInt(a.新户编号) - parseInt(b.新户编号)               
            },
            {
                title: '新户名',
                dataIndex: '新户名',
                key: '新户名', 
                sorter: (a, b) => a.新户名.length - b.新户名.length,                
            },
            {
                title: '过户理由',
                dataIndex: '过户理由',
                key: '过户理由',                
            },
            {
                title: '沿用原指标',
                dataIndex: '沿用原指标',
                key: '沿用原指标',
                
            },
            {
                title: '备注',
                dataIndex: '备注',
                key: '备注',
                
            },      
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    } 

    componentDidMount() {
    }    

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            values.起始日期 = values.起始日期 ? values.起始日期.format("YYYYMM") : '';
            values.终止日期 = values.终止日期 ? values.终止日期.format("YYYYMM") : '';
            api.get(`/unit/change/${values.起始日期}/${values.终止日期}`, {            
                responseType: 'json'
            }).then((dt) => {
                let data = dt.data;             
                _data = data;
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

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                values.起始日期 = values.起始日期 ? values.起始日期.format("YYYYMM") : '';
                values.终止日期 = values.终止日期 ? values.终止日期.format("YYYYMM") : '';
                api.get(
                    `/unit/changetoexcel/${values.起始日期}/${values.终止日期}`,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `天保市政公司过户统计表${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading: false                
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
        <Button icon="search" onClick={this.onSearch} type="primary">显示</Button>
        <Button icon="reload" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
        <Button icon="save" style={{ marginLeft: 8 }} type="danger"   onClick={this.onToExcel}>导出Excel</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={8}>
                    <FormItem
                    label="起始日期" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '起始日期',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="终止日期"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            '终止日期',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker placeholder="" format={monthFormat} />
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
                        <h5>查询用水单位</h5>
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

ChangeBrowse.propTypes = {
    form: PropTypes.object,
};

let changeBrowse = Form.create({})(ChangeBrowse);
export default withRouter(changeBrowse)




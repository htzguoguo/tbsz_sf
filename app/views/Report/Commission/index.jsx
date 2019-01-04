import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, 
    notification,  Input,
    Divider,  Row, Col, Alert, 
    Form, Checkbox, Modal,
    DatePicker
} from 'antd';
import moment from 'moment';
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const confirm = Modal.confirm;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}

class Commission extends Component {
    constructor(props){
        super(props);
        this.handleStatistics = this.handleStatistics.bind(this);
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            selectedRowKeys: [],
            selectedRows:[]
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
                width : '20%',
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)     
            },
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名',
                width : '80%' , 
                sorter: (a, b) => a.户名.length - b.户名.length,
            }
        ];
        this.radioFilter = '';
        this.searchFilter = '';
        this.selectedItems = [];
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
        let date = this.props.form.getFieldValue('委托月份');
        date = date.format("YYYYMM");
        this.fetchItems(date);
    } 

    fetchItems = (date) => {
        this.setState({ loading: true });
        api.get(`/report/commission/${date}`, {            
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
    }

    onMonthChange = (date, dateString) => {
        date = date.format("YYYYMM");
        this.fetchItems(date);
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

    renderSearchButtons = () =>
    <Col span={8}>
        <Button onClick={() => {PHE.printHtml(document.getElementById('printForm').innerHTML)}} icon="printer" style={{ marginLeft: 8, marginTop: 4 }}   >打印</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={8}>
                    <FormItem
                    label="委托月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '委托月份',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col span={8}>
                    <FormItem
                    label="单据张数"  
                    {...formItemLayout}                 
                    >                        
                        {getFieldDecorator(
                            '统计选项',
                            {initialValue : '附单一张'}
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

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    cleanSelectedKeys = () => {
        this.onSelectChange([], []);
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
                            <h5>委托收款报表</h5>
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
                <div  id="printForm">
                    {
                        selectedRows.map(
                            item => <div style={{position : "relative"}} key={item.编号} className="noborder print-container paging "  >
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '60mm', top : '27mm'}}>{this.today.format('YYYY')}</span>
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '78mm', top : '27mm'}}>{this.today.format('MM')}</span> 
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '91mm', top : '27mm'}}>{this.today.format('DD')}</span>
                                        <span style={{fontSize:'11pt',position : 'absolute', left : '106mm', top : '28mm'}}>{`${item.年}年${item.月}月水费`}</span>
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '144mm', top : '27mm'}}>{item.编号}</span>
                                        <span style={{fontSize:'9pt',position : 'absolute', left : '41mm', top : '36mm'}}>{item.户名}</span>
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '41mm', top : '45mm'}}>{item.帐号}</span>  
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '41mm', top : '60mm'}}>{item.大写}</span> 
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '147mm', top : '63mm'}}>{item.小写}</span> 
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '95mm', top : '72mm'}}>{item.编号}</span>
                                        <span style={{fontSize:'12pt',position : 'absolute', left : '146mm', top : '72mm'}}>{this.props.form.getFieldValue('统计选项')}</span>                                                                   
                                    </div>
                        )
                    }                       
                </div>
        </div>         
            
        );
    }


}

Commission.propTypes = {
    form: PropTypes.object,
};

let commission = Form.create({})(Commission);
export default withRouter(commission)




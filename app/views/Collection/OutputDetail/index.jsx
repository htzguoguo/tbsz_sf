import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message, 
    Radio, 
    Divider,  Row, Col,  
    Form, Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, formItemLayout, } from '../../../utils/format';
import {handleError, } from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
function cancel() {
    message.error('点击了取消');
}

class OutputDetail extends Component {
    constructor(props){
        super(props);        
        this.state = {
            loading1: false,
            batch : [],
            bank : []
        };
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
        this.fetchBankParameters();
        let date = this.props.form.getFieldValue('date');
        date = date ? date.format("YYYYMM") : '';
        this.fetchBatchParameters(date);
    }

    fetchBatchParameters = (date) => {
        api.get(`collection/batch/${date}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            this.setState({batch : data});           
        }).catch(this.handleError); 
    }

    fetchBankParameters = () => {
        api.get(`collection/bank`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data; 
            let bank = data;
            this.setState({bank});           
        }).catch(this.handleError); 
    }

    onToExcel = (e, index, flag, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.date = values.date ? values.date.format("YYYYMM") : '';
        api.post(
            `/collection/${flag}/excel`, 
            values,
            {            
                responseType: 'arraybuffer'
            }
        ).then((dt) => {  
            obj[`loading${index}`] = false; 
            this.setState(obj);
            let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `${fileName}${moment().format('YYYYMMDD')}.xlsx`
            link.click()
        }).catch(
        err => {
            handleError(err);                         
            obj[`loading${index}`] = false; 
            this.setState(obj);
        }
        );
    }

    renderSearchButtons = () =>
    <Col span={2}>
        <Button onClick={(e) => this.onToExcel(e, 1, 'detail', '天保市政公司托收明细报表')} loading={this.state.loading1} icon="printer" style={{ marginLeft: 8, marginTop: 14 }}    >打印</Button>
    </Col>

    onMonthChange = (date, dateString) => {
        date = date ? date.format("YYYYMM") : '';
        this.fetchBatchParameters(date);
    }
    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {batch, bank} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={5}>
                    <FormItem
                    label="月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date',
                            {initialValue : this.today}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>
                <Col span={5}>
                    <FormItem label="选择银行" 
                    {...formItemLayout}                         
                    >
                    {getFieldDecorator(
                        'bank',
                        {
                            initialValue : ''
                        }
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {bank.map(d => <Option key={`${d.银行代码}${d.银行名称}`}>{d.银行代码} {d.银行名称}</Option>)}                                      
                        </Select>    
                    )}
                    </FormItem>
                </Col>
                <Col span={5}>
                    <FormItem
                            {...formItemLayout}
                            label="托收批次"
                        >
                            {getFieldDecorator(
                                'batch',
                                {
                                    initialValue : ''
                                }
                            )(
                                <Select 
                                allowClear                            
                                style={{ width: '100%' }}
                                > 
                                {batch.map(d => <Option key={d.托收批次}>{d.托收批次}</Option>)}                                       
                                </Select>
                            )}
                    </FormItem>           
                </Col> 
                <Col span={7}>
                <FormItem
                    wrapperCol={24}
                    >                        
                        {getFieldDecorator(
                            'kind',
                            {initialValue : '1'}
                        )(
                            <RadioGroup>
                                <Radio value='1'>全部</Radio>
                                <Radio value='2'>托收成功</Radio>
                                <Radio value='3'>托收失败</Radio>
                            </RadioGroup>
                        )}              
                    </FormItem>    
                </Col>                      
                {this.renderSearchButtons(false)}
            </Row>
        </Form>
        );
    }
    render() {
        const { loading} = this.state;
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>托收明细打印设置</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                </div>
        </div>
        );
    }


}

OutputDetail.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let outputDetail = Form.create({})(OutputDetail);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(outputDetail))




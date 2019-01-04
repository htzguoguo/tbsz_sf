import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message,
    notification, Radio, 
    Divider,  Row, Col, 
    Form ,Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, ArrayBufferToString,  formItemLayout, } from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class RsOutputBank extends Component {
    constructor(props){
        super(props);        
        this.state = {
            loading1: false,
            loading2: false,
            batch : []
        };
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
        let date = this.props.form.getFieldValue('date');
        date = date ? date.format("YYYYMM") : '';
        this.fetchParameters(date);
    }

    fetchParameters = (date) => {
        api.get(`collection/batch/${date}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            this.setState({batch : data});           
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
            error => {
            let str = ArrayBufferToString(error.response.data)
                    let bufferToJson = JSON.parse(str);
                    notification.error({
                        message: '提示',
                        description: `${bufferToJson && bufferToJson.error && bufferToJson.error.message}`,
                        duration: 3,
                    });                                       
            obj[`loading${index}`] = false; 
            this.setState(obj);
        }
        );
    }
    onMonthChange = (date, dateString) => {
        date = date ? date.format("YYYYMM") : '';
        this.fetchParameters(date);
    }
    renderSearchButtons = () =>
    <Col offset={8} span={5}>
        <Button onClick={(e) => this.onToExcel(e, 1, 'xinfeng', '天津市票据交换提出信件')} loading={this.state.loading1} icon="bars" style={{ marginLeft: 8, marginTop: 14 }}    >信封</Button>
        <Button onClick={(e) => this.onToExcel(e, 2, 'xinfenghuizong', '天津市票据交换提出信件清单')} loading={this.state.loading2} icon="switcher" style={{ marginLeft: 8, marginTop: 14  }}    >清单</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {batch} = this.state;
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
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col span={6}>
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
                            <h5>提交银行托收明细打印</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                </div>
        </div>
        );
    }


}

RsOutputBank.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let rsOutputBank = Form.create({})(RsOutputBank);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(rsOutputBank))




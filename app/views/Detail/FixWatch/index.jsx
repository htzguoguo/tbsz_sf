import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message,  
    Radio, Input,
    Divider,  Row, Col, 
    Form, Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}

class FixWatch extends Component {
    constructor(props){
        super(props);        
        this.state = {
            loading1: false,
            loading2: false,
            data : []
        };
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
    }

    fetchItems = (obj) => {
        this.setState({
            loading1: true,            
        });
        api.post(`/detail/fixwatch`, obj).then((dt) => {
            let data = dt.data;
            this.setState({
                loading1: false,
                data: data
            });
            // notification.success({
            //     message: '提示',
            //     description: `成功获取${data.length}条记录`,
            //     duration: 3,
            // });
        }).catch(
            err => {
                // handleError(err);                         
                this.setState({
                    loading1: false,
                    data: [],
                });
                // notification.success({
                //     message: '提示',
                //     description: `没有满足条件的记录,请重试。`,
                //     duration: 3,
                // });
            }
        );
    }

    onQuery = (e) => {
        e.preventDefault(); 
        let values = this.props.form.getFieldsValue();
        values.date1 = values.date1 ? values.date1.format("YYYYMM") : '';    
        values.date2 = values.date2 ? values.date2.format("YYYYMM") : '';
        values.kind =  values.kind && values.kind.length > 0 ? values.kind : '无';
        this.fetchItems(values);
    }

    renderSearchButtons = () =>
    <Col span={4}>
        <Button style={{ marginTop: 14 }} loading={this.state.loading1} icon="pie-chart" onClick={this.onQuery} >显示</Button> 
        <Button   onClick={() => {PHE.printHtml(document.getElementById('printForm').innerHTML)}} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>       
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  align="middle" >              
                <Col span={5}>
                    <FormItem
                    label="起始" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date1',
                            {initialValue : moment(`${this.today.year()}-1`, monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>
                <Col span={5}>
                    <FormItem
                    label="终止" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date2',
                            {initialValue : moment(`${this.today.year()}-${this.today.month() + 1}`, monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>  
                <Col span={5}>
                    <FormItem
                            {...formItemLayout}
                            label="编号"
                        >

                            <Col span={11}>
                                {getFieldDecorator(
                                    'num1',
                                    {initialValue : '0001'}
                                )(
                                    <Input   />
                                )}
                            </Col>
                            <Col span={2}>
                                <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                                -
                                </span>
                            </Col>
                            <Col span={11}>
                                {getFieldDecorator(
                                    'num2',
                                    {initialValue : '2999'}
                                )(
                                    <Input   />
                                )}
                            </Col>
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

    renderSimpleDisplayForm() {
        let obj = this.props.form.getFieldsValue();
        let {data} = this.state;
        let sum = {
            count : 0,
            fee : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += item.装表费;
                return cur;
            },
            sum
        )
        return (
            <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container paging "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '74mm', top : '13mm'}}>装&nbsp;表&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>                
                <span style={{fontSize:'12pt',position : 'absolute', left : '24mm', top : '24mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '153mm', top : '24mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <table style={{position : 'absolute', left : '16mm', top : '32mm'}} className="printtable printtable-border1   page-7">                   
                    <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "75mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>用水地点</td>
                        <td style={{width : "20mm",textAlign: 'center'}}>装表费</td>
                        <td style={{width : "21mm",textAlign: 'center'}} >用水日期</td> 
                        <td style={{width : "22mm",textAlign: 'center'}} >装表日期</td>                          
                    </tr>
                    {
                        data.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "75mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.用水地点}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}}>{item.装表费}</td>
                                    <td style={{width : "21mm",textAlign: 'center'}} >{item.用水日期}</td> 
                                    <td style={{width : "22mm",textAlign: 'center'}} >{item.装表日期}</td>                          
                                </tr>
                            )
                        )
                    }
                    <tr>
                        <td colSpan={2} style={{width : "62mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td colSpan={2} style={{width : "49mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td colSpan={2} style={{width : "41mm",textAlign: 'center'}}>{sum.fee}</td>                       
                        <td style={{width : "22mm",textAlign: 'center'}} ></td>                        
                    </tr>
                </table>                 
            </div> 
        );
    }

    renderSimplePrintForm() {
        const chunk = 23;
        let obj = this.props.form.getFieldsValue();
        let {data} = this.state;
        let sum = {
            count : 0,
            fee : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += item.装表费;
                return cur;
            },
            sum
        )         
        let printFirstLoop = (items, sum, i) => 
        <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container paging"  >
            <span style={{fontSize:'16pt',  position : 'absolute', left : '74mm', top : '13mm'}}>装&nbsp;表&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>                
            <span style={{fontSize:'12pt',position : 'absolute', left : '24mm', top : '24mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>
            <span style={{fontSize:'12pt',position : 'absolute', left : '130mm', top : '24mm'}}>{i}</span>                                        
            <span style={{fontSize:'12pt',position : 'absolute', left : '153mm', top : '24mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
            <table style={{position : 'absolute', left : '16mm', top : '32mm'}} className="printtable printtable-border1   page-7">                   
                <tr>
                <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                <td colSpan={2} style={{width : "75mm",textAlign: 'center'}}>户名</td>
                <td style={{width : "23mm",textAlign: 'center'}}>用水地点</td>
                <td style={{width : "20mm",textAlign: 'center'}}>装表费</td>
                <td style={{width : "21mm",textAlign: 'center'}} >用水日期</td> 
                <td style={{width : "22mm",textAlign: 'center'}} >装表日期</td>                          
            </tr>
            {
                items.map(
                    (item, i) => (
                        <tr key={'item-' + i.toString()}>
                            <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                            <td colSpan={2} style={{width : "75mm",textAlign: 'center'}}>{item.户名}</td>
                            <td style={{width : "23mm",textAlign: 'center'}}>{item.用水地点}</td>
                            <td style={{width : "20mm",textAlign: 'center'}}>{item.装表费}</td>
                            <td style={{width : "21mm",textAlign: 'center'}} >{item.用水日期}</td> 
                            <td style={{width : "22mm",textAlign: 'center'}} >{item.装表日期}</td>                          
                        </tr>
                    )
                )
            }
            {
                sum ? <tr>
                <td colSpan={2} style={{width : "62mm",height : "10mm",textAlign: 'left'}}>合计</td>
                <td colSpan={2} style={{width : "49mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                <td colSpan={2} style={{width : "41mm",textAlign: 'center'}}>{sum.fee}</td>                       
                <td style={{width : "22mm",textAlign: 'center'}} ></td>                        
                </tr> : ''
            }
        </table>                 
    </div> 

        let print = () => {
            let result = [];
            let index = 1;
            for (let i=0,j=data.length; i<j; i+=chunk) {
                let temparray = data.slice(i,i+chunk);
                if(temparray.length === chunk) {
                    result.push(printFirstLoop(temparray, null, index++));
                }else {
                    result.push(printFirstLoop(temparray, sum, index++));
                }
            }
            return result;
        }
        
        return print();
    }

    render() {
        const { loading} = this.state;
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>装表费打印设置</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <div  id="printForm1">
                        {this.renderSimpleDisplayForm()}
                    </div>
                    <div  id="printForm">
                        {this.renderSimplePrintForm()}
                    </div>
                </div>
        </div>
        );
    }
}

FixWatch.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let fixWatch = Form.create({})(FixWatch);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(fixWatch))




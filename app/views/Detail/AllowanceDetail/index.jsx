import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message, 
     Radio, Input,
    Divider,  Row, Col, 
    Form, Checkbox, Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";

import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}

const ProjectKind = {
    无 : '全部单位',
    收 : '已收水贴费单位',
    免 : '免水贴费单位',
    欠 : '欠水贴费单位',
    管 : '交管委会单位'
}

class AllowanceDetail extends Component {
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

    onToExcel = (e, index, flag, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.date1 = values.date1 ? values.date1.format("YYYYMM") : '';    
        values.date2 = values.date2 ? values.date2.format("YYYYMM") : '';
        values.kind =  values.kind && values.kind.length > 0 ? values.kind : '无';
        if(!values.num1 || values.num1.length !== 4 || !isFinite(values.num1)) {
            showNotification('error', '输入的起始编号不正确，请重新输入！')
            this.props.form.validateFieldsAndScroll(['num1']);
            return;
        }
        if(!values.num2 || values.num2.length !== 4 || !isFinite(values.num2)) {
            showNotification('error', '输入的终止编号不正确，请重新输入！')
            this.props.form.validateFieldsAndScroll(['num2']);
            return;
        }

        api.post(
            `/detail/${flag}/excel`, 
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

    fetchItems = (obj) => {
        this.setState({
            loading1: true,            
        });
        api.post(`/detail/allowance`, obj).then((dt) => {
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
    <Col style={{paddingLeft : '0px'}} offset={17}  span={6}>
        <Button loading={this.state.loading1} icon="pie-chart" onClick={this.onQuery} >显示</Button> 
        <Button   onClick={() => {PHE.printHtml(document.getElementById('printForm').innerHTML)}} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>
        <Button loading={this.state.loading2}   onClick={(e) => this.onToExcel(e, 2, 'allowance', '市政公司水贴费明细表')}  icon="file-excel" style={{ marginLeft: 8 }}    >导出</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row   align="middle">              
                <Col span={4}>
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
                <Col span={4}>
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
                <Col span={4}>
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
                <Col span={4}>
                    <FormItem
                            {...formItemLayout}
                            label="项目"
                        >
                            {getFieldDecorator(
                                'kind'
                            )(
                                <Select 
                                allowClear                               
                                style={{ width: '100%' }}
                                > 
                                    <Option value="收">收</Option>
                                    <Option value="免">免</Option>
                                    <Option value="欠">欠</Option>
                                    <Option value="管">管</Option>
                                </Select>
                            )}
                    </FormItem>           
                </Col>
                <Col span={4}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('cbadd', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox>包括增容费</Checkbox>
                        )}
                    </FormItem>                                       
                </Col> 
                <Col span={4}>
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
                cur.fee += item.水贴费;
                return cur;
            },
            sum
        ) 
        obj.kind = obj.kind && obj.kind.length > 0 ? ProjectKind[obj.kind] : '全部单位';
        return (
            <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container paging "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '71mm', top : '13mm'}}>水&nbsp;贴&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>
                <span style={{fontSize:'12pt',position : 'absolute', left : '26mm', top : '25mm'}}>{obj.kind}</span> 
                <span style={{fontSize:'12pt',position : 'absolute', left : '88mm', top : '25mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '154mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <table style={{position : 'absolute', left : '20mm', top : '32mm'}} className="printtable printtable-border1   page-7">                   
                {/* <thead> */}
                    <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "27mm",textAlign: 'center'}}>交费日期</td>
                        <td style={{width : "31mm",textAlign: 'center'}}>水贴费</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >备注</td>                        
                    </tr>
                {/* </thead>    */}
                    {
                        data.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "27mm",textAlign: 'center'}}>{item.交费日期}</td>
                                    <td style={{width : "31mm",textAlign: 'center'}}>{item.水贴费}</td>
                                    <td style={{width : "24mm",textAlign: 'center'}} >{item.贴费状态}</td>                        
                                </tr>
                            )
                        )
                    }
                    <tr>
                        <td colSpan={2} style={{width : "62mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td colSpan={2} style={{width : "57mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td style={{width : "31mm",textAlign: 'center'}}>{sum.fee}</td>                       
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>                        
                    </tr>
                </table>                 
            </div> 
        );
    }

    renderComplexDisplayForm(items) {
        let obj = this.props.form.getFieldsValue();
        let {data} = this.state;
        let sum = {
            count : 0,
            fee : 0,
            add1 : 0,
            add2 : 0,
            sum : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += item.水贴费;
                cur.add1 += item.增容费1;
                cur.add2 += item.增容费2;
                cur.sum += item.合计;
                return cur;
            },
            sum
        ) 
        obj.kind = obj.kind && obj.kind.length > 0 ? ProjectKind[obj.kind] : '全部单位';
        return (
            <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container-h paging "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '124mm', top : '13mm'}}>水&nbsp;贴&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>
                <span style={{fontSize:'12pt',position : 'absolute', left : '45mm', top : '25mm'}}>{obj.kind}</span> 
                <span style={{fontSize:'12pt',position : 'absolute', left : '132mm', top : '25mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '223mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <table style={{position : 'absolute', left : '33mm', top : '33mm'}} className="printtable printtable-border1   page-7-h">                   
                    {/* <thead> */}
                        <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>水贴费</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>交费日期</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期1</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>增容费1</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期2</td>
                        <td style={{width : "20mm",textAlign: 'center'}}>增容费2</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>合计</td>                                              
                    </tr>
                    {/* </thead>                     */}
                    {
                        data.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.水贴费}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.交费日期}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期1}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.增容费1}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期2}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}}>{item.增容费2}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.合计}</td>     
                                </tr>
                            )
                        )
                    }
                    <tr>
                        <td colSpan={2} style={{width : "49mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td style={{width : "43mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>水贴费&nbsp;&nbsp;{sum.fee}</td>
                        <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>增容费1&nbsp;&nbsp;{sum.add1}</td>
                        <td colSpan={2} style={{width : "38mm",textAlign: 'center'}}>增容费2&nbsp;&nbsp;{sum.add2}</td>                       
                        <td style={{width : "30mm",textAlign: 'center'}} >{sum.sum}</td>                        
                    </tr>
                </table>                 
            </div> 
        );
    }

    renderDisplayForm = () => {
        let obj = this.props.form.getFieldsValue();
        if(obj.cbadd) {
            return this.renderComplexDisplayForm();
        }else {
            return this.renderSimpleDisplayForm();
        }
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
                cur.fee += item.水贴费;
                return cur;
            },
            sum
        ) 
        obj.kind = obj.kind && obj.kind.length > 0 ? ProjectKind[obj.kind] : '全部单位';
        let printFirstLoop = (items, sum) => 
        <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '71mm', top : '13mm'}}>水&nbsp;贴&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>
                <span style={{fontSize:'12pt',position : 'absolute', left : '26mm', top : '25mm'}}>{obj.kind}</span> 
                <span style={{fontSize:'12pt',position : 'absolute', left : '88mm', top : '25mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '154mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                

                <table style={{position : 'absolute', left : '20mm', top : '32mm'}} className="printtable printtable-border1   page-7">                   
                
                    <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "27mm",textAlign: 'center'}}>交费日期</td>
                        <td style={{width : "31mm",textAlign: 'center'}}>水贴费</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >备注</td>                        
                    </tr>
                    {
                        items.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "27mm",textAlign: 'center'}}>{item.交费日期}</td>
                                    <td style={{width : "31mm",textAlign: 'center'}}>{item.水贴费}</td>
                                    <td style={{width : "24mm",textAlign: 'center'}} >{item.贴费状态}</td>                        
                                </tr>
                            )
                        )
                    }
                    {
                        sum ? (<tr>
                        <td colSpan={2} style={{width : "62mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td colSpan={2} style={{width : "57mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td style={{width : "31mm",textAlign: 'center'}}>{sum.fee}</td>                       
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>                        
                        </tr>) : ''
                    }
                </table>                 
            </div>

        let printRestLoop = (items, sum) => 
        <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container  "  >
        
        <table style={{position : 'absolute', left : '20mm', top : '10mm'}} className="printtable printtable-border1   page-7">                  
        
            <tr>
                <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>户名</td>
                <td style={{width : "27mm",textAlign: 'center'}}>交费日期</td>
                <td style={{width : "31mm",textAlign: 'center'}}>水贴费</td>
                <td style={{width : "24mm",textAlign: 'center'}} >备注</td>                        
            </tr>
            {
                items.map(
                    (item, i) => (
                        <tr key={'item-' + i.toString()}>
                            <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                            <td colSpan={2} style={{width : "78mm",textAlign: 'center'}}>{item.户名}</td>
                            <td style={{width : "27mm",textAlign: 'center'}}>{item.交费日期}</td>
                            <td style={{width : "31mm",textAlign: 'center'}}>{item.水贴费}</td>
                            <td style={{width : "24mm",textAlign: 'center'}} >{item.贴费状态}</td>                        
                        </tr>
                    )
                )
            }
            {
                sum ? (<tr>
                <td colSpan={2} style={{width : "62mm",height : "10mm",textAlign: 'left'}}>合计</td>
                <td colSpan={2} style={{width : "57mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                <td style={{width : "31mm",textAlign: 'center'}}>{sum.fee}</td>                       
                <td style={{width : "24mm",textAlign: 'center'}} ></td>                        
                </tr>) : ''
            }
        </table>                 
    </div>    

        let print = () => {
            let result = [];
            for (let i=0,j=data.length; i<j; i+=chunk) {
                let temparray = data.slice(i,i+chunk);
                if(i === 0) {
                    if(temparray.length === chunk) {
                        result.push(printFirstLoop(temparray, null));
                    }else {
                        result.push(printFirstLoop(temparray, sum));
                    }
                }else {
                    if(temparray.length === chunk) {
                        result.push(printFirstLoop(temparray, null));
                    }else {
                        result.push(printFirstLoop(temparray, sum));
                    }
                }
                // do whatever
            }
            return result;
        }
        
        return print();
    }

    renderComplexPrintForm(items) {
        const chunk = 14;
        let obj = this.props.form.getFieldsValue();
        let {data} = this.state;
        let sum = {
            count : 0,
            fee : 0,
            add1 : 0,
            add2 : 0,
            sum : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += item.水贴费;
                cur.add1 += item.增容费1;
                cur.add2 += item.增容费2;
                cur.sum += item.合计;
                return cur;
            },
            sum
        ) 
        obj.kind = obj.kind && obj.kind.length > 0 ? ProjectKind[obj.kind] : '全部单位';
        let printFirstLoop = (items, sum) => 
        <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container-h  "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '124mm', top : '13mm'}}>水&nbsp;贴&nbsp;费&nbsp;明&nbsp;细&nbsp;表</span>
                <span style={{fontSize:'12pt',position : 'absolute', left : '45mm', top : '25mm'}}>{obj.kind}</span> 
                <span style={{fontSize:'12pt',position : 'absolute', left : '132mm', top : '25mm'}}>{obj.date1.format('YYYY.MM')}-{obj.date2.format('YYYY.MM')}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '223mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <table style={{position : 'absolute', left : '33mm', top : '33mm'}} className="printtable printtable-border1   page-7-h">                   
                    {/* <thead> */}
                        <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>水贴费</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>交费日期</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期1</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>增容费1</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期2</td>
                        <td style={{width : "20mm",textAlign: 'center'}}>增容费2</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>合计</td>                                              
                    </tr>
                    {/* </thead>                     */}
                    {
                        items.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.水贴费}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.交费日期}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期1}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.增容费1}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期2}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}}>{item.增容费2}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.合计}</td>     
                                </tr>
                            )
                        )
                    }
                    {
                sum ? (
                    <tr>
                    <td colSpan={2} style={{width : "49mm",height : "10mm",textAlign: 'left'}}>合计</td>
                    <td style={{width : "43mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                    <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>水贴费&nbsp;&nbsp;{sum.fee}</td>
                    <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>增容费1&nbsp;&nbsp;{sum.add1}</td>
                    <td colSpan={2} style={{width : "38mm",textAlign: 'center'}}>增容费2&nbsp;&nbsp;{sum.add2}</td>                       
                    <td style={{width : "30mm",textAlign: 'center'}} >{sum.sum}</td>                        
                    </tr>
                ) : ''
            }
                </table>                 
            </div> 

            let printRestLoop = (items, sum) => 
            <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container-h  "  >
                    <table style={{position : 'absolute', left : '33mm', top : '10mm'}} className="printtable printtable-border1   page-7-h">                   
                    {/* <thead> */}
                        <tr>
                        <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>水贴费</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>交费日期</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期1</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>增容费1</td>
                        <td style={{width : "23mm",textAlign: 'center'}}>增容日期2</td>
                        <td style={{width : "20mm",textAlign: 'center'}}>增容费2</td>
                        <td style={{width : "19mm",textAlign: 'center'}}>合计</td>                                              
                    </tr>
                    {/* </thead>                     */}
                    {
                        items.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "13mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "73mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.水贴费}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.交费日期}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期1}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.增容费1}</td>
                                    <td style={{width : "23mm",textAlign: 'center'}}>{item.增容日期2}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}}>{item.增容费2}</td>
                                    <td style={{width : "19mm",textAlign: 'center'}}>{item.合计}</td>     
                                </tr>
                            )
                        )
                    }
                    {
                sum ? (
                    <tr>
                    <td colSpan={2} style={{width : "49mm",height : "10mm",textAlign: 'left'}}>合计</td>
                    <td style={{width : "43mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                    <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>水贴费&nbsp;&nbsp;{sum.fee}</td>
                    <td colSpan={2} style={{width : "39mm",textAlign: 'center'}}>增容费1&nbsp;&nbsp;{sum.add1}</td>
                    <td colSpan={2} style={{width : "38mm",textAlign: 'center'}}>增容费2&nbsp;&nbsp;{sum.add2}</td>                       
                    <td style={{width : "30mm",textAlign: 'center'}} >{sum.sum}</td>                        
                    </tr>
                ) : ''
            }
                </table>                 
            </div>    

        let print = () => {
            let result = [];
            for (let i=0,j=data.length; i<j; i+=chunk) {
                let temparray = data.slice(i,i+chunk);
                if(i === 0) {
                    if(temparray.length === chunk) {
                        result.push(printFirstLoop(temparray, null));
                    }else {
                        result.push(printFirstLoop(temparray, sum));
                    }
                }else {
                    if(temparray.length === chunk) {
                        result.push(printFirstLoop(temparray, null));
                    }else {
                        result.push(printFirstLoop(temparray, sum));
                    }
                }
                // do whatever
            }
            return result;
        }
        return print();
    }

    renderPrintForm = () => {
        let obj = this.props.form.getFieldsValue();
        if(obj.cbadd) {
            return this.renderComplexPrintForm();
        }else {
            return this.renderSimplePrintForm();
        }
    }

    render() {
        const { loading} = this.state;
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>水费贴费打印设置</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <div  id="printForm1">
                        {this.renderDisplayForm()}
                    </div>
                    <div  id="printForm">
                        {this.renderPrintForm()}
                    </div>
                </div>
        </div>
        );
    }
}

AllowanceDetail.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let allowDetail = Form.create({})(AllowanceDetail);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(allowDetail))




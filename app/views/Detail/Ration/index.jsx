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
import {formItemLayout} from '../../../utils/format';


import print from '../../../assets/css/print.less';
import styles from './index.less';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
function cancel() {
    message.error('点击了取消');
}

class Ration extends Component {
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
        api.post(`/detail/ration`, obj).then((dt) => {
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
        this.fetchItems(values);
    }

    renderSearchButtons = () =>
    <Col span={5}>
        <Button style={{ marginTop: 4 }} loading={this.state.loading1} icon="pie-chart" onClick={this.onQuery} >显示</Button> 
        <Button   onClick={() => {PHE.printHtml(document.getElementById('printForm').innerHTML)}} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>       
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >
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
                    wrapperCol={24}
                    >                        
                        {getFieldDecorator(
                            'kind',
                            {initialValue : '1'}
                        )(
                            <RadioGroup>
                                <Radio value='1'>按总量</Radio>
                                <Radio value='2'>按天</Radio>
                            </RadioGroup>
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

    renderSimpleDisplayForm() {
        let obj = this.props.form.getFieldsValue();
        let isWhole = obj.kind === '1'
        let {data} = this.state;
        let sum = {
            count : 0,
            fee : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += isWhole ? item.申请水量 :  item.定额;
                return cur;
            },
            sum
        )
        return (
            <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container paging "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '66mm', top : '13mm'}}>保税区各单位用水指标明细表</span>                
                <span style={{fontSize:'12pt',position : 'absolute', left : '19mm', top : '25mm'}}>{isWhole ? '按总指标' :  '按天'}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '147mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <table style={{position : 'absolute', left : '12mm', top : '32mm'}} className="printtable printtable-border1   page-4">                   
                    <tr>
                        <td style={{width : "12mm",height : "13mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "81mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "27mm",textAlign: 'center'}}>用水指标<br/>{isWhole ? '(吨/年)' :  '(吨/天)'}</td>
                        <td style={{width : "46mm",textAlign: 'center'}}>起止日期</td>
                        <td style={{width : "20mm",textAlign: 'center'}} >备注</td>
                    </tr>
                    {
                        data.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "12mm",height : "7mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "81mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "27mm",textAlign: 'center'}}>{isWhole ? item.申请水量 : item.定额}</td>
                                    <td style={{width : "46mm",textAlign: 'center'}}>{item.起止日期}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}} ></td>                         
                                </tr>
                            )
                        )
                    }
                    <tr>
                        <td colSpan={2} style={{width : "49mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td  style={{width : "43mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td  style={{width : "27mm",textAlign: 'center'}}>{sum.fee.toFixed(2)}</td>                       
                        <td colSpan={2} style={{width : "66mm",textAlign: 'center'}} ></td>                        
                    </tr>
                </table>                 
            </div> 
        );
    }

    renderSimplePrintForm() {
        const chunk = 23;
        let obj = this.props.form.getFieldsValue();
        let {data} = this.state;
        let isWhole = obj.kind === '1';         
        let sum = {
            count : 0,
            fee : 0
        };
        data.reduce(
            (cur, item) => {
                cur.count++;
                cur.fee += isWhole ? item.申请水量 :  item.定额;
                return cur;
            },
            sum
        )  
        let printFirstLoop = (items, sum, i) =>
        <div style={{position : "relative"}} key={'ptallowancedetail'} className="noborder print-container paging "  >
                <span style={{fontSize:'16pt',  position : 'absolute', left : '66mm', top : '13mm'}}>保税区各单位用水指标明细表</span>                
                <span style={{fontSize:'12pt',position : 'absolute', left : '19mm', top : '25mm'}}>{isWhole ? '按总指标' :  '按天'}</span>                                       
                <span style={{fontSize:'12pt',position : 'absolute', left : '147mm', top : '25mm'}}>{this.today.format('YYYY-MM-DD')}</span>                
                <span style={{fontSize:'12pt',position : 'absolute', left : '175mm', top : '25mm'}}>第{i}页</span>
                <table style={{position : 'absolute', left : '12mm', top : '32mm'}} className="printtable printtable-border1   page-4">                   
                    <tr>
                        <td style={{width : "12mm",height : "13mm",textAlign: 'center'}}>编号</td>
                        <td colSpan={2} style={{width : "80mm",textAlign: 'center'}}>户名</td>
                        <td style={{width : "27mm",textAlign: 'center'}}>用水指标<br/>{isWhole ? '(吨/年)' :  '(吨/天)'}</td>
                        <td style={{width : "46mm",textAlign: 'center'}}>起止日期</td>
                        <td style={{width : "20mm",textAlign: 'center'}} >备注</td>
                    </tr>
                    {
                        items.map(
                            (item, i) => (
                                <tr key={'item-' + i.toString()}>
                                    <td style={{width : "12mm",height : "10mm",textAlign: 'center'}}>{item.编号}</td>
                                    <td colSpan={2} style={{width : "80mm",textAlign: 'center'}}>{item.户名}</td>
                                    <td style={{width : "27mm",textAlign: 'center'}}>{isWhole ? item.申请水量 : item.定额}</td>
                                    <td style={{width : "46mm",textAlign: 'center'}}>{item.起止日期}</td>
                                    <td style={{width : "20mm",textAlign: 'center'}} ></td>                          
                                </tr>
                            )
                        )
                    }
                    {
                        sum ? <tr>
                        <td colSpan={2} style={{width : "49mm",height : "10mm",textAlign: 'left'}}>合计</td>
                        <td  style={{width : "43mm",textAlign: 'center'}}>共{sum.count}个单位</td>
                        <td  style={{width : "27mm",textAlign: 'center'}}>{sum.fee.toFixed(2)}</td>                       
                        <td colSpan={2} style={{width : "66mm",textAlign: 'center'}} ></td>                        
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
                            <h5>用水指标打印设置</h5>
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

Ration.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let ration = Form.create({})(Ration);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(ration))




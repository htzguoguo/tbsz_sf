import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Spin, Button, message, Icon,
    Steps, 
    Divider, Row, Col,
    Card, Form, Modal,
    DatePicker,  InputNumber, Checkbox
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError, showNotification} from "../../../utils/notification";
import {monthFormat, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import styles from './index.less';
const { MonthPicker } = DatePicker;
const Step = Steps.Step;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const dateFormat = 'YYYY-MM-DD';
const gridStyle = {
    width: '25%',
    textAlign: 'center',
};
const initStepsStatus = () => [
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
    {status : 'wait', title : '-'},
];


class StatToll extends Component {
    constructor(props){
        super(props);
        this.onStat = this.onStat.bind(this);
        this.handleStatContinue = this.handleStatContinue.bind(this);
        this.today = new Date();
        this.state = {
            steps : initStepsStatus(),
            isTableShow : false,
            loading : false,
            loading1 : false,
            loading2 : false,
            loading3 : false,
            loading4 : false,
            loading5 : false,
            loading6 : false,
            loading7 : false,
            loading8 : false,
            loading9 : false,
        };
    }

    componentDidMount() {
        let date = this.props.form.getFieldValue('用水日期');
        date = date ? date.format("YYYYMM") : '';
        this.fetchStatTollStatus(date);
    }  
    
    fetchStatTollStatus = (date) => {
        api.get(`stat/toll/${date}`, {            
            responseType: 'json'
        }).then((data) => {
            let items = data.data;
            this.handAfterStat(items);
           
        }).catch((ex) => {
            handleError(ex);
        });
    }

    async handleStat(data) {
        let result = await api.get(`stat/toll/${data.用水日期}`, {            
            responseType: 'json'
        })
        let items = result.data;
        let handleStatContinue = this.handleStatContinue; 
        if(items && items.length > 0) {
            confirm({
                title: '严重警告',
                content: '当月统计数据已经存在，重新生成将删除原有所有记录，要继续吗?',
                onOk() {
                    handleStatContinue(data); 
                }, 
                onCancel() {
                    message.info('选择不删除原有数据,创建中止!');
                },                   
                okText : "确认",
                cancelText : "取消"
            });
        }else {
            handleStatContinue(data); 
        }
    }

    handAfterStat(items) {
        let isTableShow = false;
        let stepsStatus = initStepsStatus();
        if(items && items.length > 0) {
            let item = items[0];
            stepsStatus[0].status = 'finish';
            let mark = parseInt(item.统计标志);
            if(mark >= 3) {
                stepsStatus[1].status = 'finish';
            } 
            if(mark >= 4) {
                stepsStatus[2].status = 'finish';
            }
            if(mark >= 5) {
                stepsStatus[3].status = 'finish';
            }
            if(mark >= 6) {
                stepsStatus[4].status = 'finish';
            }
            if(mark >= 8) {
                stepsStatus[5].status = 'finish';
            }
            if(mark >= 9) {
                stepsStatus[6].status = 'finish';
            }
            if(mark >= 9) {
                isTableShow = true;
            } 
            convertPropertiesToMoment(item, ['购水日期1', '购水日期2'], dateFormat)
            this.props.form.setFieldsValue(item); 
            this.setState({
            steps : stepsStatus,
            isTableShow,
            loading: false
            });    
        }else {
            this.props.form.resetFields(
                ['购水日期1', '购水量1', '购水单价1', '购水费1', '购水日期2', '购水量2', '购水单价2', '购水费2',]
            );
            this.setState({
            steps : stepsStatus,
            isTableShow,
            loading: false
            });  
        }
    }

    async handleStatContinue(data) {
        api.post(`stat/toll`, data).then((data) => {
            let items = data.data;
            showNotification('success', `统计完毕!`)
            this.handAfterStat(items);
        }).catch((ex) => {
            this.setState({
                loading: false
                }); 
            handleError(ex);
        });
    }

    async onStat(e) {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        this.setState({ loading: true });
        values.用水日期 = values.用水日期 ? values.用水日期.format("YYYYMM") : '';
        values.购水日期1 = values.购水日期1 ? values.购水日期1.format("YYYYMMDD") : '';
        values.购水日期2 = values.购水日期2 ? values.购水日期2.format("YYYYMMDD") : '';
        try {
            this.handleStat(values);
        }catch(ex) {
            handleError(ex);  
        }
    }

    onToExcel = (e, index, flag, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue(['用水日期']);
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.用水日期 = values.用水日期 ? values.用水日期.format("YYYYMM") : '';       
        values.user = this.props.user.truename;
        api.post(
            `stat/excel/${flag}`, 
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

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {steps, isTableShow, loading1, 
            loading2, loading3, loading4, loading5,
            loading6, loading7, loading8, loading9} = this.state;         
        return (
        <Form id="stattoll" layout="horizontal" form={this.props.form}>
            <Divider orientation="left">1.确定统计水费月份</Divider>
            <Row>
                <Col span={6}>
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator(
                        '用水日期',
                        {initialValue : moment(this.today, monthFormat)}
                    )(
                    <MonthPicker onChange={(date, dateString) => {
                        date = date ? date.format("YYYYMM") : '';
                        this.fetchStatTollStatus(date);
                    }} style={{width : '95%'}} format={monthFormat}/>
                    )}
                    </FormItem> 
                </Col>
                <Col span={6}>
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator(
                        '简报',
                        {                                  
                            initialValue : true,
                            valuePropName: 'checked'
                        }
                    )(
                        <Checkbox>生成生产简报</Checkbox>
                    )}
                    </FormItem> 
                </Col>
                <Col span={3} offset={8}>
                    <Button loading={this.state.loading} style={{marginTop : "-5px"}} size="large" icon="search" onClick={this.onStat} type="primary">统计</Button>
                </Col>
            </Row>
            <Divider orientation="left">2.录入购水情况</Divider>
            <Row gutter={24}>
                    <Col span={12}>
                        <Divider orientation="left">塘沽</Divider>
                        <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水日期"
                                    >
                                        {getFieldDecorator(
                                            '购水日期1',
                                            {initialValue : moment(`${this.today.getFullYear()}-${this.today.getMonth() + 1}-22`, dateFormat)}
                                        )(
                                            <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                        )}
                                </FormItem>           
                            </Col>
                            <Col span={12}>
                            <FormItem
                                    {...formItemLayout}
                                    label="购水量"
                                    
                                >
                                    {getFieldDecorator(
                                        '购水量1',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber                                                                             
                                        min={0}
                                        onChange={
                                            value => {
                                                let d1 = this.props.form.getFieldValue('购水单价1');
                                                this.props.form.setFieldsValue({
                                                    购水费1 : value * d1
                                                });
                                            }
                                        }
                                        precision={2} 
                                        style={{ width: '100%' }} 
                                        addonAfter="吨"                                  
                                    />
                                    )}
                            </FormItem>     
                            </Col>
                            <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水单价"
                                        
                                    >
                                        {getFieldDecorator(
                                            '购水单价1',
                                            {                               
                                                initialValue : '0'
                                            } 
                                        )(
                                            <InputNumber                                                                             
                                            min={0}
                                            onChange={
                                                value => {
                                                    let d1 = this.props.form.getFieldValue('购水量1');
                                                    this.props.form.setFieldsValue({
                                                        购水费1 : value * d1
                                                    });
                                                }
                                            }
                                            precision={2} 
                                            style={{ width: '100%' }} 
                                            addonAfter="元"                                  
                                        />
                                        )}
                                </FormItem>     
                            </Col>
                            <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水费"
                                        
                                    >
                                        {getFieldDecorator(
                                            '购水费1',
                                            {                               
                                                initialValue : '0'
                                            } 
                                        )(
                                            <InputNumber                                                                             
                                            min={0}
                                            disabled={true}
                                            precision={2} 
                                            style={{ width: '100%' }}
                                            addonAfter="元"                                   
                                        />
                                        )}
                                </FormItem>     
                            </Col>
                    </Col>
                    <Col span={12}>
                        <Divider orientation="left">开发区</Divider>
                        <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水日期"
                                    >
                                        {getFieldDecorator(
                                            '购水日期2',
                                            {initialValue : moment(`${this.today.getFullYear()}-${this.today.getMonth() + 1}-22`, dateFormat)}
                                        )(
                                            <DatePicker style={{width : '100%'}}  format={dateFormat} />
                                        )}
                                </FormItem>           
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...formItemLayout}
                                    label="购水量"
                                    
                                >
                                    {getFieldDecorator(
                                        '购水量2',
                                        {                               
                                            initialValue : '0'
                                        } 
                                    )(
                                        <InputNumber                                                                             
                                        min={0}
                                        onChange={
                                            value => {
                                                let d1 = this.props.form.getFieldValue('购水单价2');
                                                this.props.form.setFieldsValue({
                                                    购水费2 : value * d1
                                                });
                                            }
                                        }
                                        precision={2} 
                                        style={{ width: '100%' }}
                                        addonAfter="吨"                                       
                                    />
                                    )}
                            </FormItem>     
                            </Col>
                            <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水单价"
                                        
                                    >
                                        {getFieldDecorator(
                                            '购水单价2',
                                            {                               
                                                initialValue : '0'
                                            } 
                                        )(
                                            <InputNumber                                                                             
                                            min={0}
                                            onChange={
                                                value => {
                                                    let d1 = this.props.form.getFieldValue('购水量2');
                                                    this.props.form.setFieldsValue({
                                                        购水费2 : value * d1
                                                    });
                                                }
                                            }
                                            precision={2} 
                                            style={{ width: '100%' }}
                                            addonAfter="元"                                   
                                        />
                                        )}
                                </FormItem>     
                            </Col>
                            <Col span={12}>
                                <FormItem
                                        {...formItemLayout}
                                        label="购水费"
                                        
                                    >
                                        {getFieldDecorator(
                                            '购水费2',
                                            {                               
                                                initialValue : '0'
                                            } 
                                        )(
                                            <InputNumber                                                                             
                                            min={0}
                                            disabled={true}
                                            precision={2} 
                                            style={{ width: '100%' }}
                                            addonAfter="元"                                   
                                        />
                                        )}
                                </FormItem>     
                            </Col>
                    </Col>
                </Row>
            <Divider orientation="left">统计结果</Divider>
            <Steps>
                <Step icon={steps[0].icon  ? <Icon type={steps[0].icon} /> : ''} status={steps[0].status} title={steps[0].title} description="录入购水情况" />
                <Step icon={steps[1].icon  ? <Icon type={steps[1].icon} /> : ''} status={steps[1].status} title={steps[1].title} description="按收费标准统计各类水费" />
                <Step icon={steps[2].icon  ? <Icon type={steps[2].icon} /> : ''} status={steps[2].status} title={steps[2].title} description="统计销售水清单" />
                <Step icon={steps[3].icon  ? <Icon type={steps[3].icon} /> : ''} status={steps[3].status} title={steps[3].title} description="统计市政公司用水" />
                <Step icon={steps[4].icon  ? <Icon type={steps[4].icon} /> : ''} status={steps[4].status} title={steps[4].title} description="统计水费明细" />
                <Step icon={steps[5].icon  ? <Icon type={steps[5].icon} /> : ''} status={steps[5].status} title={steps[5].title} description="生成生产经营状况表" />
                <Step icon={steps[6].icon  ? <Icon type={steps[6].icon} /> : ''} status={steps[6].status} title={steps[6].title} description="生成生产简报" />
            </Steps>
            <Divider style={isTableShow ? {} : {display : 'none'}} orientation="left">表格</Divider>
            <Card  bordered={false} style={isTableShow ? { width: '100%' } : {display : 'none'}} >
                <Card.Grid onClick={ e => {this.onToExcel(e, 1, 'jingying', '天保市政生产经营情况汇总表')} } style={gridStyle}>{loading1 ? <Spin size="large" /> : '1 生产经营'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 2, 'standard', '天保市政公司按各收费标准统计水费汇总表')} }  style={gridStyle}>{loading2 ? <Spin size="large" /> : '2 水价统计'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 3, 'detail', '天保市政公司水费明细简表')} } style={gridStyle}>{loading3 ? <Spin size="large" /> : '3 水费明细'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 4, 'jianbao', '天保市政公司生产简报')} } style={gridStyle}>{loading4 ? <Spin size="large" /> : '4 生产简报'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 5, 'qingdan', '天保市政公司销售水清单')} } style={gridStyle}>{loading5 ? <Spin size="large" /> : '5 水费清单'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 6, 'gongye', '保税区工业用水单位明细表')} } style={gridStyle}>{loading6 ? <Spin size="large" /> : '6 工业用户'}</Card.Grid>
                <Card.Grid onClick={ e => {this.onToExcel(e, 7, 'shuisun', '天保市政公司水量购销变化表')} } style={gridStyle}>{loading7 ? <Spin size="large" /> : '7 水损统计'}</Card.Grid> 
                <Card.Grid style={gridStyle}>{loading8 ? <Spin size="large" /> : '8 欠费用户'}</Card.Grid> 
                <Card.Grid onClick={ e => {this.onToExcel(e, 9, 'shizheng', '市政公司自用水统计表')} } style={gridStyle}>{loading9 ? <Spin size="large" /> : '9 市政用户'}</Card.Grid>     
            </Card>
        </Form>
        );
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>统计水费</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
            </div>
        );
    }
}

StatToll.propTypes = {
    form: PropTypes.object,
    user: PropTypes.object,
};

let statToll = Form.create({})(StatToll);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(statToll))




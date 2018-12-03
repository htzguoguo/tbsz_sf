import React, { Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
    Button, message,  
    notification,  
    Divider,   Row,  
    Select, Form, Alert, InputNumber,
    Spin , Modal
} from 'antd';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item; 
const confirm = Modal.confirm;

function cancel() {
    message.error('点击了取消');
} 

class PrepareWaterFee extends Component {
    constructor(props){
        super(props);
        this.selectedYear = 2017;
        this.selectedMonth = '07';
        this.state = {            
            loading: false
        };
    } 
    
    handlePrepareWaterFee = (e) => {        
        e.preventDefault();         
        let commitApi = () => {
            this.setState({
                loading: true                
            });
            api.post(
            `water/feesprepare`, 
            {            
                year: values.年,
                month : values.月,
                commission : values.手续费,
                others : values.其它,
                user : this.props.user.姓名 ? this.props.user.姓名 : '',    
            }
            ).then(
                data => {
                    notification.success({
                        message: '提示',
                        description: data.data.desc,
                        duration: 3,
                    });
                    this.setState({
                        loading: false                
                    }); 
                }
            ).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading: false                
                    });
                }
            ); 
        }
        let values = this.props.form.getFieldsValue(['年', '月', '手续费', '其它']);        
        api.get(
            `water/feesnum/${values.年}/${values.月}`, 
            {            
                responseType: 'json'
            }
        ).then((data) => {                
            if(data.data.length > 0) {
                confirm({
                    title: '严重警告',
                    content: '要创建月份的水费记录已存在，重新生成将删除原有所有记录，要继续吗?',
                    onOk() {
                        commitApi();
                    }, 
                    onCancel() {
                        message.info('选择不删除原有数据,创建中止!');
                    },                   
                    okText : "确认",
                    cancelText : "取消"
                });
            }else {
                commitApi();
            }             
        }).catch(
            err => {
                handleError(err);                         
                this.setState({
                    loading: false                
                });
            }
        );  
    }

    handleEraseZero = (e) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        confirm({
            title: '警告',
            content: '确实要删除水费为0的记录吗？删除之后无法恢复。',
            onOk() {               
                api.delete(
                    `water/feezero/${values.年}/${values.月}`                   
                ).then(
                    data => {
                         
                        notification.success({
                            message: '提示',
                            description: '完成删除水费为0的记录。',
                            duration: 3,
                        });                        
                    }
                ).catch(
                    err => {
                        handleError(err);
                    }
                );  
            }, 
            onCancel() {
                message.info('选择不删除原有数据,创建中止!');
            },                   
            okText : "确认",
            cancelText : "取消"
        });
    } 

    render() {  
        const { getFieldDecorator } = this.props.form;  
        const {loading} = this.state;       
        return (           
            <div className="ant-row" style={{marginTop:20}}>                             
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>月水费自动创建</h5>
                    </div>
                </div>
                <Form   layout="inline">
                    <Row>                         
                            <FormItem                            
                            label="创建时间:"
                            labelCol={{span: 10}}
                            wrapperCol={{span: 8}}
                            >
                            {getFieldDecorator(
                                '年',
                                {initialValue : this.selectedYear}
                            )(
                                <Select 
                                placeholder="年份"                                        
                                style={{ width : '100px',   marginRight : '5px' }}>
                                <Option value="2003">2003</Option>
                                <Option value="2004">2004</Option>
                                <Option value="2005">2005</Option>
                                <Option value="2006">2006</Option>
                                <Option value="2007">2007</Option>
                                <Option value="2008">2008</Option>
                                <Option value="2009">2009</Option>
                                <Option value="2010">2010</Option>
                                <Option value="2011">2011</Option>
                                <Option value="2012">2012</Option>
                                <Option value="2013">2013</Option>
                                <Option value="2014">2014</Option>
                                <Option value="2015">2015</Option>
                                <Option value="2016">2016</Option>                            
                                <Option value="2017">2017</Option>
                                <Option value="2018">2018</Option>
                                <Option value="2019">2019</Option>
                                <Option value="2020">2020</Option>
                                <Option value="2021">2021</Option>
                            </Select>
                            )}
                            </FormItem>
                       
                        <FormItem  
                            wrapperCol={{span: 22}}                    
                            >                             
                            {getFieldDecorator(
                                        '月',
                                        {initialValue : this.selectedMonth}
                                    )(
                                        <Select 
                                        placeholder="月份"
                                        style={{width : '100px' }}>
                                        <Option value="01">01</Option>
                                        <Option value="02">02</Option>
                                        <Option value="03">03</Option>
                                        <Option value="04">04</Option>
                                        <Option value="05">05</Option>
                                        <Option value="06">06</Option>
                                        <Option value="07">07</Option>
                                        <Option value="08">08</Option>
                                        <Option value="09">09</Option>
                                        <Option value="10">10</Option>
                                        <Option value="11">11</Option>
                                        <Option value="12">12</Option>
                                    </Select>
                                    )}  
                        </FormItem>
                        
                    </Row>
                    <Divider><h5>水费基本数据</h5></Divider>
                    <Row>
                        <FormItem                            
                            labelCol={{span: 10}}
                            wrapperCol={{span: 8}}
                            validateStatus="warning"
                            label="手续费">
                            {getFieldDecorator('手续费', {                                  
                                initialValue : '2.2'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}   
                                    style={{ width: '100px' }}                                 
                                />
                            )}
                        </FormItem>
                        <FormItem                            
                            labelCol={{span: 10}}
                            wrapperCol={{span: 8}}
                            validateStatus="warning"
                            label="其它">
                            {getFieldDecorator('其它', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100px' }}                                  
                                />
                            )}
                        </FormItem> 
                    </Row>
                    <Divider></Divider>
                    <Row>
                    <FormItem >                        
                        <Button type="primary" onClick={this.handlePrepareWaterFee} icon="switcher">生成</Button>
                        </FormItem>
                        <FormItem>                                            
                        <Button type="danger" icon="delete" onClick={this.handleEraseZero}>删除空记录</Button>
                        </FormItem>
                        <FormItem>                       
                        </FormItem>
                    </Row>
                </Form>
                <Divider dashed></Divider>
                {
                    loading ? 
                    
                    <Spin className={styles.spin} size="large" tip="工作中...">
                                    <Alert  
                                    message="系统提示："                                   
                                    description="正在创建水费记录."
                                    type="info"
                                    />
                                </Spin>
                    : null       
                }
                            
            </div>
        );
    }


}
let form = Form.create({})(PrepareWaterFee);
 

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

function mapDispatchToProps(dispatch) {
return {actions: bindActionCreators({}, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(form);




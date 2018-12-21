import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    Button, Form, Input,DatePicker,
    Select,  notification,
    Row, Divider, Checkbox,
    Col, Radio,Modal, List, Alert,
    InputNumber, Icon } from 'antd';
const Option = Select.Option;
const Search = Input.Search;
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const { MonthPicker } = DatePicker;
import moment from 'moment';
const FormItem = Form.Item;
import api from '../../../api';
import './index.less';

const monthFormat = 'YYYYMM';

class TakeToll extends Component{
    constructor(props) {
        super(props);
        const current = new Date();
        this.num = props.match.params.num;
        this.isEdit = this.num === '0' ? false : true;
        this.year = props.match.params.year;
        this.month = props.match.params.month;
        this.onFeeSearch = this.onFeeSearch.bind(this);
        this.onYearChange = this.onYearChange.bind(this);
        this.onMonthChange = this.onMonthChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.handlePayment = this.handlePayment.bind(this);
        this.handleCalculateFee = this.handleCalculateFee.bind(this);
        this.selectedYear = this.isEdit ? this.year : moment().format('YYYY');
        this.selectedMonth = this.isEdit ? this.month : moment().format('MM');
        this.selectedNum = this.isEdit ? this.num : '0002';
        this.selectType = '3';
        this.state = {
          modalVisible: false,
          confirmLoading: false,
          selectedItems:[],
      };
    }

    componentDidMount() {
        if (this.isEdit) {
            this.onFeeSearch(this.num);
        }
    }    

    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    }

    onProjectOrPriceChanged() {
       let project =  this.props.form.getFieldValue('projects');
       let price = this.props.form.getFieldValue('price');
        
       if (Number.isFinite(project) && Number.isFinite(price)) {
           this.props.form.setFieldsValue({'total' : Number(project) * Number(price)});
       }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，您检查',
                    duration: 3,
                });
                return;
            }     
            values.操作员 = this.props.user.姓名;      
            api.put('/water/fee',values).then((data) => {

                notification.success({
                    message: '提示',
                    description: data.data,
                    duration: 3,
                });
            });
        });
    }

    handleCalculateFee() {         
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，请检查',
                    duration: 3,
                });
                return;
            } 
            if(parseInt(values.上月表底) - parseInt(values.本月表底) > 0 ) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，错误原因: 本月表底 < 上月表底',
                    duration: 3,
                });
                return; 
            }                      
            api.post('water/calfee',values).then((data) => {
                data = data.data;
                let item = data[0];
                this.props.form.setFieldsValue(data[0]);
                this.setState({selectedItems : [{...values, ...data[0]}]});
                if(item.超额水量 > 0) {
                  this.showNotification(
                    'warning',
                    `企业用水量已超计划, 超计划水量为[${Math.abs(item.超额水量)}]`
                  ); 
                }else{
                  this.showNotification(
                    'success',
                    `完成计算;实收水费为[${item.实收水费}]`
                  );
                }               
            }).catch(this.handleError);
        });
    }

    onYearChange(year) {
        this.selectedYear = year;
    }

    onMonthChange(month) {
        this.selectedMonth = month;
    }

    onDateChange(date, dateString) {
        this.selectedYear = date.format('YYYY');
        this.selectedMonth = date.format('MM');
    }


    showNotification = (type, desc) => {
        notification[type]({ 
            message: '提示',            
            description: desc,
            duration: 3,
        });
    }

    handleError = (error) => {
        if(error.response.status === 404) {
            this.showNotification('warning', '没有发现相关的记录!');
        }
    }

    handleAfterFetchQuery(item) {       
        item.单位性质描述 = item.单位性质编号 +'-'+item.单位性质;
        item.抄表形式描述 = item.抄表形式编号 +'-'+item.抄表形式;
        item.水费标准描述 = item.区号 +'-'+item.单价;
        if(item.欠费标志 === '2') {
            item.欠费标志 = true;
        }else{
            item.欠费标志 = false;
        }
        if(parseFloat(item.减免水费) > 0) {
            item.是否减排污费 = true;
        }else {
            item.是否减排污费 = false;
        } 
        this.props.form.resetFields();           
        this.props.form.setFieldsValue(item);
    }

    onFeeSearch(num) {        
        let year = this.selectedYear;
        let month = this.selectedMonth;
        this.selectedNum = num;
        api.get(`water/fee/${num}/${year}/${month}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);
            
        }).catch(this.handleError);
    }

    handlePrior = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) > 0 ?
        this.props.form.getFieldValue('编号') : this.selectedNum;
        let year = this.selectedYear;
        let month = this.selectedMonth;
        let type = this.selectType;
        api.get(`water/feeprior/${num}/${year}/${month}/${type}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的前一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }

    handleNext = () => {
        let num = parseInt(this.props.form.getFieldValue('编号')) > 0 ?
                    this.props.form.getFieldValue('编号') : this.selectedNum;
         
        let year = this.selectedYear;
        let month = this.selectedMonth;
        let type = this.selectType;
        api.get(`water/feenext/${num}/${year}/${month}/${type}`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            let item = data[0];
            if (!item.hasOwnProperty('编号')) {
                this.showNotification('warning', `编号[${num}]没有对应的后一项记录！`)
                return;
            } 
            this.handleAfterFetchQuery(item);            
        }).catch(this.handleError);
    }

    onSelectChange = (e) => {
        this.selectType = e.target.value;       
    }

    handlePayment(e) {
        e.preventDefault();
        const onFeeSearch =  this.onFeeSearch;
        const handleError = this.handleError;
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，您检查',
                    duration: 3,
                });
                return;
            }
            confirm({
                title: '严重警告:',
                content: `确定"${values.户名}${values.年}年${values.月}月"的水费已经缴纳吗？`,
                onOk() {
                    api.post(`/water/payment/${values.编号}/${values.年}/${values.月}`,{}).then((data) => {
                        notification.success({
                            message: '提示',
                            description: `完成${values.户名}${values.年}年${values.月}月水费缴纳。`,
                            duration: 3,
                        });
                        onFeeSearch(values.编号);
                    }).catch(handleError);
                }, 
                onCancel() {
                },                   
                okText : "确认",
                cancelText : "取消"
            });
        }); 
    }

    handleModalVisible = (flag) => {
      this.setState({
          modalVisible: !!flag,
      });
  }

  handleSMS = (item) => {
      this.setState({
          confirmLoading: true,
      });
      api.post('water/fees/sms',item).then((data) => {
          data = data.data;
          notification.success({
              message: '提示',
              description: `完成发送短信。`,
              duration: 3,
          });
          this.setState({
              confirmLoading: false,
              selectedItems : data
          });
      }).catch(
          err => {
              this.setState({
                  confirmLoading: false,

              });  
              notification.error({
                  message: '提示',
                  description: `发送短信不成功,请重试。`,
                  duration: 3,
              });
          }
      );
  }

  renderSMSResult = (item) => {
      if(item && item.desc){
          let desc = item.desc;
          if (desc.indexOf('success') !== -1) {
              //return <span>发送成功</span>
              return <Alert message="发送成功" type="success" showIcon />
          }else if(desc === 'error:Missing recipient') {
              //return <span>发送失败,原因：手机号码无效</span>
              return <Alert message="发送失败,原因：手机号码无效" type="error" showIcon />
          }else {
              //return <span>发送失败</span>
              return <Alert message="发送失败" type="error" showIcon />
          }
      }
      return '';
  }

  renderSMSForm = () => {
    const {modalVisible, confirmLoading, selectedItems} = this.state;
    const items = selectedItems;
    return (
            <Modal
                width={800}
                title="发送超计划短信提醒"
                visible={modalVisible}
                confirmLoading={confirmLoading}
                onOk={() => this.handleSMS(items[0])}
                onCancel={() => this.handleModalVisible()}
                okText="发送短信"
                cancelText="取消"
                >
                <List
                    size="middle"
                    dataSource={items}
                    renderItem={item => {
                            if(item && item.desc) {
                                return <List.Item key={item.编号}>
                                    <List.Item.Meta
                                    avatar={<Icon type="user" />}
                                    title={`${item.编号}-${item.户名}`}
                                    description={
                                      <span className="highlight">贵企业用本月份水量已超计划, 超计划水量为[{Math.abs(item.超额水量)}]
                                      </span>
                                    }
                                    />
                                    {
                                      item && item.desc ? this.renderSMSResult(item) : ''
                                    }
                                </List.Item>
                            }else {
                                return <List.Item key={item.编号}>
                                <List.Item.Meta
                                avatar={<Icon type="user" />}
                                title={`${item.编号}-${item.户名}`}
                                description={
                                  <span className="highlight">贵企业用本月份水量已超计划, 超计划水量为[{Math.abs(item.超额水量)}]
                                  </span>
                                }
                                />
                                </List.Item>
                            }
                }}
                > 
                </List>
            </Modal>
    );
  }

    render() {
        var self = this;
        const { getFieldProps,getFieldDecorator, getFieldError, isFieldValidating } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 16 },
        };
        const waterOverUsage = this.props.form.getFieldValue('超额水量')
        return (
            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>{this.isEdit ? '编辑水费' : '录入水费'}</h5>
                    </div>
                </div>
                <Row style={{ marginBottom: 16 }} >
                    <Col span={5}>
                    <MonthPicker onChange={this.onDateChange} defaultValue={moment()} format={monthFormat}/>
                        {/* <Select 
                            placeholder="年份" 
                            defaultValue={this.selectedYear}
                            onChange={e => {
                                this.onYearChange(e)
                            }}
                            style={{ width: '45%', marginRight : '5px' }}>
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
                        <Select 
                            placeholder="月份"
                            defaultValue={this.selectedMonth}
                            onChange={e => {
                                this.onMonthChange(e)
                            }}
                            style={{ width: '45%' }}>
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
                        </Select> */}
                    </Col>
                    <Col span={5}>
                        <Search
                            ref={input => this.Search = input}
                            placeholder="企业编号"
                            defaultValue={this.selectedNum}
                            onSearch={(e => {
                                this.onFeeSearch(e);
                            })}
                            enterButton="搜索"
                        />
                    </Col>
                    <Col offset={1} span={5}>
                        <Button.Group size="default">
                            <Button onClick={this.handlePrior} type="primary">
                                <Icon type="left" />前一项
                            </Button>
                            <Button onClick={this.handleNext} type="primary">
                                后一项<Icon type="right" />
                            </Button>
                            </Button.Group>
                    </Col> 
                    <Col span={5}>
                    <RadioGroup onChange={this.onSelectChange}>
                        <Radio value={1}>红外</Radio>
                        <Radio value={2}>手工</Radio>
                        <Radio value={3}>全部</Radio>                         
                    </RadioGroup>    
                    </Col>
                    <Col span={3} >
                      <Button disabled={waterOverUsage > 0? false : true} type="danger"     icon="check"  onClick={() => this.handleModalVisible(true)}>超计划短信提醒</Button>
                    </Col>
                </Row>
                <Form layout="horizontal" form={this.props.form}>
                    <Divider dashed><h5>单位基本信息</h5></Divider>  
                    <Row>
                        <Col span={8}>  
                        <FormItem
                        label="收费日期"
                        labelCol={{span: 5}}
                        >                       
                            <Col span={7}>
                                    {getFieldDecorator(
                                        '年',
                                        {
                                            rules: [{
                                                required: true, message: '请先获取正确的企业信息!',
                                            }] ,
                                                                                        
                                        }
                                        )(
                                        <Input  placeholder="年" disabled/>
                                    )}                                 
                            </Col>
                            <Col span={2}>
                                <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                                -
                                </span>
                            </Col>                            
                            <Col span={7}>                               
                                    {getFieldDecorator(
                                        '月',
                                        {
                                            rules: [{
                                                required: true, message: '请先获取正确的企业信息!',
                                            }] ,
                                                                                        
                                        }
                                        )(
                                        <Input  placeholder="月" disabled/>
                                    )}                                
                            </Col> 
                            </FormItem>                           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="编号"
                                    labelCol={{span: 5}}
                                >
                                    {getFieldDecorator(
                                        '编号',
                                        {
                                            rules: [{
                                                required: true, message: '请先获取正确的企业信息!',
                                            }] ,
                                                                                        
                                        }
                                        )(
                                        <Input  placeholder="编号" disabled/>
                                    )}
                            </FormItem>            
                        </Col>
                        <Col span={8}>
                        <FormItem
                                    {...formItemLayout}
                                    label="户名"
                                    labelCol={{span: 5}}
                                >
                                    {getFieldDecorator('户名')(
                                        <Input  placeholder="户名" disabled/>
                                    )}
                            </FormItem>   
                        </Col>
                        <Col span={8}>
                        <FormItem
                                    {...formItemLayout}
                                    label="单位性质"
                                    labelCol={{span: 5}}
                                >
                                    {getFieldDecorator('单位性质描述')(
                                        <Input  placeholder="单位性质" disabled/>
                                    )}
                            </FormItem>           
                        </Col>
                        <Col span={8}>
                            <FormItem
                                    {...formItemLayout}
                                    label="抄表形式"
                                    labelCol={{span: 5}}
                                >
                                    {getFieldDecorator('抄表形式描述')(
                                        <Input  placeholder="抄表形式" disabled/>
                                    )}
                            </FormItem>            
                        </Col>
                        <Col span={8}>
                        <FormItem
                                    {...formItemLayout}
                                    label="水费标准"
                                    labelCol={{span: 5}}
                                >
                                    {getFieldDecorator('水费标准描述')(
                                        <Input  placeholder="水费标准" disabled/>
                                    )}
                            </FormItem>   
                        </Col>                    
                    <Divider dashed><h5>水费信息</h5></Divider>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"                            
                            label="上月表底">
                            {getFieldDecorator('上月表底', {
                                rules: [{
                                    required: true, message: '请输入上月表底!',
                                }],
                                initialValue : '0'
                            })(
                                <InputNumber                                                                  
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%', color : 'red' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="本月表底">
                            {getFieldDecorator('本月表底', {
                                rules: [{
                                    required: true, message: '请输入本月表底!',
                                }],
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="用水量">
                            {getFieldDecorator('用水量', {                                
                                initialValue : '0'
                            })(
                                <InputNumber  
                                    disabled                                   
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="计划水量">
                            {getFieldDecorator('计划水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber  
                                    disabled                                   
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={16}>
                        <Col span={12}>
                            <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="计划水费">
                            {getFieldDecorator('计划水费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    disabled                                    
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>  
                        </Col>  
                        <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="老表水费">
                            {getFieldDecorator('老表水费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                                                         
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem> 
                        </Col>
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="超额水量">
                            {getFieldDecorator('超额水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber   
                                    disabled                                 
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={16}>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                labelCol={{span: 5}}
                                label="超额水费">
                                {getFieldDecorator('超额水费', {                                  
                                    initialValue : '0'
                                })(
                                    <InputNumber  
                                        disabled                                   
                                        min={0}
                                        precision={2}   
                                        style={{ width: '100%' }}                                 
                                    />
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}></Col>
                    </Col>                                          
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="防火费">
                            {getFieldDecorator('防火费', {                              
                                initialValue : '0'
                            })(
                                <InputNumber  
                                    disabled                                  
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>                    
                    {/* <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="手续费">
                            {getFieldDecorator('手续费', {                                  
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}   
                                    style={{ width: '100%' }}                                 
                                />
                            )}
                        </FormItem>
                    </Col> */}
                    <Col span={16}>
                        <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="手续费">
                            {getFieldDecorator('手续费', {                                  
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}   
                                    style={{ width: '100%' }}                                 
                                />
                            )}
                        </FormItem>
                        </Col>
                        <Col span={12}>
                        <FormItem
                            {...formItemLayout}
                            label=""
                            >
                            {getFieldDecorator('欠费标志', {                                  
                                initialValue : false,
                                valuePropName: 'checked'
                            })(
                                <Checkbox>欠费</Checkbox>
                            )}
                        </FormItem>    
                        </Col>
                    </Col> 
                    {/* <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            label=""
                            >
                            {getFieldDecorator('欠费标志', {                                  
                                initialValue : false,
                                valuePropName: 'checked'
                            })(
                                <Checkbox>欠费</Checkbox>
                            )}
                        </FormItem>
                    </Col>                    */}
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="排污费">
                            {getFieldDecorator('排污费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber
                                    disabled                                    
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="其它">
                            {getFieldDecorator('其它', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            hasFeedback
                            validateStatus="success"
                            label="应收水费">
                            {getFieldDecorator('应收水费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    disabled                                    
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>      
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="申请水量">
                            {getFieldDecorator('申请水量', {                              
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    disabled                                   
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="年用水量">
                            {getFieldDecorator('年用水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber
                                    disabled                                     
                                    min={0}
                                    precision={0}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="剩余水量">
                            {getFieldDecorator('剩余水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    disabled
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>      
                    </Col>
                    <Divider dashed><h5>减免水费</h5></Divider> 
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减免水量">
                            {getFieldDecorator('减免水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                    
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减免单价">
                            {getFieldDecorator('减免单价', {                                
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            label="减免水费">
                            {getFieldDecorator('减免水费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber 
                                    disabled                                    
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>      
                    </Col>

                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减排污费水量">
                            {getFieldDecorator('减免排污费水量', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                    
                                    min={0}
                                    precision={0} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减排污费单价">
                            {getFieldDecorator('减免排污费单价', {                                
                                initialValue : '0'
                            })(
                                <InputNumber                                     
                                    min={0}
                                    precision={2}  
                                    style={{ width: '100%' }}                                  
                                />
                            )}
                        </FormItem>   
                    </Col>
                    <Col span={8}> 
                        <FormItem
                            {...formItemLayout} 
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减排污费"
                            >                              
                                {getFieldDecorator('减排污费', {                               
                                    initialValue : '0'
                                })(
                                    <InputNumber                                     
                                        min={0}
                                        precision={2}  
                                        style={{ width: '100%' }}                                  
                                    />
                                )} 
                        </FormItem>                                      
                    </Col>

                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            validateStatus="warning"
                            label="减其它">
                            {getFieldDecorator('减其它', {                               
                                initialValue : '0'
                            })(
                                <InputNumber                                    
                                    min={-100000}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>            
                    </Col>
                    {/* <Col span={3}>
                        <FormItem
                        {...formItemLayout}
                                                    
                        >
                                {getFieldDecorator('是否减排污费',
                                    {initialValue : false, valuePropName: 'checked'}
                                )(
                                    <Checkbox>减排污费</Checkbox>
                                )} 
                        </FormItem>                                            
                    </Col>                                                */}
                                         
                    <Col span={8}>
                        <FormItem
                            {...formItemLayout}
                            labelCol={{span: 5}}
                            hasFeedback
                            validateStatus="success"
                            label="实收水费">
                            {getFieldDecorator('实收水费', {                               
                                initialValue : '0'
                            })(
                                <InputNumber  
                                    disabled                                   
                                    min={0}
                                    precision={2} 
                                    style={{ width: '100%' }}                                   
                                />
                            )}
                        </FormItem>      
                    </Col>
                    </Row>
                    <Divider ></Divider> 
                    <FormItem wrapperCol={{ span: 24 }}>
                        <Col span={6} >
                            <Button type="danger" icon="form" onClick={this.handleCalculateFee}>计算水费</Button>
                        </Col>    
                        <Col span={6} >
                            <Button type="primary" icon="check-circle-o" onClick={this.handleSubmit.bind(this)}>保存水费</Button>
                            &nbsp;&nbsp;&nbsp;
                            <Button type="ghost" icon="close" onClick={this.handleReset.bind(this)}>重置</Button>
                        </Col>
                        
                    </FormItem>
                </Form>
                {self.renderSMSForm()}
            </div>
        );
    }
}


let takeToll = Form.create({})(TakeToll);

const mapStateToProps = (state) => {
    const { user } = state.auth;
    return {    
        user 
    };
};

function mapDispatchToProps(dispatch) {
return {actions: bindActionCreators({}, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(takeToll);

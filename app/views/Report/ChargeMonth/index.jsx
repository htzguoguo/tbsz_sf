import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message,
    Radio, Input,
    Divider,  Row, Col,
    Form, Select,
    DatePicker, Table,
} from 'antd';
import moment from 'moment';

import api from '../../../api';
import {monthFormat, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";
import {feeColumns} from '../../../components/Table';
import print from '../../../assets/css/print.less';
import styles from './index.less';

const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
function cancel() {
    message.error('点击了取消');
}

class ChargeMonth extends Component {
    constructor(props){
        super(props);        
        this.state = {
          data: [],
          pagination: {},
          loading: false,
          loading1: false
        };
        this.columns = feeColumns;
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
    }

    validatesPara = (values) => {
      values.月份 = values.月份 ? values.月份.format("YYYYMM") : '';       
      values.user = this.props.user.truename;
      if(!values.num1 || values.num1.length !== 4 || !isFinite(values.num1)) {
          showNotification('error', '输入的起始编号不正确，请重新输入！')
          this.props.form.validateFieldsAndScroll(['num1']);
          return false;
      }
      if(!values.num2 || values.num2.length !== 4 || !isFinite(values.num2)) {
          showNotification('error', '输入的终止编号不正确，请重新输入！')
          this.props.form.validateFieldsAndScroll(['num2']);
          return false;
      }
      return true;
    }

    onSearch = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
          if (!err) {
            this.setState({ loading: true });
            if (!this.validatesPara(values)) {
              return
            }
            api.post(
              `/report/chargemonth/query`, 
              values,
              {            
                  responseType: 'json'
              }
            ).then((dt) => {
                let data = dt.data;
                const pagination = this.state.pagination;
                pagination.total = data.length;             
                this.setState({
                    loading: false,
                    data: data,
                    pagination,
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
                }
            ); 
          }
      });
    };

    onToExcel = (e, index, flag, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.月份 = values.月份 ? values.月份.format("YYYYMM") : '';       
        values.user = this.props.user.truename;
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
            `/report/${flag}/excel`, 
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
    <Col span={5}>
      <Button type="primary" onClick={this.onSearch} icon="search">搜索</Button>
      <Button onClick={(e) => this.onToExcel(e, 1, 'chargemonth', '天保市政公司水费统计表')} loading={this.state.loading1} icon="file-excel" style={{ marginLeft: 8, marginTop: 4 }}    >导出</Button>
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
                    label="月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '月份',
                            {initialValue : moment(new Date(), monthFormat)}
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
                            '制单',
                            {initialValue : userName}
                        )(
                            <Input/>
                        )}              
                    </FormItem>
                </Col>
                <Col span={4}>
                <FormItem
                    wrapperCol={24}
                    >                        
                        {getFieldDecorator(
                            'kind',
                            {initialValue : '1'}
                        )(
                            <RadioGroup>
                                <Radio value='1'>海港</Radio>
                                <Radio value='2'>小空港</Radio>
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
                            <h5>月汇总表</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <Table 
                      columns={this.columns}                     
                      rowKey={record => parseInt(record.编号)}
                      dataSource={this.state.data}
                      // pagination={this.state.pagination}
                      pagination={false}
                      loading={this.state.loading}
                      scroll={{ x: 3300,  y: 600  }}
                      bordered
                      footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                    />
                </div>
        </div>
        );
    }


}

ChargeMonth.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let chargeMonth = Form.create({})(ChargeMonth);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(chargeMonth))




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
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

function cancel() {
    message.error('点击了取消');
}

class ChargeMonthDynamic extends Component {
    constructor(props){
        super(props);        
        this.state = {
          data: [],
          pagination: {},
          loading: false,
          loading1: false
        };
        this.columns = [
          {
            title: '编号',
            dataIndex: '编号',
            key: '编号', 
            width: 100,
            sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
          },
          {
              title: '户名',
              dataIndex: '户名',
              width: 200,
              sorter: (a, b) => a.户名.length - b.户名.length,
          },
          {
            title: '用水地点',
            dataIndex: '装表地点', 
            width: 150,            
          },
          {
            title: '上月表底',
            dataIndex: '上月表底',
            width: 150,             
            sorter: (a, b) => parseFloat(a.上月表底) - parseFloat(b.上月表底)  
          },
          {
            title: '本月表底',
            dataIndex: '本月表底',           
            editable: true,
            width: 150,
            sorter: (a, b) => parseFloat(a.本月表底) - parseFloat(b.本月表底),
          }, 
        ];
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
            values.kind = '1';
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
        if (!this.validatesPara(values)) {
          return
        }
        values.kind = '1';
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
    <Col offset={20} span={4}>
      <Button type="primary" onClick={this.onSearch} icon="search">搜索</Button>
      <Button onClick={(e) => this.onToExcel(e, 1, 'chargedynamicmonth', '天保市政公司水费统计表')} loading={this.state.loading1} icon="file-excel" style={{ marginLeft: 8, marginTop: 4 }}    >导出</Button>
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
                <Col span={14}>
                    <FormItem
                    label="数据项"
                    labelCol= {{span: 3}}
                    wrapperCol= {{span: 21}}
                    >                        
                        {getFieldDecorator(
                            '数据项',                           
                        )(
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="请选择"
                          >
                            <Option value="用水量">用水量</Option>
                            <Option value="计划水量">计划水量</Option>
                            <Option value="超额水量">超额水量</Option>
                            <Option value="超额水费">超额水费</Option>
                            <Option value="防火费">防火费</Option>
                            <Option value="手续费">手续费</Option>
                            <Option value="排污费">排污费</Option>
                            <Option value="其它">其它</Option>
                            <Option value="应收水费">应收水费</Option>
                            <Option value="减免水量">减免水量</Option>
                            <Option value="减免水费">减免水费</Option>
                            <Option value="减其它">减其它</Option>
                            <Option value="实收水费">实收水费</Option>
                        </Select>,
                        )}              
                    </FormItem>
                </Col>
                {this.renderSearchButtons(false)} 

            </Row>
        </Form>
        );
    }
    render() {
      let fields = this.props.form.getFieldValue('数据项');
      let dynamicColumns = (fields && fields.map(
        field => {
          let obj = {
            title: field,
            dataIndex: field,
            width: 150,
          };
          return obj;
        }
      )) || [];
      let columns = [...this.columns, ...dynamicColumns];
      const { loading} = this.state;
      return (  
          <div>
              <div className="ant-row" style={{marginTop:20}}>
                  {this.renderAdvancedForm()}
                  <Divider></Divider>
                  <Table 
                    columns={columns}                     
                    rowKey={record => parseInt(record.编号)}
                    dataSource={this.state.data}
                    // pagination={this.state.pagination}
                    pagination={false}
                    loading={this.state.loading}
                    scroll={{  y: 600  }}
                    bordered
                    footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                  />
              </div>
      </div>
      );
    }
}

ChargeMonthDynamic.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let chargeMonthDynamic = Form.create({})(ChargeMonthDynamic);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(chargeMonthDynamic))




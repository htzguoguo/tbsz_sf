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
import {monthFormat,  formItemLayout, } from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";
import {chargeYearlyByCorpColumns, chargeYearlyByMeterColumns} from '../../../components/Table';
import print from '../../../assets/css/print.less';
import styles from './index.less';

const { MonthPicker } = DatePicker;
const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class ChargeYear extends Component {
    constructor(props){
        super(props);        
        this.state = {
          data: [],
          pagination: {},
          loading: false,
          loading1: false,
          category: ''
        };
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
    }

    validatesPara = (values) => {
      values.date1 = values.date1 ? values.date1.format("YYYYMM") : ''; 
      values.date2 = values.date2 ? values.date2.format("YYYYMM") : '';       
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

    onSearch = (e, category) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
          if (!err) {
            this.setState({ loading: true });
            if (!this.validatesPara(values)) {
              return;
            }
            api.post(
              `/report/chargeyear/query/${category}`, 
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
                    category
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



    onToExcel = (e, index, flag, fileName, category) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.date1 = values.date1 ? values.date1.format("YYYYMM") : ''; 
        values.date2 = values.date2 ? values.date2.format("YYYYMM") : '';       
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
            `/report/${flag}/excel/${category}`, 
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
    <Col offset={12} span={12}>
        <Button type="primary" style={{ marginLeft: 8, marginTop: 4 }} onClick={(e) => this.onSearch(e, 'meter')} icon="search">搜索(水表)</Button>
        <Button type="primary" style={{ marginLeft: 8, marginTop: 4 }} onClick={(e) => this.onSearch(e, 'corp')} icon="search">搜索(企业)</Button>
        <Button onClick={(e) => this.onToExcel(e, 1, 'chargeyear', '天保市政公司水费统计表', 'meter')} loading={this.state.loading1} icon="file-excel" style={{ marginLeft: 8, marginTop: 4 }}    >导出(水表)</Button>
        <Button onClick={(e) => this.onToExcel(e, 1, 'chargeyear', '天保市政公司水费统计表', 'corp')} loading={this.state.loading1} icon="file-excel" style={{ marginLeft: 8, marginTop: 4 }}    >导出(企业)</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {user} = this.props;
        const userName = user ? user.姓名 : '';
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={6}>
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
                <Col span={6}>
                    <FormItem
                    label="终止" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date2',
                            {initialValue : moment(`${this.today.year()}-12`, monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col>  
                <Col span={6}>
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
                <Col span={6}>
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
                {this.renderSearchButtons(false)} 

            </Row>
        </Form>
        );
    }
    render() {
        const {category} = this.state;
        let columns = [];
        if(category === 'meter') {
          columns = chargeYearlyByMeterColumns;
        }else if(category === 'corp') {
          columns = chargeYearlyByCorpColumns;
        }
        console.log('columns', columns);
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>年汇总表</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <Table 
                      columns={columns}
                      dataSource={this.state.data}
                      // pagination={this.state.pagination}
                      pagination={false}
                      loading={this.state.loading}
                      scroll={{ x: 2600,  y: 600  }}
                      bordered
                      footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                    />
                </div>
        </div>
        );
    }


}

ChargeYear.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let chargeYear = Form.create({})(ChargeYear);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(chargeYear))




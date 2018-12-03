import React, { Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import {
    Card, Avatar,  
    Calendar ,  
    Divider,   Row, Col, 
    Tabs, Form, DatePicker, InputNumber,
    Badge , Tooltip 
} from 'antd';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import './index.less';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const rankingListData = [];
for (let i = 0; i < 7; i += 1) {
    rankingListData.push({
        title: `工专路 ${i} 号店`,
        total: 323234,
    });
}

function fixedZero(val) {
    return val * 1 < 10 ? `0${val}` : val;
  }

function getTimeDistance(type) {
    const now = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
  
    if (type === 'today') {
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
      return [moment(now), moment(now.getTime() + (oneDay - 1000))];
    }
  
    if (type === 'week') {
      let day = now.getDay();
      now.setHours(0);
      now.setMinutes(0);
      now.setSeconds(0);
  
      if (day === 0) {
        day = 6;
      } else {
        day -= 1;
      }
  
      const beginTime = now.getTime() - (day * oneDay);
  
      return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
    }
  
    if (type === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const nextDate = moment(now).add(1, 'months');
      const nextYear = nextDate.year();
      const nextMonth = nextDate.month();
  
      return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
    }
  
    if (type === 'year') {
      const year = now.getFullYear();
  
      return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
    }
  }

class UnitSummary extends Component {
    constructor(props){
        super(props);
        this.state = {
            items : []
        } 
        this.today = moment(new Date(), 'YYYYMMDD');      
    }

    onPanelChange = (value, mode) => {
        this.today = value;
        const {user} = this.props;
        this.fetchUserProfile(user.单位编号, this.today.year());
    }

    componentDidMount() {
        const {user} = this.props;
        if(user) {
            this.fetchUserProfile(user.单位编号, this.today.year());
        }
    }

    fetchUserProfile = (num, year) => {
        api.get(`water/feesyear/${num}/${year}`, {            
            responseType: 'json'
        }).then((data) => {
            let items = data.data;
            this.setState({items});
        }).catch(this.handleError);
    }

    getMonthData(value) {
        return value.month();
    }

    monthCellRender = (value) => {
        const {items} = this.state;
        let month = this.getMonthData(value) + 1;
        let fee = items.find(item => parseInt(item.月) === month)
        return fee ? (            
                <div className="pageHeaderExtra" style={{fontSize : 20}}>
                <Tooltip title={`上月表底：${fee.上月表底},本月表底：${fee.本月表底}`}><span style={{color: '#1890ff'}}>用水量:{fee.用水量}</span></Tooltip> | <Tooltip title={`防火费：${fee.防火费},手续费：${fee.手续费},排污费：${fee.排污费}`}><span style={{ color: '#52c41a' }}>水费:{fee.实收水费}</span></Tooltip> | <span>{fee.欠费标志 === '2' 
                ? <Badge status="error" text="未缴费" />
                : <Badge status="success" text="已缴费" />}</span>
                </div>
        ) : null;
    }

    render() {
        const {items} = this.state;
        const {user} = this.props;
        let item = items && items.length > 0 ? items[0] : null;
        let num = item ? item.编号 : '';
        let name = item ? item.户名 : '';
        let summary = items.reduce(
            (previous, current) => {
                previous.缴费月数 += current.欠费标志 === '2' ? 0 : 1;
                previous.欠费月数 += current.欠费标志 === '2' ? 1 : 0;
                previous.用水量 += parseInt(current.用水量);
                previous.水费 += parseFloat(current.实收水费);
                return previous;
            },
            {
                缴费月数 : 0,
                欠费月数 : 0,
                用水量 : 0,
                水费 : 0

            }
        );
        const pageHeaderContent = (
            <div className='pageHeaderContent'>
                <div  >
                    <Avatar style={{ backgroundColor: '#87d068' }} size={64} icon="user" />
                </div>
                <div className='content'>
                    <div className='contentTitle'>{`${num}-${name}`}</div>
                    <div>{`${this.today.year()}年缴费信息`}</div>
                </div>
            </div>
        );
        const pageHeaderExtra = (
            <div className='pageHeaderExtra'>
                <div>
                <p>缴费/欠费</p>
                <p>{summary.缴费月数}<span> / {summary.欠费月数}</span></p>
                </div>
                <div>
                <p>用水总量</p>
                <p>{summary.用水量}</p>
                </div>
                <div>
                <p>水费汇总</p>
                <p>{summary.水费}</p>
                </div>
            </div>
        );
        return (           
            <div className="ant-row" style={{marginTop:20}}> 
                <Row>
                    <Col span={14}>
                        {pageHeaderContent}
                    </Col>
                    <Col span={10}>
                        {pageHeaderExtra}
                    </Col>
                </Row>
                <Divider dashed></Divider>
                <Card title="">
                    <Calendar 
                    monthCellRender={this.monthCellRender} 
                    onPanelChange={this.onPanelChange} 
                    defaultValue={this.today} 
                    mode="year"  />
                </Card>
            </div>
        );
    }


}

UnitSummary.propTypes = {
    user : PropTypes.object
};

let form = Form.create({})(UnitSummary);

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




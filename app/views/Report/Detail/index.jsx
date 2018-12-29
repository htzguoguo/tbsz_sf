import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Table, Button, message, 
    notification,  Input,
    Divider,  Row, Col, Alert, 
    Form, Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import PHE from 'print-html-element';
import api from '../../../api';
import {monthFormat} from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import print from '../../../assets/css/print.less';
import styles from './index.less';
const Option = Select.Option;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};
class Detail extends Component {
    constructor(props){
        super(props);        
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            selectedRowKeys: [],
            selectedRows:[],
            chargekinds : [],
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };    
        this.columns = [
            {
                title: '编号',
                dataIndex: '编号',
                key: '编号',
                width : '20%',
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)     
            },
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名',
                width : '80%' , 
                sorter: (a, b) => a.户名.length - b.户名.length,
            }
        ];
        this.radioFilter = '';
        this.searchFilter = '';
        this.selectedItems = [];
        this.today = moment(new Date(), 'YYYYMMDD');
    } 

    componentDidMount() {
        // let date = this.props.form.getFieldValue('月份');
        // date = date.format("YYYYMM");
        // this.fetchItems(date, '5');
        this.fetchParameters();
    } 

    fetchParameters = () => {
        api.get(`unit/unitparas`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;            
            this.setState({...data});           
        }).catch(this.handleError); 
    }

    fetchItems = (date, kind) => {
        this.setState({ loading: true });
        api.get(`/report/detail/${date}/${kind}`, {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
            const pagination = this.state.pagination;             
            pagination.total = data.length;             
            this.setState({
                loading: false,
                data: data,
                pagination,
            });
            notification.success({
                message: '提示',
                description: `成功获取${data.length}条记录`,
                duration: 3,
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
                notification.success({
                    message: '提示',
                    description: `没有满足条件的记录,请重试。`,
                    duration: 3,
                });
            }
        );  
    }

    onSearch = (e) => {
      e.preventDefault();        
      this.props.form.validateFields((err, values) => {
          this.setState({ loading: true });
          values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
          values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
          api.post('/water/feesearch', values)
          .then((dt) => {
            let data = dt.data;
            const pagination = this.state.pagination;             
            pagination.total = data.length;             
            this.setState({
                loading: false,
                data: data,
                pagination,
            });
            notification.success({
                message: '提示',
                description: `成功获取${data.length}条记录`,
                duration: 3,
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
                notification.success({
                    message: '提示',
                    description: `没有满足条件的记录,请重试。`,
                    duration: 3,
                });
            }
        )
          }); 
  }

    // onMonthChange = (date, dateString) => {
    //     date = date.format("YYYYMM");
    //     let kind = this.props.form.getFieldValue('收费形式编号');
    //     kind = kind ? kind : '5';
    //     this.fetchItems(date, kind);
    // }

    // onKindChange = (value) => {
    //     let date = this.props.form.getFieldValue('月份');
    //     date = date.format("YYYYMM");
    //     this.fetchItems(date, value);  
    // }

    renderSearchButtons = () =>
    <Col span={4}>
        <Button onClick={this.onSearch} icon="search" type="primary">查询</Button>
        <Button onClick={() => {PHE.printHtml(document.getElementById('printForm1').innerHTML)}} icon="printer" style={{ marginLeft: 8, marginTop: 14 }}   >打印</Button>
    </Col>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {chargekinds} = this.state;
        const {user} = this.props;
        const userName = user ? user.姓名 : ''; 
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  > 
              <Col span={8}>
                    <FormItem
                    label="年月" 
                    {...formItemLayout}                     
                    >
                    <Col span={11}>
                        {getFieldDecorator(
                            '起始年月',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker format={monthFormat}/>                                
                        )}
                    </Col>
                    <Col span={2}  >
                        <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
                        -
                        </span>
                    </Col>
                    <Col span={11}>
                        {getFieldDecorator(
                            '终止年月',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker format={monthFormat}/> 
                        )}
                    </Col>
                    </FormItem>
                </Col>
                <Col span={4}>
                        <FormItem
                        label="户名"  
                        {...formItemLayout}                 
                        >                        
                            {getFieldDecorator(
                                '户名',
                                {initialValue : ''}
                            )(
                                <Input />                                
                            )}                       
                        </FormItem>
                </Col>                   
                {/* <Col span={6}>
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
                </Col>  */}
                <Col span={4}>
                    <FormItem
                            {...formItemLayout}
                            label="收费形式"
                        >
                            {getFieldDecorator(
                                '收费形式'
                            )(
                                <Select                                
                                style={{ width: '100%' }}
                                > 
                                {chargekinds.map(d => <Option key={d.收费形式编号}>{d.收费形式编号}-{d.收费形式}</Option>)}                                       
                                </Select>
                            )}
                    </FormItem>           
                </Col> 

                <Col span={4}>
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

    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
    }

    renderPrintFeeForm(item, i) {
        let name = this.props.form.getFieldValue('制单');
        let isPaging = (i + 1) % 3 === 0;
        let str = isPaging ? "noborder print-container-fitcontent paging" : "noborder print-container-fitcontent";
        return (
            //<div key={'pt' + item.编号} className="noborder print-container-h paging "  >
            <div key={'pt' + item.编号} className={str}  > 
                <table style={{marginTop : '10mm'}} className="printtable  page-4-h">
                    <tr>
                        <td style={{height: '10mm', colSpan : '2'}}>
                            <p style={{display: 'flex', justifyContent: 'center'}} >                                         
                                <span style={{fontSize : '20pt'}}>
                                    水费结算单
                                </span>
                            </p>    
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p style={{display: 'flex', justifyContent: 'flex-end', paddingRight : '2.4cm'}}><span >{`${item.年}年${item.月}月`}</span></p>
                        </td>
                    </tr>
                </table>
                <table className="printtable printtable-border1   page-4-h">
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'center'}}>用水单位</td>
                        <td colSpan={3} style={{textAlign: 'left', paddingLeft : '3mm'}}>{item.户名}　</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >用水地点</td>
                        <td style={{width : "24mm",textAlign: 'left', paddingLeft : '3mm'}} >{item.装表地点}　</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >编号</td>
                        <td style={{width : "24mm",textAlign: 'left', paddingLeft : '3mm'}} >{item.编号}　</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "1px",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'center'}}>上月表底</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>本月表底</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>月用水量</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>用水单价</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >计划水费&nbsp;&nbsp;A</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >超额水量　</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >超额水价</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >超额水费&nbsp;&nbsp;B</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'right'}}>{item.上月表底}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.本月表底}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.用水量}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.单价}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.计划水费}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.超额水量}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.超额水价}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.超额水费}</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "1px",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'center'}}>申请指标</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>指标期限</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>指标剩余</td>
                        <td style={{width : "24mm",textAlign: 'center'}}>污水单价</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >污水处理费</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >防火费&nbsp;&nbsp;D</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >手续费&nbsp;&nbsp;E</td>
                        <td style={{width : "24mm",textAlign: 'center'}} >其它&nbsp;&nbsp;F</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'right'}}>{item.申请水量}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.使用期限}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.剩余水量}</td>
                        <td style={{width : "24mm",textAlign: 'right'}}>{item.排污费单价}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.排污费}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.防火费}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.手续费}</td>
                        <td style={{width : "24mm",textAlign: 'right'}} >{item.其它}</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "1px",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}}></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                        <td style={{width : "24mm",textAlign: 'center'}} ></td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'center'}}>实收水费</td>
                        <td style={{width : "24mm",textAlign: 'left', paddingLeft : '3mm'}} >{item.应收水费}　</td>                       
                        <td style={{width : "24mm",textAlign: 'center'}} >金额大写</td>
                        <td colSpan={5} style={{width : "24mm",textAlign: 'left', paddingLeft : '3mm'}} >{item.大写}　</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",height : "10mm",textAlign: 'center'}}>备注</td>
                        <td colSpan={7} style={{width : "24mm",textAlign: 'left', paddingLeft : '3mm'}} >{item.备注}　</td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",borderWidth : '0', height : "7mm",textAlign: 'center'}}>制单</td>
                        <td style={{width : "24mm",borderWidth : '0',textAlign: 'left', paddingLeft : '3mm'}} >{name}　</td>
                        <td style={{width : "24mm",borderWidth : '0',textAlign: 'center'}} >制单日期</td>
                        <td colSpan={2} style={{width : "24mm",borderWidth : '0',textAlign: 'left', paddingLeft : '3mm'}} >{this.today.format('YYYY-MM-DD')}　</td>
                        <td style={{width : "24mm",borderWidth : '0',textAlign: 'center'}} >单位盖章</td>
                        <td colSpan={2} style={{width : "24mm",borderWidth : '0',textAlign: 'left', paddingLeft : '3mm'}} > </td>
                    </tr>
                    <tr>
                        <td style={{width : "24mm",borderWidth : '0', height : "7mm",textAlign: 'center'}}></td>
                        <td  colSpan={6} style={{width : "24mm",borderWidth : '0',borderBottomWidth: '1px', textAlign: 'left', paddingLeft : '3mm'}} ></td>
                        <td  style={{width : "24mm",borderWidth : '0',textAlign: 'left', paddingLeft : '3mm'}} > </td>
                    </tr>
                </table>                               
            </div> 
        );
    }

    cleanSelectedKeys = () => { 
        this.onSelectChange([], []);
    }

    render() {
        const { loading, selectedRowKeys, data, selectedRows } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>水费结算单</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                    <div style={{marginBottom : '20px'}}>
                        <Alert
                            message={(
                            <div>
                                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 家&nbsp;&nbsp;
                                共 <span style={{ fontWeight: 600 }}>{data.length}</span> 家
                                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
                            </div>
                            )}
                            type="info"
                            showIcon
                        />
                    </div>
                    <Table columns={this.columns}                     
                        rowKey={record => parseInt(record.编号)}
                        dataSource={this.state.data}
                        rowSelection={rowSelection}
                        pagination={false}
                        loading={this.state.loading}
                        bordered
                        scroll={{ y: 400 }}
                        footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                    />
                </div>
                <div  id="printForm1">
                    {
                        selectedRows.map(
                            (item, i) => this.renderPrintFeeForm(item, i)
                        )
                    }                       
                </div>
        </div>         
            
        );
    }


}

Detail.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let detail = Form.create({})(Detail);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(detail))




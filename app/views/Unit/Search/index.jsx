import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message,  
    notification,  
    Divider, Input, Row, Col, Radio,
    Select,   Form,  
    DatePicker,    Checkbox
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
import {unitColumns} from '../../../components/Table';

const { MonthPicker } = DatePicker;
const Option = Select.Option; 
const FormItem = Form.Item; 
const monthFormat = 'YYYYMM';
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

function cancel() {
    message.error('点击了取消');
}

class SearchUnits extends Component {
    constructor(props){
        super(props);
        this.selectedDate = '201707';         
        this.state = {
            dd : '201707',
            data: [],
            pagination: {},
            loading: false,
            expandForm: false,   
            banks : [],
            pipes : [],
            chargestandard : [],
            unitkinds : [],         
            usekinds : [] ,
            inputkinds : [],
            chargekinds : [],
            firestandard : []       
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };  
        this.columns = unitColumns;  
        // this.columns = [
        //     {
        //         title: '编号',
        //         dataIndex: '编号',
        //         key: '编号',                
        //         sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
        //     },
        //     {
        //         title: '户名',
        //         dataIndex: '户名',
        //         key: '户名',
        //         sorter: (a, b) => a.户名.length - b.户名.length,
        //     },
        //     {
        //         title: '开户行行名',
        //         dataIndex: '开户行行名',
        //         key: '开户行行名',
        //         sorter: (a, b) => a.户名.length - b.户名.length, 
        //     },
        //     {
        //         title: '账号',
        //         dataIndex: '账号',
        //         key: '账号',                
        //     },
        //     {
        //         title: '联系人',
        //         dataIndex: '联系人',
        //         key: '联系人',                
        //     },
        //     {
        //         title: '电话',
        //         dataIndex: '实收水费',
        //         key: '实收水费',                
        //     },
        //     {
        //         title: '用水日期',
        //         dataIndex: '用水日期',
        //         key: '用水日期',
        //         sorter: (a, b) => parseFloat(a.用水日期) - parseFloat(b.用水日期)  
        //     },
        //     {
        //         title: '使用期限',
        //         dataIndex: '使用期限',
        //         key: '使用期限',
        //         sorter: (a, b) => parseFloat(a.使用期限) - parseFloat(b.使用期限)  
        //     },
        //     {
        //         title: '装表日期',
        //         dataIndex: '装表日期',
        //         key: '装表日期',
        //         sorter: (a, b) => parseFloat(a.装表日期) - parseFloat(b.装表日期)  
        //     }            
        // ];
        this.radioFilter = '';
        this.searchFilter = '';
    }
    
    fetch = ({year, month, type}) => {
        this.setState({ loading: true });
        api.get(`water/fees/${year}/${month}/${type}`, 
        {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
            const pagination = this.state.pagination;
            // Read total count from server
            // pagination.total = data.totalCount;
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

    componentDidMount() {
        api.get(`unit/unitparas`, {            
            responseType: 'json'
        }).then((data) => {
            data = data.data;            
            this.setState({...data});           
        }).catch(this.handleError); 
    }    

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            values.用水日期 = values.用水日期 ? values.用水日期.format("YYYYMM") : '';
            values.装表日期 = values.装表日期 ? values.装表日期.format("YYYYMM") : '';
            api.post('/unit/unitsearch', values).then((dt) => {
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
        });
    }

    onToWord = (e) => {
      e.preventDefault();        
      this.props.form.validateFields((err, values) => {
          if (!err) {
              this.setState({ loading: true });
              values.用水日期 = values.用水日期 ? values.用水日期.format("YYYYMM") : '';
              values.装表日期 = values.装表日期 ? values.装表日期.format("YYYYMM") : '';
              api.post(
                  `unit/unitstoword`, 
                  values,
                  {            
                      responseType: 'arraybuffer'
                  }
              ).then((dt) => {                 
                      this.setState({
                          loading: false                  
                      });
                      let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.wordprocessingml.document'} )
                      let link = document.createElement('a')
                      link.href = window.URL.createObjectURL(blob)
                      link.download = `天保市政公司用水单位资料卡片${moment().format('YYYYMMDD')}.docx`
                      link.click()
              }).catch(
              err => {
                  handleError(err);                         
                  this.setState({
                      loading: false                
                  });
              }
              );  
          }
      });
  }

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                values.用水日期 = values.用水日期 ? values.用水日期.format("YYYYMM") : '';
                values.装表日期 = values.装表日期 ? values.装表日期.format("YYYYMM") : '';
                api.post(
                    `unit/unitstoexcel`, 
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `天保市政公司用水单位统计表${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading: false                
                    });
                }
                );  
            }
        });
    }
    
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();        
    }  

    renderSearchButtons = () => 
    <div style={{ overflow: 'hidden', marginTop : '20px' }}>
        <span style={{ float: 'right', marginBottom: 24 }}>
            <Button icon="search" onClick={this.onSearch} type="primary">查询</Button>
            <Button icon="reload" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <Button icon="save" style={{ marginLeft: 8 }} type="danger"   onClick={this.onToExcel}>导出Excel</Button>
            <Button icon="save" style={{ marginLeft: 8 }} type="danger"   onClick={this.onToWord}>导出Word</Button>
        </span>
    </div>

    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const {banks, pipes, chargestandard, unitkinds, 
            usekinds, inputkinds, chargekinds, firestandard} = this.state;
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={8}>
                    <FormItem
                    label="编号" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            '编号',
                            {initialValue : ''}
                        )(
                            <Input        />                                
                        )}      
                    </FormItem>
                </Col> 
                <Col span={8}>
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
                <Col span={8}>
                    <FormItem 
                    label="用水形式" 
                    {...formItemLayout}                          
                    >
                    {getFieldDecorator(
                        '用水形式编号',
                        // {initialValue : usekinds[0].用水形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"  style={{ width: '100%' }} >
                            {usekinds.map(d => <Option key={d.用水形式编号}>{d.用水形式编号}-{d.用水形式}</Option>)} 
                        </Select>
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem 
                    label="抄表形式"
                    {...formItemLayout}                           
                    >
                    {getFieldDecorator(
                        '抄表形式编号',
                        // {initialValue : inputkinds[0].抄表形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {inputkinds.map(d => <Option key={d.抄表形式编号}>{d.抄表形式编号}-{d.抄表形式}</Option>)} 
                        </Select>
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="单位性质" 
                    {...formItemLayout}                         
                    >
                    {getFieldDecorator(
                        '单位性质编号',
                        // {initialValue : charges[0].区号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {unitkinds.map(d => <Option key={d.单位性质编号}>{d.单位性质编号}-{d.单位性质}</Option>)}                      
                        </Select>     
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="开户行" 
                    {...formItemLayout}                         
                    >
                    {getFieldDecorator(
                        '开户行行名',
                        // {initialValue : charges[0].区号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {banks.map(d => <Option key={d.开户行行名}>{d.开户行行名}</Option>)}                                      
                        </Select>    
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="费用标准" 
                    {...formItemLayout}                         
                    >
                    {getFieldDecorator(
                        '区号',
                        // {initialValue : charges[0].区号}
                    )(
                        <Select allowClear={true} placeholder="请选择"   style={{ width: '100%' }}>
                            {chargestandard.map(d => <Option key={d.区号}>{d.区号}-{d.单价}</Option>)}                                      
                        </Select>    
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem 
                    label="收费形式"
                    {...formItemLayout} 
                    >
                    {getFieldDecorator(
                        '收费形式编号',
                        // {initialValue : chargekinds[0].收费形式编号}
                    )(
                        <Select allowClear={true} placeholder="请选择"  style={{ width: '100%' }} >
                            {chargekinds.map(d => <Option key={d.收费形式编号}>{d.收费形式编号}-{d.收费形式}</Option>)}                                       
                        </Select>
                    )}
                    </FormItem>
                </Col> 

                <Col span={8}>
                    <FormItem
                            {...formItemLayout}
                            label="用水日期"
                        >
                            {getFieldDecorator('用水日期')(
                                <MonthPicker style={{width : '100%'}} format={monthFormat}/>
                            )}
                    </FormItem>           
                </Col>
                <Col span={8}>
                    <FormItem
                            {...formItemLayout}
                            label="装表日期"
                        >
                            {getFieldDecorator('装表日期')(
                                <MonthPicker style={{width : '100%'}} format={monthFormat}/>
                            )}
                    </FormItem>           
                </Col>
                <Col span={8}>                        
                    <FormItem
                    {...formItemLayout} 
                    label="续用水"
                    >
                    {getFieldDecorator('续用水', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox></Checkbox>
                        )}
                    </FormItem>                                       
                </Col>
                <Col span={8}>                        
                    <FormItem
                    {...formItemLayout} 
                    label="签合同单位"
                    >
                    {getFieldDecorator('签合同单位', {                                  
                            initialValue : false,
                            valuePropName: 'checked'
                        })(
                            <Checkbox></Checkbox>
                        )}
                    </FormItem>                                       
                </Col>            
            </Row>                      
            {this.renderSearchButtons(false)} 
        </Form>
        );
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>查询用水单位</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
                <Divider></Divider>
                <Table columns={this.columns}                     
                    rowKey={record => parseInt(record.编号)}
                    dataSource={this.state.data}
                    // pagination={this.state.pagination}
                    pagination={false}
                    scroll={{ x: 3210,  y: 600  }}
                    loading={this.state.loading}
                    bordered
                    footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                />
            </div>
        );
    }


}

SearchUnits.propTypes = {
    form: PropTypes.object,
};

let searchLists = Form.create({})(SearchUnits);
export default withRouter(searchLists)




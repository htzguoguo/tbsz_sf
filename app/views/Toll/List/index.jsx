import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message,  
    notification, Popconfirm,  
    Divider, Input, Row, Col, Radio,
    Select,   Form, Alert 
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';


const Option = Select.Option; 
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let _data = [];

function cancel() {
    message.error('点击了取消');
}

// 通过 rowSelection 对象表明需要行选择
const rowSelection = {

    onChange(selectedRowKeys, selectedRows) {
         
    },

    onSelect(record, selected, selectedRows) {
         
    },

    onSelectAll(selected, selectedRows, changeRows) {

         
    }
};

class ContentLists extends Component {
    constructor(props){
        super(props);
        this.selectedYear = 2017;
        this.selectedMonth = '07';
        this.selectedNum = '0002';
        this.selectedType = '3';
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            visible: false,
            showStat : false    
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };
        const onEdit = this.onEdit.bind(this); 
        const onDelete = this.onDelete.bind(this);
        this.columns = [
            {
                title: '编号',
                dataIndex: '编号',
                key: '编号',                
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
            },
            {
                title: '户名',
                dataIndex: '户名',
                key: '户名',
                sorter: (a, b) => a.户名.length - b.户名.length,
            },
            {
                title: '年份',
                dataIndex: '年',
                key: '年',
                sorter: (a, b) => parseFloat(a.年) - parseFloat(b.年)  
            },
            {
                title: '创建人',
                dataIndex: '操作员',
                key: '操作员',
            },
            {
                title: '创建时间',
                dataIndex: '操作时间',
                key: '操作时间',               
            },
            {
                title: '操作',
                dataIndex: '编号',
                key : '编号',
                render:function(text, record, index){
                    return (
                        <span>                           
                            <a onClick={onEdit.bind(this,text, record, index)}>单录  </a>
                            <Divider type="vertical" />
                            <Popconfirm title={`删除之后无法恢复,户名:${record.户名} 确认要删除吗?`} onConfirm={onDelete.bind(this,text, record, index)} onCancel={cancel}>
                                <a >删除</a>
                            </Popconfirm>
                        </span>
                    )
                } ,
                width: '15%'
            }


        ];
        this.radioFilter = '';
        this.searchFilter = '';
    }
    handleTableChange(pagination, filters, sorter) {
      /*  this.store.pagination = pagination;
        this.store.sorter = sorter;
        this.store.filters = filters;*/
        filters = this.store.filters;
        const pager = this.state.pagination;
        pager.current = pagination.current;
        this.setState({
            pagination: pager
        });         
        this.fetch({
            results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    }
    fetch = ({year, month, type}) => {
        this.setState({ loading: true });
        api.get(`water/fees/${year}/${month}/${type}`, 
        {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;             
            _data = data;
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
        this.fetch({
            year : this.selectedYear,
            month : this.selectedMonth,
            type : this.selectedType
        });
    }

    onEdit(text, record, index) {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.history.replace(`/app/toll/take/${text}/${values.年}/${values.月}`);                               
            }
        });
        
    }

    onDelete(text, record, index) {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                api.delete(`/water/fee/${text}/${values.年}/${values.月}`)
                .then((data) => { 
                    notification.success({
                        message: '提示',
                        description: `${values.年}年${values.月}月编号是${text}的水费记录已经删除`,
                        duration: 3,
                    });                    
                    this.fetch({
                        year : values.年,
                        month : values.月,
                        type : values.抄表形式
                    }                    
                    );                   
                })
                .catch(handleError);                 
            }
        });        
    }    

    filter = (data, value) => {
        const reg = new RegExp(value, 'gi');
        let result = data.map((record) => {
            const match = record.SubName.match(reg);
            const filterMatch = record.ParentCatalogName.match(reg) ||
                record.SubName.match(reg) ||
                record.ViewResult.match(reg) ||
                record.DealWithDesc.match(reg);
            if (!filterMatch) {
                return null;
            }
            return {
                ...record
            };
        }).filter(record => !!record);
        return result;
    };

    onSearch = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.fetch({
                    year : values.年,
                    month : values.月,
                    type : values.抄表形式
                }                    
                );
            }
        });
    };

    onToExcel = (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        this.props.form.validateFields((err, values) => {
            if (!err) {
                api.get(
                    `water/feestoexcel/${values.年}/${values.月}/${values.抄表形式}`, 
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
                link.download = `天保市政公司水费统计表${moment().format('YYYYMMDD')}.xlsx`
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

    onStatistics = (e) => {
        e.preventDefault();
        this.setState({ loading: true });
        this.props.form.validateFields((err, values) => {
            if (!err) {

                api.get(`water/feesstat/${values.年}/${values.月}/${values.抄表形式}`, 
            {            
                responseType: 'json'
            }).then((dt) => {
                let data = dt.data[0];
                this.setState({
                    loading: false,
                    showStat : true,
                    stat : `总水量： ${data.总水量}； 临时户：${data.临时户}，水量：${data.临时户水量}, 水费:${data.临时户水费}；
                    正式户：${data.正式户}，水量：${data.正式户水量}, 水费：${data.正式户水费} `
                });
            }).catch(
            err => {
                handleError(err);                         
                this.setState({
                    loading: false,
                    showStat : false          
                });
            }
        );  
            }
        });
    }

    onAlertClose(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({            
            showStat : false          
        }); 
    }

    showStatistics = () => {
        return <Alert style={{marginTop : '20px'}}   message="计算结果：" description={this.state.stat} showIcon   type="info" closeText="关闭" />
        // return <div style={{ display: this.state.showStat ? 'block' : 'none', marginTop: '20px' }} data-show="true" className="ant-alert ant-alert-info ant-alert-with-description" >
        // <i className="anticon anticon-info-circle-o ant-alert-icon"></i>
        // <span className="ant-alert-message">计算结果：</span>
        // <span className="ant-alert-description">{this.state.stat}
        // </span><a onClick={this.onAlertClose} className="ant-alert-close-icon">关闭</a></div>
    }

    onCatalogFilter = (value) => {
        this.store.filters.SubName = value;
        this.handleTableChange(this.store.pagination, this.store.filters, this.store.sorter);
    };

    onDeptFilter = (ele) => {
        let value = ele.target.value;
        if (value === 'all') {
            value = '';
        }
        this.store.filters.ParentCatalogName = value;
        this.handleTableChange(this.store.pagination, this.store.filters, this.store.sorter);
    };

    render() {  
        const { getFieldDecorator } = this.props.form; 
        const {showStat, stat} = this.state;  
         
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>水费列表</h5>
                    </div>
                </div>
                <Form   layout="inline">
                    <Row>                         
                            <FormItem                            
                            label="选择日期:"
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
                        
                        <FormItem
                            label="抄表形式:"
                            labelCol={{span: 5}} 
                            wrapperCol={{span: 18}}
                            >                             
                            {getFieldDecorator(
                                '抄表形式',
                                {initialValue : this.selectedType}
                            )(
                            <RadioGroup  style={{width : '250px' }}>
                                <RadioButton value="3">全部</RadioButton>
                                <RadioButton value="1">红外</RadioButton>
                                <RadioButton value="2">手工</RadioButton>                           
                            </RadioGroup>
                            )}
                        </FormItem>
                        <FormItem >                        
                        <Button type="primary" onClick={this.onSearch} icon="search">搜索</Button>
                        </FormItem>
                        <FormItem>                                            
                        <Button type="danger" icon="form" onClick={this.onStatistics}>计算</Button>
                        </FormItem>
                        <FormItem>
                        <Col span={24}>
                        <Button type="danger" icon="file-excel" onClick={this.onToExcel}>导出Excel</Button>
                        </Col>
                        </FormItem>
                    </Row>
                </Form>
                <div onClick={this.onAlertClose} style={{ display: showStat ? 'block' : 'none' }}>
                    <Alert key={Math.random() * 1000} style={{marginTop : '20px'}}   message="计算结果：" description={this.state.stat} showIcon closeText="关闭"  type="info" closable={false}   />
                </div>
                {/* { showStat ? this.showStatistics() : null } */}
                {/* {this.showStatistics()} */}
                <Divider></Divider>
                <Table columns={this.columns}                     
                    rowKey={record => parseInt(record.编号)}
                    dataSource={this.state.data}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    bordered
                    footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                />
            </div>
        );
    }
}



let contentLists = Form.create({})(ContentLists);
export default withRouter(contentLists)




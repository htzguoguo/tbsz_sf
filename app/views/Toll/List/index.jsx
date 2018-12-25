import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message,  
    notification, Popconfirm, Modal, 
    Divider, Input, InputNumber, Row, Col, Radio,
    Select,   Form, Alert, DatePicker 
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, } from '../../../utils/format';
import {handleError, showNotification} from "../../../utils/notification";
import './index.less';
const confirm = Modal.confirm;
const { MonthPicker } = DatePicker;
const Option = Select.Option; 
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
let _data = [];

function cancel() {
    message.error('点击了取消');
}
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
class ContentLists extends Component {
    constructor(props){
        super(props);
        this.selectedType = '3';
        this.tempData = []
        this.state = {
            data: [],
            editingKey: '',
            pagination: {},
            loading: false,
            loading1: false,
            modalVisible: false,
            showStat : false    
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };
        const onEdit = this.onEdit.bind(this); 
        const onDelete = this.onDelete.bind(this);

        const  feeColumns = [
          {
            title: '编号',
            dataIndex: '编号',
            key: '编号', 
            width: 90,
            fixed: 'left',               
            sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
          },
          {
              title: '户名',
              dataIndex: '户名',
              width: 300,
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
            width: 150,
            className: 'special-field',
            render: (text, record) => this.renderColumns(text, record, '本月表底'),
            sorter: (a, b) => parseFloat(a.本月表底) - parseFloat(b.本月表底),
          }, 
          {
            title: '用水量',
            dataIndex: '用水量',
            width: 150,
            sorter: (a, b) => parseFloat(a.用水量) - parseFloat(b.用水量)  
          },
          {
            title: '计划水量',
            dataIndex: '计划水量',
            width: 150,
            sorter: (a, b) => parseFloat(a.计划水量) - parseFloat(b.计划水量)  
          },
          {
            title: '单价',
            dataIndex: '单价',
            width: 120,
          }, 
          {
              title: '计划水费',
              dataIndex: '计划水费',
              width: 150,
              sorter: (a, b) => parseFloat(a.计划水费) - parseFloat(b.计划水费)  
          },
          {
            title: '超额水量',
            dataIndex: '超额水量',
            width: 150,
            sorter: (a, b) => parseFloat(a.超额水量) - parseFloat(b.超额水量)  
          },
          {
            title: '超计划',
            dataIndex: '超计划',
            width: 120,
          },
          {
            title: '超额水费',
            dataIndex: '超额水费',
            width: 150,
            sorter: (a, b) => parseFloat(a.超额水费) - parseFloat(b.超额水费)  
          },
          {
            title: '防火费',
            dataIndex: '防火费',
            width: 120,
          },
          {
            title: '手续费',
            dataIndex: '手续费',
            width: 120,
          },
          {
            title: '实缴排污费',
            dataIndex: '排污费',
            width: 120,
            className: 'special-field',
          },
          {
            title: '其它',
            dataIndex: '其它',
            width: 120,
          },
          {
              title: '应收水费',
              dataIndex: '应收水费', 
              width: 120,              
          },
          {
              title: '减免水量',
              dataIndex: '减免水量',
              width: 120,
              editable: true,
              className: 'special-field',
          },
          {
            title: '减免单价',
            dataIndex: '减免单价',
            width: 120,
            editable: true,
            className: 'special-field',
          },
          {
            title: '减免水费',
            dataIndex: '减免水费',
            width: 120,
          }, 
          {
            title: '减排污费',
            dataIndex: '减排污费',
            width: 120,
          },
          {
            title: '减其它',
            dataIndex: '减其它',
            width: 120,
            className: 'special-field',
          }, 
          {
            title: '水费合计',
            width: 120,
            render: (value, row, index) => parseFloat(row['实收水费'] - row['排污费']).toFixed(2)
          }, 
          {
            title: '实收水费',
            dataIndex: '实收水费',
            width: 120,
            
          },
        ];

        this.columns = [
          ...feeColumns,
          {
            title: '操作',
            dataIndex: '编号',
            key : '编号',
            fixed: 'right',
            width: 150,
            render:function(text, record, index){
              // const { editable } = record;
              const normal = (
                    <span>                           
                        <a onClick={onEdit.bind(this,text, record, index)}>单录  </a>
                        <Divider type="vertical" />
                        <Popconfirm title={`删除之后无法恢复,户名:${record.户名} 确认要删除吗?`} onConfirm={onDelete.bind(this,text, record, index)} onCancel={cancel}>
                            <a >删除</a>
                        </Popconfirm>
                    </span>
                );
              // const edit = (
              //   <span>
              //     <a onClick={() => this.save(record.key)}>Save</a>
              //     <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
              //       <a>Cancel</a>
              //     </Popconfirm>
              //   </span>
              // );
              // return (
              //   <div className="editable-row-operations">
              //   {editable ? edit : normal};
              // </div>
              // );
              return normal;
            },
          }
        ];     
        this.radioFilter = '';
        this.searchFilter = '';
    }

    renderColumns(text, record, column) {
      return (
        <span>
          {/* <a href="javascript:void(0);" onClick={(e) => this.onRowClick(record, e)}>
            {text}
          </a> */}
          <span onClick={(e) => this.onRowClick(record, e)}>{text}</span>
        </span>
      );
    }
    // handleChange(value, key, column) {
    //   const newData =  this.tempData;
    //   let target = newData.filter(item => key === item.key)[0];
    //   if (target) {
    //     target = {
    //       key
    //     }
    //     newData.push(target);
    //   }
    //   target[column] = value;
    // }
    // save(key) {
    //   const newData = [...this.state.data];
    //   const target = newData.filter(item => key === item.key)[0];
    //   if (target) {
    //     delete target.editable;
    //     this.setState({ data: newData });
    //     this.cacheData = newData.map(item => ({ ...item }));
    //   }
    // }
    // cancel(key) {
    //   const newData = [...this.state.data];
    //   const target = newData.filter(item => key === item.key)[0];
    //   if (target) {
    //     Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
    //     delete target.editable;
    //     this.setState({ data: newData });
    //   }
    // }

    // edit(key) {
    //   const newData = [...this.state.data];
    //   const target = newData.filter(item => key === item.key)[0];
    //   if (target) {
    //     target.editable = true;
    //     this.setState({ data: newData });
    //   }
    // }

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
        // this.fetch({
        //     year : this.selectedYear,
        //     month : this.selectedMonth,
        //     type : this.selectedType
        // });
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
              values.年 = values.date.format("YYYY");
              values.月 = values.date.format("MM");
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
          values.年 = values.date.format("YYYY");
          values.月 = values.date.format("MM");
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
              values.年 = values.date.format("YYYY");
          values.月 = values.date.format("MM");
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
          values.年 = values.date.format("YYYY");
          values.月 = values.date.format("MM");
          if (!err) {
              api.post(`water/feesstat/${values.年}/${values.月}/${values.抄表形式}`, 
              this.state.data,
          {            
              responseType: 'json'
          }).then((dt) => {
              let result = dt.data;
              let summary = result.summary;
              let data = result.data;
              notification.success({
                message: '提示',
                description: `水费数据计算完成完成。"`,
                duration: 3,
            });
              this.setState({
                  loading: false,
                  showStat : true,
                  data,
                  stat : `总水量： ${summary.总水量}； 临时户：${summary.临时户}，水量：${summary.临时户水量}, 水费:${summary.临时户水费}；
                  正式户：${summary.正式户}，水量：${summary.正式户水量}, 水费：${summary.正式户水费} `
              });
          }).catch(
          err => {
            notification.error({
              message: '提示',
              description: `水费数据修改不成功，请重试。"`,
              duration: 3,
          });                         
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

    onRowClick = (record,  event) => {
      event.preventDefault();
      event.stopPropagation();
      this.props.form.setFieldsValue(record);
      this.record = record;
      this.setState({               
        modalVisible: true,
    }); 
    }

    handleSave = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
            let record = {...this.record, ...values};            
            const newData = this.state.data;
            let ind = newData.findIndex(item => record.编号 === item.编号);            
            newData[ind] = record;
            this.setState({modalVisible : false, data: newData});
        }
      });
    }

    onDeptFilter = (ele) => {
        let value = ele.target.value;
        if (value === 'all') {
            value = '';
        }
        this.store.filters.ParentCatalogName = value;
        this.handleTableChange(this.store.pagination, this.store.filters, this.store.sorter);
    };

    renderEditForm = () => {
      const { getFieldDecorator } = this.props.form;
      const {mode} = this.state;
      return (
          <Modal
              title='修改'
              centered
              visible={this.state.modalVisible}
              okText="确认"
              cancelText="取消"
              onOk={() => {
                  this.handleSave();
              }}
              onCancel={() => this.setState({modalVisible : false})}
          >
              <Form id="searchParasForm"  form={this.props.form}>
                  <FormItem
                      label="本月表底" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '本月表底',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
                  <FormItem
                      label="减免水量" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '减免水量',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
                  <FormItem
                      label="减免单价" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '减免单价',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
                  <FormItem
                      label="减排污费水量" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '减免排污费水量',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
                  <FormItem
                      label="减排污费单价" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '减免排污费水量',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
                  <FormItem
                      label="减其它" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              '减其它',
                              {initialValue : '0'}
                          )(
                              <Input></Input>
                          )}  
                  </FormItem>
              </Form>
          </Modal>
          );
  }

    renderEditableTable = () => {
      return (<Table
        columns={this.columns}
        rowKey={record => parseInt(record.编号)}
        dataSource={this.state.data}
        // pagination={this.state.pagination}
        pagination={false}
        loading={this.state.loading}
        scroll={{ x: 3420,  y: 600  }}
        bordered
        // onRow={(record, index) => ({
        //   onClick: (event) => { this.onRowClick(record, index, event) } 
        // })}
        footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
      />)
    }

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
                <Form layout="inline">
                    <Row> 
                    <Col span={6}>
                      <FormItem
                      label="日期" 
                      {...formItemLayout}                      
                      >
                          {getFieldDecorator(
                              'date',
                              {initialValue : moment(new Date(), monthFormat)}
                          )(
                              <MonthPicker placeholder="" format={monthFormat} />
                          )}  
                      </FormItem>
                    </Col> 
                    <Col span={6}>
                      <FormItem
                        label="抄表形式"
                              {...formItemLayout}
                              
                          >
                              {getFieldDecorator(
                                  '抄表形式',
                                  {initialValue : this.selectedType}
                              )(
                                  <Select                                
                                   
                                  > 
                                  <Option key='3'>全部</Option>
                                  <Option key='1'>红外</Option>
                                  <Option key='2'>手工</Option>
                                  </Select>
                              )}
                      </FormItem>           
                    </Col>
                    <Col offset={4} span={8}>                                               
                      <Button type="primary" onClick={this.onSearch} style={{ marginLeft: 8  }} icon="search">搜索</Button>                                                                                       
                      <Button type="danger" icon="form" style={{ marginLeft: 8  }} onClick={this.onStatistics}>计算</Button>                                             
                      <Button type="danger" icon="file-excel" style={{ marginLeft: 8  }} onClick={this.onToExcel}>导出Excel</Button>                      
                    </Col>
                    </Row>
                </Form>
                <div onClick={this.onAlertClose} style={{ display: showStat ? 'block' : 'none' }}>
                    <Alert key={Math.random() * 1000} style={{marginTop : '20px'}}   message="计算结果：" description={this.state.stat} showIcon closeText="关闭"  type="info" closable={false}   />
                </div>
                {/* { showStat ? this.showStatistics() : null } */}
                {/* {this.showStatistics()} */}
                {this.renderEditForm()}
                <Divider></Divider>
                {this.renderEditableTable()}
            </div>
        );
    }
}


let contentLists = Form.create({})(ContentLists);
export default withRouter(contentLists)


const EditableCell = ({ editable, value, onChange }) => (
  <div>
    {editable
      ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
      : value
    }
  </div>
);




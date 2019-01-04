import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, Tabs , Icon,
    notification,  
    Divider, Input, Row, Col, Radio,
    Select,  Form,  
    DatePicker,  Card , Checkbox
} from 'antd';
import { Chart, Tooltip, Axis, Bar, Line, Point } from 'viser-react';
import moment from 'moment';
import api from '../../../api';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const TabPane = Tabs.TabPane;

const { MonthPicker } = DatePicker;
const Option = Select.Option;

const FormItem = Form.Item;

const monthFormat = 'YYYYMM';
const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
};

class UsageByUnit extends Component {
    constructor(props){
        super(props);               
        this.state = {
            data: [],
            pagination: {},
            loading: false,
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        }; 
        this.currentDate = new Date();
        this.columns = [
            {
                title: '编号',
                dataIndex: '编号',
                sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
            },
            {
                title: '户名',
                dataIndex: '户名',
                sorter: (a, b) => a.户名.length - b.户名.length,
            },
            {
              title: '年份',
              dataIndex: '年',
              sorter: (a, b) => parseInt(a.年) - parseInt(b.年),
            },
            {
              title: '月份',
              dataIndex: '月',
              sorter: (a, b) => parseInt(a.月) - parseInt(b.月),
            },
            {
                title: '上月表底',
                dataIndex: '上月表底',
                sorter: (a, b) => parseFloat(a.上月表底) - parseFloat(b.上月表底)  
            },
            {
                title: '本月表底',
                dataIndex: '本月表底',
                sorter: (a, b) => parseFloat(a.本月表底) - parseFloat(b.本月表底)  
            },
            {
                title: '应收水费',
                dataIndex: '应收水费',
                sorter: (a, b) => parseFloat(a.应收水费) - parseFloat(b.应收水费)  
            },
            {
                title: '实收水费',
                dataIndex: '实收水费',
                sorter: (a, b) => parseFloat(a.实收水费) - parseFloat(b.实收水费)  
            },
        ];
        this.radioFilter = '';
        this.searchFilter = '';
    }

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            this.setState({ loading: true });
            values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
            values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
            values.终止编号 = values.起始编号;
            api.post('/water/feesearch', values).then((dt) => {
                let data = dt.data;
                const pagination = this.state.pagination;             
                pagination.total = data.length;   
                data.sort(
                  (a, b) =>   parseInt(a.月) - parseInt(b.月)
                ).sort(
                  (a, b) => parseInt(a.年) - parseInt(b.年)  
                )          
                this.setState({
                    loading: false,
                    data, 
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

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
                values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
                values.终止编号 = values.起始编号;
                api.post(
                    `water/feesearchtoexcel`, 
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
    
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();        
    }        

    renderSearchButtons = (isSimple) => 
    <Col span={8}>
          <span style={{ float: 'right', marginBottom: 24 }}>
              <Button style={{ marginLeft: 8, marginTop: 14 }} onClick={this.onSearch} type="primary">查询</Button>
              <Button style={{ marginLeft: 8, marginTop: 14 }} type="danger"   onClick={this.onToExcel}>导出Excel</Button>             
          </span>
      </Col>    

    renderSimpleForm() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form id="searchParasForm" className={styles.searchParasForm} layout="horizontal" form={this.props.form}>
                <Row  >
                    <Col span={8}>
                        <FormItem
                        label="年月" 
                        {...formItemLayout}                     
                        >
                        <Col span={11}>
                            {getFieldDecorator(
                                '起始年月',
                                {initialValue : moment(this.currentDate, monthFormat)}
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
                                {initialValue : moment(this.currentDate, monthFormat)}
                            )(
                                <MonthPicker format={monthFormat}/> 
                            )}
                        </Col>
                        </FormItem>
                    </Col>                    
                    <Col span={8}>
                        <FormItem
                        label="编号" 
                        {...formItemLayout}                      
                        >                        
                          {getFieldDecorator(
                              '起始编号',
                              {
                                initialValue : '0002',
                                rules: [{
                                  required: true, message: '请输入水表编号!',
                                }] ,
                              }
                          )(
                              <Input        />                                
                          )}                       
                        </FormItem>
                    </Col> 
                    {this.renderSearchButtons(true)}        
                </Row>
            </Form>
        );
    }

    renderBar() {
      let values = this.props.form.getFieldsValue();
      values.起始年月 = values.起始年月 ? values.起始年月.format("YYYYMM") : '';
      values.终止年月 = values.终止年月 ? values.终止年月.format("YYYYMM") : '';
      values.终止编号 = values.起始编号;
      const {data} = this.state;
      const items = data.map(item => ({
        日期 : `${item.年}年${item.月}月`,
        用水量 : item.用水量
      }));
      
      const scale = [{
        dataKey: '用水量',
        min: 0
      }];
      const t = <Row type='flex' align='top' justify='center'>
        {
          data && data.length > 0 ?  
          `${data[0].户名}(${data[0].编号})-从${values.起始年月}到${values.终止年月}用水量曲线图` :
          ''
        }
      </Row>
      return (
        <Card title={t} bordered={false}  >
          <Chart forceFit height={400} data={items} scale={scale}>
            <Tooltip />
            <Axis />
            {/* <Bar position="日期*用水量" /> */}
            <Line position="日期*用水量" />
            <Point position="日期*用水量" shape="circle"/>
          </Chart>
        </Card>
        
      );
    }

    render() {  
        const {data} = this.state;
        return (           
            <div className="ant-row" >                
                <Divider></Divider>
                {this.renderSimpleForm()}
                <Tabs defaultActiveKey="1">
                  <TabPane tab="用水量" key="1">
                    {this.renderBar()}
                  </TabPane>
                  <TabPane tab="明细" key="2">
                    <Table columns={this.columns}
                      dataSource={this.state.data}
                      pagination={this.state.pagination}
                      loading={this.state.loading}
                      bordered
                      footer={()=>'共有'+ (this.state.pagination.total ? this.state.pagination.total : 0) + '条记录'}
                    />
                  </TabPane>
                </Tabs>,
            </div>
        );
    }


}
let form = Form.create({})(UsageByUnit);
export default withRouter(form)




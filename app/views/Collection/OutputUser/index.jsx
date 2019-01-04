import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message, 
    notification,  Transfer,
    Divider,  Row, Col, 
    Form, Checkbox, 
    DatePicker,
} from 'antd';

import moment from 'moment';

import api from '../../../api';
import {monthFormat,  formItemLayout, } from '../../../utils/format';
import {handleError} from "../../../utils/notification";
import styles from './index.less';
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;
function cancel() {
    message.error('点击了取消');
}

class OutputUser extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            user : [],
            targetKeys: [],
            pagination: {},
            loading: false,
            loading1: false,
            loading2: false,
            loading3: false,
            loading4: false,
        };
        this.radioFilter = '';
        this.searchFilter = '';
    } 

    componentDidMount() {
        this.fetchItems(null);
    }   

    fetchItems = (e) => {
        e && e.preventDefault();
        let obj = this.props.form.getFieldsValue();        
        obj.date = obj.date.format("YYYYMM");
        this.setState({ loading1 : true });
        api.post(`/collection/user`, obj,  {            
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
            let user = data.map(
                item => ({key : item.编号, title : item.编号, description : item.户名})
            );  
            this.setState({               
                loading1 : false,
                user,
                targetKeys: [],               
            });
        }).catch(
            err => {
                handleError(err);
                this.setState({                   
                    loading1 : false,
                    user: [],
                    targetKeys: [],
                });
            }
        );  
    }

    onToExcel = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading3: true });
                values.date = values.date ? values.date.format("YYYYMM") : '';
                api.post(
                    `collection/collection/excel`,
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading3: false                  
                        });
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `水费托收情况${moment().format('YYYYMMDD')}.xlsx`
                        link.click()
                }).catch(
                err => {
                    handleError(err);                         
                    this.setState({
                        loading3: false                
                    });
                }
                );  
            }
        });
    }

    ArrayBufferToString (buffer, encoding) {
        if (encoding == null) encoding = 'utf8'
    
        return Buffer.from(buffer).toString(encoding)
    }

    onOffer = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if (!err) {               
                values.date = values.date ? values.date.format("YYYYMM") : '';
                values.users = this.state.targetKeys;
                if(!values.users || values.users.length === 0) {
                    notification.error({
                        message: '提示',
                        description: `请选择托收用户`,
                        duration: 3,
                    });  
                    return;
                }
                this.setState({ loading4: true });
                api.post(
                    `collection/user/excel`,
                    values,
                    {            
                        responseType: 'arraybuffer'
                    }
                ).then((dt) => {                 
                        this.setState({
                            loading4: false                  
                        });
                        // let name = dt.headers['content-disposition'].split('=')[1];                         
                        // let blob = new Blob([dt.data], { type:   'application/octet-stream' } )
                        let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } )
                        let link = document.createElement('a')
                        link.href = window.URL.createObjectURL(blob)
                        link.download = `银行报盘${moment().format('YYYYMMDD')}.xlsx`
                        //link.download = `SBJJDR92${moment().format('YYYYMMDD')}.txt`
                        // link.download = name
                        link.click()
                }).catch(
                    error => {
                    let str = this.ArrayBufferToString(error.response.data)
                    let bufferToJson = JSON.parse(str);
                                    
                    notification.error({
                        message: '提示',
                        description: `${bufferToJson && bufferToJson.error && bufferToJson.error.message}`,
                        duration: 3,
                    });                            
                    this.setState({
                        loading4: false                
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
        <Col offset={5} span={8}>
            <Button loading={this.state.loading1} icon="search" style={{ marginTop: 4 }} onClick={this.fetchItems} >查询</Button>
            {/* <Button loading={this.state.loading2} icon="pie-chart" style={{ marginLeft: 8 }} onClick={this.onCreation} >生成</Button>        */}
            <Button loading={this.state.loading3} onClick={this.onToExcel} icon="printer" style={{ marginLeft: 8 }}   >打印</Button>
            <Button loading={this.state.loading4} onClick={this.onOffer} icon="save" style={{ marginLeft: 8 }}   >报盘</Button>
        </Col>

    
    
    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;       
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  align="middle">              
                <Col span={6}>
                    <FormItem
                    label="月份" 
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
                <Col span={5}>                        
                    <FormItem
                    wrapperCol={24}
                    >
                    {getFieldDecorator('recount', {                                  
                            initialValue : true,
                            valuePropName: 'checked'
                        })(
                            <Checkbox >只显示未托收用户</Checkbox>
                        )}
                    </FormItem>                                       
                </Col>
                {this.renderSearchButtons(false)} 
            </Row>
        </Form>
        );
    }

    handleUserChange = (targetKeys, direction, moveKeys) => {       
        this.setState({ targetKeys });
    }

    renderUserForm() {
        const {user} = this.state;
        return <Transfer
        titles={['现有用户', '托收用户']}
        notFoundContent='无匹配结果'
        dataSource={user}
        listStyle={{
        width: '45%',
        height: 400,
        }}
        targetKeys={this.state.targetKeys}
        onChange={this.handleUserChange}
        render={
            (item) => {
                const customLabel = (
                    <span className="custom-item">
                        {item.title} - {item.description}
                    </span>
                );
            
                return {
                    label: customLabel, // for displayed item
                    value: item.title, // for title and filter matching
                };
            }
        }
        />
    }

    render() {
        return (           
            <div className="ant-row" style={{marginTop:20}}>                
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>月水费数据导出窗口</h5>
                    </div>
                </div>
                {this.renderAdvancedForm()}
                <Divider></Divider>                         
                {this.renderUserForm()}
            </div>
        );
    }


}

OutputUser.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let outputUser = Form.create({})(OutputUser);

const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(outputUser))




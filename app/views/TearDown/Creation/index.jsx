import React, { Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    Button, message,  
    notification,  
    Divider,   Row, Col, Input,
    Select, Form, Alert, InputNumber,
    Spin , Modal
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError, showNotification} from "../../../utils/notification";
import Year from '../../../components/Year'
;import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;

class TearDown extends Component {
    constructor(props){
        super(props);
        this.state = {            
            loading1: false,
            loading2: false,
            units : []
        };
    }

    onSearch = (e) => {
        e.preventDefault();        
        this.props.form.validateFields((err, values) => {
            if(!values.编号 || values.编号.length !== 4 || !isFinite(values.编号)) {
                showNotification('error', '输入的编号不正确，请重新输入！');                
                return;
            }
            this.setState({loading1 : true}); 
            let num = values.编号;
            api.get(`unit/units/down/${num}`, {            
            responseType: 'json'
            }).then((data) => {
                let units = data.data;
                this.setState({units, loading1 : false}); 
                notification.success({
                    message: '提示',
                    description: `成功获取企业数据`,
                    duration: 3,
                });
            }).catch(
                err => {   
                    this.setState({
                        units : [],
                        loading1 : false
                    });
                    notification.error({
                        message: '提示',
                        description: `没有满足条件的记录,请重试。`,
                        duration: 3,
                    });
                }
            );
        });
    }

    onToWord = (e, index, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.user = this.props.user.姓名;        
        if(!values.编号 || values.编号.length !== 4 || !isFinite(values.编号)) {
            showNotification('error', '输入的编号不正确，请重新输入！');                
            return;
        }
        api.post(
            `/contract/teardown/word`, 
            values,
            {            
                responseType: 'arraybuffer'
            }
        ).then((dt) => {  
            obj[`loading${index}`] = false; 
            this.setState(obj);
            let blob = new Blob([dt.data], { type:   'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } )
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = `${fileName}${moment().format('YYYYMMDD')}.docx`
            link.click()
        }).catch(
        err => {
            handleError(err);                         
            obj[`loading${index}`] = false; 
            this.setState(obj);
        }
        );
    }

    renderUnitInfo() {
        let {units} = this.state;
        units = units || [];
        return units.map(
            (unit, index) => 
                <span key={index}>表号{index + 1}:<span style={{marginLeft:'10px', color : 'red'}}><b>{unit.编号}</b></span></span>
        );
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (           
            <div className="ant-row" style={{marginTop:20}}>                             
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>拆表通知创建</h5>
                    </div>
                </div>
                <Form   layout="inline">
                    <Row> 
                        <Col span={6}>
                            <FormItem>
                                {getFieldDecorator(
                                    '编号',
                                    {initialValue : ''}
                            )(
                                <Input addonBefore="编号:"  placeholder="" />                              
                                )}
                            </FormItem>            
                        </Col>
                        <Col span={4}>           
                            <Button type="primary" style={{ marginLeft: 8, marginTop: 14 }} loading={this.state.loading1} onClick={this.onSearch} icon="search">搜索</Button>
                        </Col>
                    </Row>
                    <Alert
                    style={{marginTop : '15px'}}
                    banner={true}
                    message="提示：请核对下列信息"
                    description={this.renderUnitInfo()}
                    type="info"
                    showIcon
                    />
                    <Divider></Divider>
                    <Row>
                    <FormItem >                        
                        <Button type="primary" loading={this.state.loading2} onClick={(e) => this.onToWord(e, 2, '终止供水合同')} icon="switcher">生成终止供水合同</Button>
                        </FormItem>
                    </Row>
                </Form>   
            </div>
        );
    }
}

TearDown.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let form = Form.create({})(TearDown);
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
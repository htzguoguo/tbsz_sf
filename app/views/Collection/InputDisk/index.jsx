import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Button, message, Icon,
    notification, Radio, Input,
    Divider,  Row, Col, 
    Form, Upload, Modal,Select,
    DatePicker
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {monthFormat, copy, ArrayBufferToString, dateFormat, formItemLayout, convertPropertiesToMoment, formatDatePickerValue} from '../../../utils/format';
import {showNotification} from "../../../utils/notification";
import {getAuthString} from '../../../utils/loginSession';

import print from '../../../assets/css/print.less';
import styles from './index.less';

const confirm = Modal.confirm;
const { MonthPicker } = DatePicker;
const FormItem = Form.Item;

function cancel() {
    message.error('点击了取消');
}

class InputDisk extends Component {
    constructor(props){
        super(props);        
        this.state = {
            fileList: [],
            crossdate : '',
            batch : '',
            uploading: false,
            loading1: false,
            loading2: false,            
        };
    } 

    componentDidMount() {
    }

    onToExcel = (e, index, flag, fileName) => {
        e.preventDefault();
        let values = this.props.form.getFieldsValue();
        let obj = {};
        obj[`loading${index}`] = true; 
        this.setState(obj);
        values.date = values.date ? values.date.format("YYYYMM") : '';
        api.post(
            `/collection/${flag}/excel`, 
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
            error => {
            let str = ArrayBufferToString(error.response.data)
                    let bufferToJson = JSON.parse(str);
                    notification.error({
                        message: '提示',
                        description: `${bufferToJson && bufferToJson.error && bufferToJson.error.message}`,
                        duration: 3,
                    });                                       
            obj[`loading${index}`] = false; 
            this.setState(obj);
        }
        );
    }

    handleUpload = () => {
        let values = this.props.form.getFieldsValue();
        values.date = values.date ? values.date.format("YYYYMM") : '';
        values.name = this.fileName;
        this.setState({
        uploading: true,
        });
        api.put(`collection/disk`, 
            values,
            {            
                responseType: 'json'
        }).then((data) => {
            data = data.data;
            this.setState({uploading: false});   
            showNotification('success', '读盘成功！');        
        }).catch(
            error => {
                this.setState({uploading: false});  
                this.handleError() ; 
            }
        );
    }



    renderAdvancedForm() {
        const { getFieldDecorator } = this.props.form;
        const { uploading} = this.state;
        let self = this;        
        const props = {
            name: 'file',
            action: 'api/v1/upload',
            multiple: false,
            accept : '.txt, .TXT',
            headers: {
                authorization: getAuthString(),
            },
            onChange(info) {
                // if (info.file.status !== 'uploading') {
                // }
                if (info.file.status === 'done') {
                    self.fileName = info.file.response.name; 
                    message.success(`文件上传成功.`);
                    let date = self.props.form.getFieldValue('date');
                    let txt = self.props.form.getFieldValue('crossdate');                    
                    if (date.format("YYYY-MM")  !== copy(txt,1,7)  ){
                        confirm({
                            title: '提示',
                            content: '回盘日期与所选月份不一致，要更改为一致吗？',
                            onOk() {
                                self.props.form.setFieldsValue(
                                    {
                                        date : moment(`${copy(txt,1,4)}${copy(txt,6,2)}`, monthFormat)
                                    }
                                );
                            }, 
                            onCancel() {
                            },                   
                            okText : "确认",
                            cancelText : "取消"
                        });
                    }
                } else if (info.file.status === 'error') {
                    message.error(`文件上传失败.`);
                }
            },
            onRemove: (file) => {
                this.setState(({ fileList }) => {
                const index = fileList.indexOf(file);
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                this.props.form.setFieldsValue({
                    crossdate : '',
                    batch : ''
                });
                return {
                    fileList: newFileList,
                };
                });
            },
            beforeUpload: (file) => {
                let Filename = file.name.split('.')[0];
                this.props.form.setFieldsValue({
                    crossdate : copy(Filename,9,4)+'-'+copy(Filename,13,2)+'-'+copy(Filename,15,2),
                    batch : copy(Filename,17,3)
                });
                this.setState(({ fileList }) => ({
                fileList: [file],
                }));
                return true;
            },
            fileList: this.state.fileList,
        }; 
        return (
        <Form id="searchParasForm" className={styles.searchParasForm}  layout="horizontal" form={this.props.form}>
            <Row  >              
                <Col span={5}>
                    <FormItem
                    label="月份" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'date',
                            {initialValue : moment(new Date(), monthFormat)}
                        )(
                            <MonthPicker onChange={this.onMonthChange} placeholder="" format={monthFormat} />
                        )}  
                    </FormItem>
                </Col> 
                <Col span={6}>
                    <FormItem
                            {...formItemLayout}
                            label="源文件路径"
                        >
                        <Upload style={{width : '100%'}} {...props}>
                        <Button>
                            <Icon type="upload" /> 选择文件
                        </Button>
                        </Upload>                       
                    </FormItem>           
                </Col>
                <Col span={5}>
                    <FormItem
                    label="交盘时间" 
                    {...formItemLayout}                      
                    >
                        {getFieldDecorator(
                            'crossdate',
                            {initialValue : ''}
                        )(
                            <Input></Input>
                        )}  
                    </FormItem>
                </Col> 
                <Col span={5}>
                    <FormItem
                            {...formItemLayout}
                            label="托收批次"
                        >
                            {getFieldDecorator(
                                'batch',
                                {
                                    initialValue : ''
                                }
                            )(
                                <Input></Input>
                            )}
                    </FormItem>           
                </Col>
                <Col  span={3}>
                <Button
                    style={{ marginTop: 4 }} 
                    type="primary"
                    onClick={this.handleUpload}
                    disabled={this.state.fileList.length === 0}
                    loading={uploading}
                    >
                    {uploading ? '读盘中...' : '读盘' }
                </Button>
                </Col> 

            </Row>
        </Form>
        );
    }
    render() {
       
        return (  
            <div>
                <div className="ant-row" style={{marginTop:20}}>                
                    <div className='console-title-border console-title'>
                        <div className="pull-left">
                            <h5>读取回盘窗口</h5>
                        </div>
                    </div>
                    {this.renderAdvancedForm()}
                    <Divider></Divider>
                </div>
        </div>
        );
    }


}

InputDisk.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let inputDisk = Form.create({})(InputDisk);


const mapStateToProps = (state) => {
    const { user } = state.auth;     
    return {    
        user 
    };
};

export default withRouter(connect(mapStateToProps, null)(inputDisk))




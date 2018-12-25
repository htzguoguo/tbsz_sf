import React, { Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    Button, message,  
    notification,  
    Divider,   Row, Icon, Input,
    Select, Form, Upload, InputNumber,
    Spin , Modal
} from 'antd';
import moment from 'moment';
import api from '../../../api';
import {handleError, showNotification} from "../../../utils/notification";
import {getAuthString} from '../../../utils/loginSession';
import styles from './index.less';

const { TextArea, Search } = Input;
const FormItem = Form.Item;
const Dragger = Upload.Dragger;
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};
class UploadFiles extends Component {
    constructor(props){
        super(props);
        this.state = {            
            loading1: false,
            loading2: false,
        };
    }

    onSearch = () => {
        //e.preventDefault();        
        this.props.form.validateFields(['编号'], (err, values) => {
            if(!values.编号 || values.编号.length !== 4 || !isFinite(values.编号)) {
                showNotification('error', '输入的编号不正确，请重新输入！');                
                return;
            }
            this.setState({loading1 : true}); 
            let num = values.编号;
            api.get(`unit/units/${num}`, {            
            responseType: 'json'
            }).then((data) => {
                let units = data.data;
                //this.props.form.resetFields();       
                this.props.form.setFieldsValue(units[0]);
                notification.success({
                    message: '提示',
                    description: `成功获取用水企业数据`,
                    duration: 3,
                });
            }).catch(
                err => { 
                    //this.props.form.resetFields();
                    notification.error({
                        message: '提示',
                        description: `没有满足条件的记录,请重试。`,
                        duration: 3,
                    });
                }
            );
        });
    }

    onUploadFiles = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            let files = values.fileList;           
            values.files = files.map(
                file => file.response.name
            );
            values.fileList =  files.map(
                file => file.name
            );
            values.user = this.props.user.姓名;
            this.setState({
            uploading2: true,
            });
            api.post(`contract/files`, 
                values,
                {            
                    responseType: 'json'
            }).then((data) => {
                data = data.data;
                this.setState({uploading2: false});   
                showNotification('success', '资料保存成功！');        
            }).catch(
                error => {
                    this.setState({uploading2: false});  
                    this.handleError() ; 
                }
            );
        });
    }

    renderUploadForm = () => {
        const { getFieldDecorator } = this.props.form;
        const { uploading} = this.state;
        let self = this;        
        const props = {
            name: 'file',
            action: 'api/v1/upload',
            multiple: false,
            headers: {
                authorization: getAuthString(),
            },
            onChange(info) {
                // if (info.file.status !== 'uploading') {
                // }
                if (info.file.status === 'done') {
                    message.success(`文件上传成功.`);
                } else if (info.file.status === 'error') {
                    message.error(`文件上传失败.`);
                }
            },
            onRemove: (file) => {
                this.setState(({ list }) => {
                const index = list.indexOf(file);
                const newFileList = list.slice();
                newFileList.splice(index, 1);
                return {
                    list: newFileList,
                };
                });
            },
            beforeUpload: (file) => {
                let Filename = file.name.split('.')[0];
                let name = this.props.form.getFieldValue('名称');
                if(!name || name.length === 0) {
                    this.props.form.setFieldsValue({
                        名称 : Filename
                    });
                }
                this.setState(({ list }) => ({
                    list: [file],
                }));
                return true;
            },
            fileList: this.state.list,
        }; 
        return (
            <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">点击或者拖拽需要上传的文件</p>
                <p className="ant-upload-hint">在上传尺寸较大的文件之前,请先压缩</p>
            </Dragger>
        );
    }

    normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const _self = this;
        return (           
            <div className="ant-row" style={{marginTop:20}}>                             
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>企业资料上传</h5>
                    </div>
                </div>
                <Form  style={{maxWidth : '800px'}}>
                    <FormItem
                        {...formItemLayout}
                        label="编号"
                    >
                        {getFieldDecorator(
                            '编号',
                            {
                                initialValue : '0002',
                                rules: [{
                                    required: true, message: '请输入要搜索的企业编号!',
                                }]                                             
                            },
                    )(
                        <Search
                            placeholder="请输入企业编号"
                            loading={this.state.loading1}
                            enterButton="搜索"
                            onSearch={this.onSearch}
                        />                              
                        )}
                    </FormItem>
                    <FormItem
                    {...formItemLayout}
                    label="户名"
                    >
                        {getFieldDecorator(
                            '户名',
                            {
                                rules: [{
                                    required: true, message: '请输入户名!',
                                }] ,
                                                                            
                            }
                        )(
                            <Input  placeholder="" />
                        )}
                    </FormItem>
                    <FormItem
                    {...formItemLayout}
                    label="文档名称"
                    >
                        {getFieldDecorator(
                            '名称',
                            {
                                rules: [{
                                    required: true, message: '请输入资料名称!',
                                }] ,
                                                                            
                            }
                        )(
                            <Input  placeholder="" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="文档分类"
                    >
                        {getFieldDecorator(
                            '分类',
                            {
                                rules: [{
                                    required: true, message: '请输入资料分类!',
                                }]                                             
                            }
                        )(
                            <Input  placeholder=""/>
                        )}
                    </FormItem>
                    <FormItem
                    {...formItemLayout}
                    label="文档备注"
                    >
                        {getFieldDecorator('备注')(
                            <TextArea addonBefore="备注:" rows={4} />
                        )}
                    </FormItem>
                    <FormItem
                    {...formItemLayout}
                    label="文档"
                    >
                        {/* {_self.renderUploadForm()} */}
                        {getFieldDecorator('fileList',
                            {
                                valuePropName: 'fileList',
                                getValueFromEvent: this.normFile,
                                rules: [{
                                    required: true, message: '请添加文档资料!',
                                }] ,
                            }
                        )(
                            _self.renderUploadForm()
                        )}
                    </FormItem>
                    <Divider></Divider>
                    <FormItem
                        wrapperCol = {{span: 6, offset : 12}}
                    >                        
                        <Button type="primary" loading={this.state.loading2} onClick={this.onUploadFiles} icon="upload">保存文档</Button>
                    </FormItem>
                </Form>   
            </div>
        );
    }
}

UploadFiles.propTypes = {
    form: PropTypes.object,
    user : PropTypes.object
};

let form = Form.create({})(UploadFiles);
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
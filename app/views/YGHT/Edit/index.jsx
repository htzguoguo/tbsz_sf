import React, { Component } from 'react';
import {
    Button, Form, Input,
    Select,  notification, InputNumber, Icon } from 'antd';
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
import api from '../../../api';


class ItemEdit extends Component{
    constructor(props) {
        super(props);
        this.key = props.match.params.key;

    }

    componentDidMount() {
        if (this.key !== '0') {
            api.get('/worktimes', {
                params: {
                    key : this.key
                },
                responseType: 'json'
            }).then((data) => {
                data = data.data;
                this.props.form.setFieldsValue(data[0]);
            });
        }
    }
    getDeptName(id) {
        switch (id) {
            case '1':
                return "天津市西菁公路养护有限公司";
                break;
            case '2':
                return "天津市双新市政公路工程有限公司";
                break;
            case '3':
                return "天津市高速公路养护有限公司";
                break;
            case '4':
                return "天津福兴公路工程有限公司";
                break;
        }
    }

    handleReset(e) {
        e.preventDefault();
        this.props.form.resetFields();
    }

    onProjectOrPriceChanged() {
       let project =  this.props.form.getFieldValue('projects');
       let price = this.props.form.getFieldValue('price');
       console.log(project, price);
       if (Number.isFinite(project) && Number.isFinite(price)) {
           this.props.form.setFieldsValue({'total' : Number(project) * Number(price)});
       }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((errors, values) => {
            if (errors) {
                notification.error({
                    message: '提示',
                    description: '输入的数据有误，您检查',
                    duration: 3,
                });
                return;
            }
            let desc = '创建养护项目成功';
            if (this.key !== '0') {
                values.key = this.key;
                desc = '编辑养护项目成功';
            }
            api.post('/worktimes',values).then((data) => {

                notification.success({
                    message: '提示',
                    description: desc,
                    duration: 3,
                });
            });
        });
    }

    render() {
        var self = this;
        const { getFieldProps,getFieldDecorator, getFieldError, isFieldValidating } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 16 },
        };

        return (

            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>{this.key !== '0'? '编辑养护项目' : '创建养护项目'}</h5>
                    </div>
                </div>
                <Form layout="horizontal" form={this.props.form}>
                    <FormItem
                        {...formItemLayout}
                        label="类别">
                        {getFieldDecorator('CaseCatalog', {
                            rules: [{
                                required: true, message: '请输入养护工程类别!',
                            }],
                        })(
                            <Input  placeholder="1标路基工程" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="巡查项目">
                        {getFieldDecorator('SubName', {
                            rules: [{
                                required: true, message: '请输入巡查项目!',
                            }],
                        })(
                            <Input  placeholder="路肩" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="损坏情况">
                        {getFieldDecorator('ViewResult', {
                            rules: [{
                                required: true, message: '请输入损坏情况!',
                            }],
                        })(
                            <Input  placeholder="损坏" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="维修方案">
                        {getFieldDecorator('DealWithDesc', {
                            rules: [{
                                required: true, message: '请输入维修方案!',
                            }],
                        })(
                            <Input  placeholder="保养路肩" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="维修质量标准要求">
                        {getFieldDecorator('FinishedStandard', {
                            rules: [{
                                required: true, message: '请输入维修质量标准要求!',
                            }],
                        })(
                            <Input  placeholder="路肩均宽按0.75米计" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="养护年份">
                        {getFieldDecorator('year', {
                            rules: [
                                {required: true, message: '请选择年份' },
                            ],
                            initialValue : '2017'
                        })(
                            <Select      placeholder="请选择年份" style={{ width: '100%' }}>
                                <Option value="2017">2017</Option>
                                <Option value="2018">2018</Option>
                                <Option value="2019">2019</Option>
                                <Option value="2020">2020</Option>
                                <Option value="2021">2021</Option>
                            </Select>
                        )}

                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="路段">
                        {getFieldDecorator('NowRouteName', {
                            rules: [{
                                required: true, message: '请输入路段!',
                            }],
                        })(
                            <Input  placeholder="天津长深北段一标" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="养护单位">
                        {getFieldDecorator('CompanyID', {
                            rules: [
                                {required: true, message: '请选择养护单位' },
                            ],
                            initialValue : '1'
                        })(
                            <Select      placeholder="请选择养护单位" style={{ width: '100%' }}>
                                <Option value="1">天津市西菁公路养护有限公司</Option>
                                <Option value="2">天津市双新市政公路工程有限公司</Option>
                                <Option value="3">天津市高速公路养护有限公司</Option>
                                <Option value="4">天津福兴公路工程有限公司</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="单位">
                        {getFieldDecorator('MonitoringUnit', {
                            rules: [
                                {required: true, message: '请选择工程计量单位' }
                            ],
                            initialValue : 'm'
                        })(
                            <Select       placeholder="请选择单位" style={{ width: '100%' }}>
                                <Option value="m">m</Option>
                                <Option value="m2">m2</Option>
                                <Option value="m3">m3</Option>
                                <Option value="次">次</Option>
                                <Option value="个"> 个</Option>
                                <Option value="根"> 根</Option>
                                <Option value="块"> 块</Option>
                                <Option value="米"> 米</Option>
                                <Option value="片"> 片</Option>
                                <Option value="套"> 套</Option>
                                <Option value="项"> 项</Option>
                                <Option value="月"> 月</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="工程量">
                        {getFieldDecorator('projects', {
                            rules: [
                                {required: true, message: '请输入工程量' }
                            ],
                            initialValue : '0'
                        })(
                            <InputNumber onBlur={this.onProjectOrPriceChanged.bind(this)}   min={0} precision={2}    style={{ width: '100%' }}/>
                        )}

                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="单价">
                        {getFieldDecorator('price', {
                            rules: [{
                                required: true, message: '请输入单价!',
                            }],
                            initialValue : '0'
                        })(
                            <InputNumber onBlur={this.onProjectOrPriceChanged.bind(this)}  min={0} precision={2}   style={{ width: '100%' }} />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="合价">
                        {getFieldDecorator('total', {
                            rules: [{
                                required: true, message: '请输入合价!',
                            }],
                            initialValue : '0'
                        })(
                            <InputNumber id="total"   min={0}      style={{ width: '100%' }}/>
                        )}
                    </FormItem>
                    <FormItem wrapperCol={{ span: 10, offset: 3 }}>
                        <Button type="primary" onClick={this.handleSubmit.bind(this)}>确定</Button>
                        &nbsp;&nbsp;&nbsp;
                        <Button type="ghost" onClick={this.handleReset.bind(this)}>重置</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
};


ItemEdit = Form.create({})(ItemEdit);

export default ItemEdit;


import React, { Component } from 'react';
import {
   Form
} from 'antd';
import api from '../../../api';
const createForm = Form.create;
const FormItem = Form.Item;

class ItemView extends Component{
    constructor(props) {
        super(props);
        this.key = props.match.params.key;
        this.state = {
            data : {}
        }
    }

    componentDidMount() {
        api.get('/worktimes', {
            params: {
                key : this.key
            },
            responseType: 'json'
        }).then((data) => {
            data = data.data;
            this.setState({
                data: data[0]
            });
        });
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

    render() {

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        return (

            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>表单系列</h5>
                    </div>
                </div>
                <Form layout="horizontal" form={this.props.form}>
                    <FormItem
                        {...formItemLayout}
                        label="类别">
                       <span>{this.state.data.ParentCatalogName}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="巡查项目">
                       <span>{this.state.data.SubName}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="损坏情况">
                       <span>{this.state.data.ViewResult}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="维修方案">
                        <span>{this.state.data.DealWithDesc}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="维修质量标准要求">
                        <span>{this.state.data.FinishedStandard}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="养护年份">
                        <span>2017</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="路段">
                        <span>{this.state.data.NowRouteName}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="养护单位">
                        <span>{this.getDeptName(this.state.data.CompanyID)}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="工程量">
                        <span>{this.state.data.projects}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="单价">
                        <span>{this.state.data.price}</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="合价">
                        <span>{this.state.data.total}</span>
                    </FormItem>
                </Form>
            </div>
        );
    }
};


ItemView = Form.create({})(ItemView);

export default ItemView;

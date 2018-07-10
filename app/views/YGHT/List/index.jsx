import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router-dom';
import {
    Table, Button, message, Icon,
    notification, Popconfirm, Tooltip,
    Divider, Input, Row, Col, Radio   } from 'antd';
import api from '../../../api';
import styles from './index.less';

const Search = Input.Search;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
let _data = [];

function cancel() {
    message.error('点击了取消');
}

// 通过 rowSelection 对象表明需要行选择
const rowSelection = {

    onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },

    onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
    },

    onSelectAll(selected, selectedRows, changeRows) {

        console.log(selected, selectedRows, changeRows);
    }
};

class ContentLists extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            pagination: {},
            loading: false,
            loading1: false,
            visible: false
        };
        this.store = {
            pagination : {},
            sorter : {},
            filters : {}
        };
        const onDelete = this.onDelete.bind(this);
        const onView = this.onView.bind(this);
        const onEdit = this.onEdit.bind(this);
        this.columns = [
            {
                title: '类别',
                dataIndex: 'ParentCatalogName',
                sorter: true,
                render: function(name){
                    let nameStr =name;
                    return(
                        <Tooltip title={nameStr}>
                            <a>{name}</a>
                        </Tooltip>
                    );
                },
                width: '25%',
            },
            {
                title: '巡查项目',
                dataIndex: 'SubName'
            },
            {
                title: '损坏情况',
                dataIndex: 'ViewResult'
            },
            {
                title: '维修方案',
                dataIndex: 'DealWithDesc'
            },
            {
                title: '操作',
                dataIndex: 'key',
                key : 'key',
                render:function(text, record, index){
                    return (
                        <span>
                            <a  onClick={onView.bind(this,text, record, index)}>查看  </a>
                            <Divider type="vertical" />
                            <a onClick={onEdit.bind(this,text, record, index)}>编辑  </a>
                            <Divider type="vertical" />
                            <Popconfirm title="确定要删除这个任务吗？" onConfirm={onDelete.bind(this,text, record, index)} onCancel={cancel}>
                                <a >删除</a>
                            </Popconfirm>
                        </span>
                    )
                } ,
                width: '25%'
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
        console.log('filters',filters,'sorter',sorter);
        this.fetch({
            results: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...filters
        });
    }
    fetch = (params = {}) => {
        this.setState({ loading: true });
        api.get('/api/v1/workitems', {
            params: {
                results: 10,
                ...params,
            },
            responseType: 'json'
        }).then((dt) => {
            let data = dt.data;
            _data = data.data;

            const pagination = this.state.pagination;
            // Read total count from server
            // pagination.total = data.totalCount;
            pagination.total = data.count;
            console.log('data', data, pagination.total);
            this.setState({
                loading: false,
                data: data.data,
                pagination,
            });
        });
    }

    addItem(){
        this.props.history.replace('/app/yght/edit/0');
    }
    handleOk() {
        this.setState({ loading1: true });
        setTimeout(() => {
            this.setState({ loading1: false, visible: false });
            console.log('ok');
            openNotification();
        }, 2000);
    }

    handleCancel() {
        this.setState({ visible: false });
    }

    componentDidMount() {
        this.fetch();
    }

    onEdit(text, record, index) {
        this.props.history.replace('/app/yght/edit/' + text);
    }

    onDelete(text, record, index) {
        api.delete('/worktimes',{ params: { key: text }}).then((data) => {
            data = data.data;
            this.fetch();
            notification.success({
                message: '提示',
                description: '记录已经删除',
                duration: 3,
            });
        });
    }

    onView(text, record, index) {
        this.props.history.replace('/app/yght/view/' + text);
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

    onSearch = (value) => {
        if (value.target) {
            this.radioFilter = value.target.value;
            if (value.target.value === 'all') {
                this.radioFilter = '';
            }
        }else {
            this.searchFilter = value.replace(/^\s+|\s+$/g,'');
        }
        console.log(this.radioFilter, this.searchFilter);
        let data = this.filter(_data, this.radioFilter);
        data = this.filter(data, this.searchFilter);
        const pagination = this.state.pagination;
        pagination.total = data.length;
        this.setState({
            filtered: !!value,
            data: data,
            pagination,
        });
    };

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
        return (
            <div className="ant-row" style={{marginTop:20}}>
                <div className='console-title-border console-title'>
                    <div className="pull-left">
                        <h5>养护项目</h5>
                    </div>
                </div>
                <Row style={{ marginBottom: 16 }} >
                    <Col span={10}>
                            <Button type="primary" onClick={this.addItem.bind(this)}>
                                <Icon type="plus" /> 创建养护项目
                            </Button>

                    </Col>
                    <Col span={8}>
                        <RadioGroup onChange={this.onDeptFilter} defaultValue="all">
                            <RadioButton value="all">全部</RadioButton>
                            <RadioButton value="1标">一标</RadioButton>
                            <RadioButton value="2标">二标</RadioButton>
                            <RadioButton value="3标">三标</RadioButton>
                            <RadioButton value="4标">四标</RadioButton>
                        </RadioGroup>
                    </Col>
                    <Col span={6}>
                        <Search
                            placeholder="请输入需要查询的巡查项目"
                            onSearch={this.onCatalogFilter}
                            enterButton
                        />
                    </Col>
                </Row>
                <Table columns={this.columns}
                       rowSelection={rowSelection}
                       rowKey={record => record.ID}
                       dataSource={this.state.data}
                       pagination={this.state.pagination}
                       loading={this.state.loading}
                       onChange={this.handleTableChange.bind(this)}
                       bordered
                       footer={()=>'共有'+this.state.pagination.total+'条记录'}
                />
            </div>
        );
    }


}

export default withRouter(ContentLists)




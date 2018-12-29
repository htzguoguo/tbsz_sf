
import React from 'react'
import PropTypes from 'prop-types'
import {  matchPath } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Layout, Row, Col, Icon, Badge, Menu, Dropdown, Avatar, Popover } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getAllMenu, updateNavPath } from '../../actions/menu'
import styles from './home.less';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const defaultProps = {
    items: []
};
const propTypes = {
    items: PropTypes.array,
    profile : PropTypes.object,
    logout : PropTypes.object,
    history : PropTypes.object,
    updateNavPath : PropTypes.func
};



class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
           
        };
    }
   
   
    render() {
       

        return(
            <div className="home">
                <div className="home-ban"></div>
                <div className="home-content" >
                        <h3>菜单MENU</h3>
                        <Row type="flex" justify="space-between">
                            <Col span={5} className="colbg">
                                <Link to="/app/toll/prepare">
                                    <div className="picon color1">
                                        <Icon type="form" />
                                    </div>
                                    <div className="ptitle">录入管理</div>
                                    <div className="pcontent">录入管理：包括创建月水费、录入企业信息、录入水贴费等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/app/search/unit">
                                    <div className="picon color2">
                                        <Icon type="file-search" />
                                    </div>
                                    <div className="ptitle">查询管理</div>
                                    <div className="pcontent">查询管理：包括创用水企业信息查询、水费综合查询、企业用水曲线图等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/app/report/commission">
                                    <div className="picon color3">
                                        <Icon type="bar-chart" />
                                    </div>
                                    <div className="ptitle">报表管理</div>
                                    <div className="pcontent">报表管理：包括委托收款报表、水费结算单、排污费收据、各种统计汇总等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/app/detail/allowance">
                                    <div className="picon color4">
                                        <Icon type="file-protect" />
                                    </div>
                                    <div className="ptitle">明细管理</div>
                                    <div className="pcontent">明细管理：包括水贴费、装表费、用水指标、供水合同、市政公司用水、公司销售水清单等功能。</div>
                                </Link>
                            </Col>
                        </Row>
                        <Row type="flex" justify="space-between">
                            <Col span={5} className="colbg">
                                <Link to="/app/collection/outputbank">
                                    <div className="picon color2">
                                        <Icon type="money-collect" />
                                    </div>
                                    <div className="ptitle">托收管理</div>
                                    <div className="pcontent">托收管理：包括按银行生成托收、按用户生成托收、打印托收信封及清单、读取回盘信息等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/app/dict/usekind">
                                    <div className="picon color5">
                                        <Icon type="book" />
                                    </div>
                                    <div className="ptitle">字典管理</div>
                                    <div className="pcontent">字典管理：包括用水形式字典、收费形式字典、抄表形式字典、费用标准字典、防火费标准字典等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/app/contract/creation">
                                    <div className="picon color6">
                                        <Icon type="copy" />
                                    </div>
                                    <div className="ptitle">文档管理</div>
                                    <div className="pcontent">文档管理：包括供水合同创建、查询、终止合同创建、终止合同查询、资料上传、资料上传等功能。</div>
                                </Link>
                            </Col>
                            <Col span={5} className="colbg">
                                <Link to="/">
                                    <div className="picon color7">
                                        <Icon type="file-protect" />
                                    </div>
                                    <div className="ptitle">退出管理</div>
                                    <div className="pcontent">退出管理：用户直接退出系统登录。</div>
                                </Link>
                            </Col>
                        </Row>
                </div>
                <div className="footer">天津容数科技发展有限公司</div>
            </div>

        )
    }

}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

function mapStateToProps(state) {
    return {
        //items: state.menu.items
    }
}

function mapDispatchToProps(dispatch) {
    return {
        //getAllMenu: bindActionCreators(getAllMenu, dispatch),
        updateNavPath: bindActionCreators(updateNavPath, dispatch)
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header))




import React from 'react'
import PropTypes from 'prop-types'
import {  matchPath } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Layout, Row, Col, Icon, Badge, Menu, Dropdown, Avatar, Popover } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { getAllMenu, updateNavPath } from '../../actions/menu'
import styles from './home.less';
import {G2,Chart,Geom,Axis,Tooltip,Coord,Label,Legend,View,Guide,Shape,Facet,Util} from "bizcharts";
import DataSet from "@antv/data-set";
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
        const data = [
            {
              name: "计划水费",
              "Jan.": 18.9,
              "Feb.": 28.8,
              "Mar.": 39.3,
              "Apr.": 81.4,
              May: 47,
              "Jun.": 20.3,
              "Jul.": 24,
              "Aug.": 35.6
            },
            {
              name: "实收水费",
              "Jan.": 12.4,
              "Feb.": 23.2,
              "Mar.": 34.5,
              "Apr.": 99.7,
              May: 52.6,
              "Jun.": 35.5,
              "Jul.": 37.4,
              "Aug.": 42.4
            }
          ];

          const ds = new DataSet();
          const dv = ds.createView().source(data);
          dv.transform({
            type: "fold",
            fields: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug."],
            // 展开字段集
            key: "月份",
            // key字段
            value: "月均水费" // value字段
          });

          const data1 = [
            {
              month: "1月",
              value: 0
            },
            {
              month: "2月",
              value: 0
            },
            {
              month: "3月",
              value: 0
            },
            {
                month: "4月",
              value: 0
            },
            {
                month: "5月",
              value: 0
            },
            {
                month: "6月",
              value: 0
            },
            {
                month: "7月",
              value: 0
            },
            {
                month: "8月",
              value: 14.55
            },
            {
                month: "9月",
              value:14.55
            },
            {
                month: "10月",
              value: 14.55
            },
            {
                month: "11月",
              value:14.55
            },
            {
                month: "12月",
              value: 14.55
            }
            
          ];
          const cols = {
            value: {
              min: 0
            },
            month: {
              range: [0, 1]
            }
          }

          const data2 = [
            {
              label: "玉和田",
              计划用水量: 2800,
              实际用水量: 2260
            },
            {
              label: "给水加压站",
              计划用水量: 1800,
              实际用水量: 1300
            },
            {
              label: "中信物流",
              计划用水量: 950,
              实际用水量: 900
            },
            {
              label: "起步区雨污水泵站",
              计划用水量: 500,
              实际用水量: 390
            },
            {
              label: "天津港国际物流",
              计划用水量: 170,
              实际用水量: 100
            }
          ];
          const dss = new DataSet();
          const dvv = ds.createView().source(data2);
          dvv.transform({
            type: "fold",
            fields: ["计划用水量", "实际用水量"],
            // 展开字段集
            key: "type",
            // key字段
            value: "value" // value字段
          });

        return(
            <div className="contentgutter">
                <Row gutter={16} className="guttericon">
                    <Col className="gutter-row" span={6}>
                        <div className="gutter-box card-warning">
                            <Row>
                                <Col span={10}>
                                    <div className="text-center">
                                        <Icon type="warning" />
                                        {/* <i className="anticon exclamation-circle"></i> */}
                                    </div>
                                </Col>
                                <Col span={14}>
                                    <div className="numbers">
                                        <p className="card-txt">欠款企业</p>
                                        <h4 className="card-title">050</h4>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <div className="gutter-box card-success">
                            <Row>
                                <Col span={10}>
                                    <div className="text-center">
                                        <Icon type="property-safety" />
                                        {/* <i className="anticon exclamation-circle"></i> */}
                                    </div>
                                </Col>
                                <Col span={14}>
                                    <div className="numbers">
                                        <p className="card-txt">用水企业水费</p>
                                        <h4 className="card-title">2725512</h4>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <div className="gutter-box card-danger">
                            <Row>
                                <Col span={10}>
                                    <div className="text-center">
                                        <Icon type="strikethrough" />
                                        {/* <i className="anticon exclamation-circle"></i> */}
                                    </div>
                                </Col>
                                <Col span={14}>
                                    <div className="numbers">
                                        <p className="card-txt">崔缴企业</p>
                                        <h4 className="card-title">050</h4>
                                    </div>
                                </Col>
                            </Row>                  
                        </div>
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <div className="gutter-box card-primary">
                            <Row>
                                <Col span={10}>
                                    <div className="text-center">
                                        <Icon type="bank" />
                                        {/* <i className="anticon exclamation-circle"></i> */}
                                    </div>
                                </Col>
                                <Col span={14}>
                                    <div className="numbers">
                                        <p className="card-txt">托收企业</p>
                                        <h4 className="card-title">050</h4>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" span={8}>
                        <div className="card gutter-box">
                            <div className="card-header">
                                <h5 className="card-category">2018年计划与实收水费对比</h5>
                                <h4 className="card-title">2018年水费统计表</h4>
                            </div>
                            <div className="card-body">
                                <Chart height={350} data={dv} forceFit>
                                    <Axis name="月份" />
                                    <Axis name="月均水费" />
                                    <Legend />
                                    <Tooltip
                                        crosshairs={{
                                        type: "y"
                                        }}
                                    />
                                    <Geom
                                        type="interval"
                                        position="月份*月均水费"
                                        color={"name"}
                                        adjust={[
                                        {
                                            type: "dodge",
                                            marginRatio: 1 / 32
                                        }
                                        ]}
                                    />
                                </Chart>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div className="card gutter-box">
                            <div className="card-header">
                                <h5 className="card-category">企业用水量</h5>
                                <h4 className="card-title">2018年12月企业用水量</h4>
                            </div>
                            <div className="card-body">
                                <table class="table">
                                    <thead className="text-warning">
                                        <tr>
                                            <th>编号</th>
                                            <th>户名</th>
                                            <th>上月表底</th>
                                            <th>这月表底</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>053</td>
                                            <td>玉和田环境发展集团股份有限公司天津分公司</td>
                                            <td>8248</td>
                                            <td>8248</td>
                                        </tr>
                                        <tr>
                                        <td>053</td>
                                            <td>中信物流(天津)有限公司</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>054</td>
                                            <td>天保市政有限公司（给水加压泵站）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天保市政有限公司（起步区雨污水泵站）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津市世茂国际贸易有限公司</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津港国际物流发展有限公司（市政）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津港国际物流发展有限公司（市政）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天保市政有限公司（六号汪子厕所）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div className="card gutter-box">
                            <div className="card-header">
                                <h5 className="card-category">玉禾田环境发展集团股份有限公司天津分公司</h5>
                                <h4 className="card-title">2018年崔缴水费</h4>
                            </div>
                            <div className="card-body">
                                <Chart height={350} data={data1} scale={cols} forceFit>
                                    <Axis name="month" />
                                    <Axis name="value" />
                                    <Tooltip
                                        crosshairs={{
                                        type: "y"
                                        }}
                                    />
                                    <Geom type="line" position="month*value" size={2} />
                                    <Geom
                                        // color={["month", ["#4ECB73"]]}
                                        type="point"
                                        position="month*value"
                                        size={4}
                                        shape={"circle"}
                                        style={{
                                        stroke: "#fff",
                                        lineWidth: 1
                                        }}
                                    />
                                </Chart>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <div className="card gutter-box">
                            <div className="card-header">
                                <h5 className="card-category">2018年12月</h5>
                                <h4 className="card-title">崔缴企业汇总</h4>
                            </div>
                            <div className="card-body">
                            <table class="table">
                                    <thead className="text-warning">
                                        <tr>
                                            <th>编号</th>
                                            <th>户名</th>
                                            <th>用水量</th>
                                            <th>水费合计</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>053</td>
                                            <td>玉和田环境发展集团股份有限公司天津分公司</td>
                                            <td>15</td>
                                            <td>14.5</td>
                                        </tr>
                                        <tr>
                                        <td>053</td>
                                            <td>中信物流(天津)有限公司</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>054</td>
                                            <td>天保市政有限公司（给水加压泵站）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天保市政有限公司（起步区雨污水泵站）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津市世茂国际贸易有限公司</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津港国际物流发展有限公司（市政）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天津港国际物流发展有限公司（市政）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                        <tr>
                                            <td>055</td>
                                            <td>天保市政有限公司（六号汪子厕所）</td>
                                            <td>14.55</td>
                                            <td>33772.9</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <div className="card gutter-box">
                            <div className="card-header">
                                <h5 className="card-category">2018年全年用水量</h5>
                                <h4 className="card-title">崔缴企业全年用水量</h4>
                            </div>
                            <div className="card-body">
                                <Chart height={350} data={dvv} forceFit>
                                    <Legend />
                                    <Coord transpose scale={[1, -1]} />
                                    <Axis
                                        name="label"
                                        label={{
                                        offset: 12
                                        }}
                                    />
                                    <Axis name="value" position={"right"} />
                                    <Tooltip />
                                    <Geom
                                        type="interval"
                                        position="label*value"
                                        color={"type"}
                                        adjust={[
                                        {
                                            type: "dodge",
                                            marginRatio: 1 / 32
                                        }
                                        ]}
                                    />
                                </Chart>
                            </div>
                        </div>
                    </Col>
                </Row>
               
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

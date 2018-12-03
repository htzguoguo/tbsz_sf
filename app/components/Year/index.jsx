import React, { Component} from 'react';
import {
    Select
} from 'antd';
const Option = Select.Option;
export default () => {
    return <Select
    defaultValue={new Date().getFullYear()}
    placeholder="年份"                                        
    style={{ width : '100px',   marginRight : '5px' }}>
    <Option value="2003">2003</Option>
    <Option value="2004">2004</Option>
    <Option value="2005">2005</Option>
    <Option value="2006">2006</Option>
    <Option value="2007">2007</Option>
    <Option value="2008">2008</Option>
    <Option value="2009">2009</Option>
    <Option value="2010">2010</Option>
    <Option value="2011">2011</Option>
    <Option value="2012">2012</Option>
    <Option value="2013">2013</Option>
    <Option value="2014">2014</Option>
    <Option value="2015">2015</Option>
    <Option value="2016">2016</Option>                            
    <Option value="2017">2017</Option>
    <Option value="2018">2018</Option>
    <Option value="2019">2019</Option>
    <Option value="2020">2020</Option>
    <Option value="2021">2021</Option>
</Select>
}


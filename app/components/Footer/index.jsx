import React from 'react'

import { Layout } from 'antd'

import './index.less'

const { Footer } = Layout;

export default class commonFooter extends React.Component {
    constructor () {
        super()
    }

    render () {

        return (
            <Footer style={{ textAlign: 'center' }}>
                天津容数科技 版权所有 © 2017 www.tjxrs.cn
            </Footer>
        )
    }
}

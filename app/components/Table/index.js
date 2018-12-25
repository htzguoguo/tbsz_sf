
//width=3270
export const  feeColumns = [
  {
    title: '编号',
    dataIndex: '编号',
    key: '编号', 
    width: 90,
    fixed: 'left',               
    sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
  },
  {
      title: '户名',
      dataIndex: '户名',
      width: 300,
      sorter: (a, b) => a.户名.length - b.户名.length,
  },
  {
    title: '用水地点',
    dataIndex: '装表地点',
    width: 150,
  },
  {
    title: '上月表底',
    dataIndex: '上月表底',
    width: 150,
    sorter: (a, b) => parseFloat(a.上月表底) - parseFloat(b.上月表底)  
  },
  {
    title: '本月表底',
    dataIndex: '本月表底',
    width: 150,
    className: 'special-field',
    editable: true,
    sorter: (a, b) => parseFloat(a.本月表底) - parseFloat(b.本月表底),
  }, 
  {
    title: '用水量',
    dataIndex: '用水量',
    width: 150,
    editable: true,
    sorter: (a, b) => parseFloat(a.用水量) - parseFloat(b.用水量)  
  },
  {
    title: '计划水量',
    dataIndex: '计划水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.计划水量) - parseFloat(b.计划水量)  
  },
  {
    title: '单价',
    dataIndex: '单价',
    width: 120,
  }, 
  {
      title: '计划水费',
      dataIndex: '计划水费',
      width: 150,
      sorter: (a, b) => parseFloat(a.计划水费) - parseFloat(b.计划水费)  
  },
  {
    title: '超额水量',
    dataIndex: '超额水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水量) - parseFloat(b.超额水量)  
  },
  {
    title: '超计划',
    dataIndex: '超计划',
    width: 120,
  },
  {
    title: '超额水费',
    dataIndex: '超额水费',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水费) - parseFloat(b.超额水费)  
  },
  {
    title: '防火费',
    dataIndex: '防火费',
    width: 120,
  },
  {
    title: '手续费',
    dataIndex: '手续费',
    width: 120,
  },
  {
    title: '实缴排污费',
    dataIndex: '排污费',
    width: 120,
    className: 'special-field',
  },
  {
    title: '其它',
    dataIndex: '其它',
    width: 120,
  },
  {
      title: '应收水费',
      dataIndex: '应收水费', 
      width: 120,              
  },
  {
      title: '减免水量',
      dataIndex: '减免水量',
      width: 120,
      editable: true,
      className: 'special-field',
  },
  {
    title: '减免单价',
    dataIndex: '减免单价',
    width: 120,
    editable: true,
    className: 'special-field',
  },
  {
    title: '减免水费',
    dataIndex: '减免水费',
    width: 120,
  }, 
  {
    title: '减排污费',
    dataIndex: '减排污费',
    width: 120,
  },
  {
    title: '减其它',
    dataIndex: '减其它',
    width: 120,
    className: 'special-field',
  }, 
  {
    title: '水费合计',
    width: 120,
    render: (value, row, index) => parseFloat(row['实收水费'] - row['排污费']).toFixed(2)
  }, 
  {
    title: '实收水费',
    dataIndex: '实收水费',
    width: 120,
    
  },
];

//width=1950
export const  chargeYearlyByMeterColumns = [
  {
    title: '编号',
    dataIndex: '编号',
    key: '编号', 
    width: 90,
    sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
  },
  {
      title: '户名',
      dataIndex: '户名',
      width: 300,
      sorter: (a, b) => a.户名.length - b.户名.length,
  },
  {
    title: '年份',
    dataIndex: '年',
    width: 90,
  },
  {
    title: '装表地点',
    dataIndex: '装表地点',
    width: 150,
  },
  {
    title: '实际用水量',
    dataIndex: '实际用水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.实际用水量) - parseFloat(b.实际用水量)  
  },
  {
    title: '实际计划水费',
    dataIndex: '实际计划水费',
    width: 150,
    sorter: (a, b) => parseFloat(a.实际计划水费) - parseFloat(b.实际计划水费),
  }, 
  {
    title: '超额水量',
    dataIndex: '超额水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水量) - parseFloat(b.超额水量)  
  },
  {
    title: '超额水费',
    dataIndex: '超额水费',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水费) - parseFloat(b.超额水费)  
  },
  {
    title: '防火费',
    dataIndex: '防火费',
    width: 120,
  }, 
  {
      title: '手续费',
      dataIndex: '手续费',
      width: 120,
  },
  {
    title: '实缴排污费',
    dataIndex: '排污费',
    width: 120,
  },
  {
    title: '其它',
    dataIndex: '其它',
    width: 120,
  },
  {
    title: '减水费',
    dataIndex: '减水费',
    width: 120,
  },
  {
    title: '实收水费',
    dataIndex: '实收水费',
    width: 120,
  },
];

//width=1710
export const  chargeYearlyByCorpColumns = [
  {
      title: '户名',
      dataIndex: '户名',
      width: 300,
      sorter: (a, b) => a.户名.length - b.户名.length,
  },
  {
    title: '年份',
    dataIndex: '年',
    width: 90,
  },
  {
    title: '实际用水量',
    dataIndex: '实际用水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.实际用水量) - parseFloat(b.实际用水量)  
  },
  {
    title: '实际计划水费',
    dataIndex: '实际计划水费',
    width: 150,
    sorter: (a, b) => parseFloat(a.实际计划水费) - parseFloat(b.实际计划水费),
  }, 
  {
    title: '超额水量',
    dataIndex: '超额水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水量) - parseFloat(b.超额水量)  
  },
  {
    title: '超额水费',
    dataIndex: '超额水费',
    width: 150,
    sorter: (a, b) => parseFloat(a.超额水费) - parseFloat(b.超额水费)  
  },
  {
    title: '防火费',
    dataIndex: '防火费',
    width: 120,
  }, 
  {
      title: '手续费',
      dataIndex: '手续费',
      width: 120,
  },
  {
    title: '实缴排污费',
    dataIndex: '排污费',
    width: 120,
  },
  {
    title: '其它',
    dataIndex: '其它',
    width: 120,
  },
  {
    title: '减水费',
    dataIndex: '减水费',
    width: 120,
  },
  {
    title: '实收水费',
    dataIndex: '实收水费',
    width: 120,
    render: (value, row, index) => parseFloat(value).toFixed(2)
  },
];


//width=3210
export const  unitColumns = [
  {
    title: '编号',
    dataIndex: '编号',
    key: '编号', 
    width: 90,
    fixed: 'left',               
    sorter: (a, b) => parseInt(a.编号) - parseInt(b.编号)                 
  },
  {
      title: '户名',
      dataIndex: '户名',
      width: 300,
      sorter: (a, b) => a.户名.length - b.户名.length,
  },
  {
    title: '装表地点',
    dataIndex: '装表地点',
    width: 150,
  },
  {
    title: '申请水量',
    dataIndex: '申请水量',
    width: 150,
    sorter: (a, b) => parseFloat(a.申请水量) - parseFloat(b.申请水量)  
  },
  {
    title: '剩余水量',
    dataIndex: '剩余水量',
    width: 120,
  }, 
  {
    title: '开户行行名',
    dataIndex: '开户行行名',
    width: 120,
  },
  {
    title: '帐号',
    dataIndex: '帐号',
    width: 120,
  },
  {
    title: '联系人',
    dataIndex: '联系人',
    width: 120,
  }, 
  {
      title: '装表费',
      dataIndex: '装表费',
      width: 120,
  },
  {
    title: '电话',
    dataIndex: '电话',
    width: 120,
  },
  {
    title: '用水日期',
    dataIndex: '用水日期',
    width: 120,
  },
  {
    title: '使用期限',
    dataIndex: '使用期限',
    width: 120,
  },
  {
    title: '装表日期',
    dataIndex: '装表日期',
    width: 120,
  },
  {
    title: '水贴费状态',
    dataIndex: '水贴费状态',
    width: 120,
  },
  {
    title: '水贴费',
    dataIndex: '水贴费',
    width: 120,
  },
  {
    title: '管径',
    dataIndex: '管径',
    width: 120,
  },
  {
      title: '单位性质',
      dataIndex: '单位性质', 
      width: 120,              
  },
  {
      title: '用水形式',
      dataIndex: '用水形式',
      width: 120,
  },
  {
    title: '抄表形式',
    dataIndex: '抄表形式',
    width: 120,
  },
  {
    title: '区号',
    dataIndex: '区号',
    width: 120,
  }, 
  {
    title: '单价',
    dataIndex: '单价',
    width: 120,
  },
  {
    title: '收费形式',
    dataIndex: '收费形式',
    width: 120,
  }, 
  {
    title: '定额',
    dataIndex: '定额',
    width: 120,
  },
  {
    title: '节门状态',
    dataIndex: '节门状态',
    width: 120,
  },
  {
    title: '扣水单位编号',
    dataIndex: '扣水单位编号',
    width: 120,
  },
];
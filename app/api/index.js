/**
 * Created by Administrator on 2017-12-14.
 */
const axios = require('axios');
var MockAdapter = require('axios-mock-adapter');
import {authExpire} from '../utils/notification';
var normalAxios = axios.create({
  baseURL: '/api/v1'
});
var mockAxios = axios.create();
var workItems = require('./mock/workItems');

axios.defaults.headers.Authorization =  sessionStorage.getItem( 'token');

normalAxios.interceptors.response.use(
  response => {   
    return response;
  }, 
  error => {     
    if (401 === error.response.status) {  
      authExpire(
        () => window.location.replace('/#login')
      );
    }
    return Promise.reject(error);
});

// mock 数据
var mock = new MockAdapter(mockAxios);

mock.onPut('/login').reply(config => {
   
  let postData = JSON.parse(config.data).data;
  if (postData.user === 'admin' && postData.password === '123456') {
    return [200, require('./mock/user') ];
  } else {
    return [500, {message: "用户名或密码错误"} ];
  }
});
mock.onGet('/logout').reply(200, {});
mock.onGet('/my').reply(200, require('./mock/user'));
mock.onGet('/menu').reply(200, require('./mock/menu'));

mock.onGet('/worktimes').reply(config => {
  let { key } = config.params;
  if (key) {
    return [200, workItems.items.filter(item => item.key === key)]
  }else {
   return [200, workItems.items]
  }
});
mock.onPost('/worktimes').reply(config => {
  let item = JSON.parse(config.data);
  item.ParentCatalogName = item.CaseCatalog;
  if (item.key) {
    workItems.items = workItems.items.map(tt => tt.key === item.key ? item : tt);
    return [200,  { code: 200, msg: '编辑成功', item }]
  }else {
    item.key = (Number(workItems.items[workItems.items.length-1].key) + 1).toString();
    workItems.items.push(item);
    return [200, { code: 200, msg: '添加成功', item }]
  }
});

mock.onDelete('/worktimes').reply(config => {
  let { key } = config.params;
   
  workItems.items = workItems.items.filter(item => item.key !== key);
   
  return [200, {
    result: true
  }];
});
mock.onGet('/randomuser').reply((config) => {
  return new Promise(function(resolve, reject) {
    normalAxios.get('https://randomuser.me/api', {
      params: {
        results: 10,
        ...config.params,
      },
      responseType: 'json'
    }).then((res) => {
      resolve([200, res.data ]);
    }).catch((err) => {
      resolve([500, err ]);
    });
  });
});

export default normalAxios;

import {notification, Modal, Button} from 'antd';
const confirm = Modal.confirm;
let isShow = true;
export function authExpire(cb) {
    if (isShow) {
        isShow = false;
        confirm({
                title: '系统提示',
                content: '您的登陆认证已经过期，请点击[确定]重新登录',
                okText : "确认",
                cancelText : "取消",
                onOk() {
                    isShow = true;
                    cb();
                },
                onCancel() { 
                    isShow = true;          
                },
            });
    }
    
}

export function showNotification(type, desc){
    notification[type]({ 
        message: '提示',            
        description: desc,
        duration: 3,
    });
}

export function handleError (error) {
    if(error.response.status === 404) {
        showNotification('warning', '没有发现相关的记录!');
    }
}
let crypto = require('crypto');
let commonConfig = require('../config/common-prod');

let common = {};

common.now = function () {
    return (new Date()).Format("yyyy-MM-dd hh:mm:ss");
};

common.log = function (content, extra) {
    let data = '[' + common.now() + '] ' + content + (extra ? ' extra:' + JSON.stringify(extra) : '');
    console.log(data);
};

// 权限校验
common.authValid = function (token, roomId) {
    let psw = commonConfig.PSW_MAP[roomId];
    // 没密码 或者 跟配置的相等
    return !psw || psw === token;
};

// 是否发送邮件
common.mailNotify = function (roomId, userName) {
    let arr = commonConfig.MAIL_NOTIFY_IGNORE[roomId];
    let isIgnore = arr && arr.indexOf(userName) > -1;
    return commonConfig.MAIL_NOTIFY && !isIgnore;
};

/**
 * md5
 * @param str 需要md5的字符串
 * @returns {PromiseLike<ArrayBuffer>}
 */
common.cryptMd5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = common;
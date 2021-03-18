module.exports = {
    // 是否启用邮件通知
    MAIL_NOTIFY: false,
    // 邮件通知忽略 key-房间号 value-用户名数组
    MAIL_NOTIFY_IGNORE: {
        '666': ['啦啦啦'],
    },
    // 房间密码配置：key-房间号 value-密码md5值
    PSW_MAP: {
        '666': 'a9b8123364d9d82d91231b357b111236',
    },
    // redis配置前缀
    REDIS_KEY_PREFIX: {
        'upload':'UPLOAD_FILE:',
        'chatroom':'DDMMCHATROOM-V2:',
    },
    // 默认房间名
    DEFAULT_ROOM_ID: 'hello'
};
module.exports = {
    HOST: "smtp.163.com",// SMTP服务器地址
    PORT: 465,
    SECURE: true, // use TLS
    AUTH_USER: "xxx@163.com",// 邮箱地址
    AUTH_PASS: "xxx",// 邮箱授权码 163邮箱去[授权密码管理]处新增一个授权码
    DEFAULT_FROM: "xxx@163.com",// 默认发送的邮箱
    DEFAULT_TO: ["xxx@qq.com"],// 默认接收的邮箱，可指定多个
};
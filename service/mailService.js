let mailService = {};
let nodemailer = require('nodemailer');
let mailConfig = require('../config/mail-prod');

// 参考 https://nodemailer.com/smtp/

let transporter = nodemailer.createTransport({
    host: mailConfig.HOST,
    port: mailConfig.PORT,
    secure: mailConfig.SECURE, // use TLS
    auth: {
        user: mailConfig.AUTH_USER,
        pass: mailConfig.AUTH_PASS
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

mailService.sendText = function (msg, title) {
    if (!msg) {
        return console.log('Chatroom Mail Message Sent Error: %s', "Empty Msg");
    }
    let mailMessage = {
        from: mailConfig.DEFAULT_FROM,
        to: mailConfig.DEFAULT_TO,
        subject: title ? title : 'CHATROOM MAIL',
        text: msg,
        // html: "<p>HTML version of the message</p>"
    };
    transporter.sendMail(mailMessage, (error, info) => {
        if (error) {
            return console.log('Chatroom Mail Message Sent Error: %s', error);
        }
        // console.log('Message Sent: %s', info.messageId);
    });
};


module.exports = mailService;
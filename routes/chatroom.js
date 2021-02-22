var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('<h1>请在链接中的chatroom后面加房间号，如房间号为666，则为<a href="http://139.196.97.20:8886/chatroom/666">http://139.196.97.20:8886/chatroom/666</a></h1>');
});

router.get('/:roomId', function (req, res, next) {
    let roomId = req.params.roomId;
    res.render('chatroom', {'title': '房间号: ' + roomId, 'roomId': roomId});
});

module.exports = router;

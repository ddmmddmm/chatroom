var express = require('express');
var router = express.Router();
let commonConfig = require('../config/common-prod');

router.get('/', function (req, res, next) {
    let roomId = commonConfig.DEFAULT_ROOM_Id;
    res.render('chatroom', {'title': '房间号: ' + roomId, 'roomId': roomId});
});

router.get('/:roomId', function (req, res, next) {
    res.render('chatroom', {'title': '房间号: ' + roomId, 'roomId': roomId});
});

module.exports = router;

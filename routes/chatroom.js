var express = require('express');
var router = express.Router();
let commonConfig = require('../config/common-prod');

router.get('/', function (req, res, next) {
    let roomId = commonConfig.DEFAULT_ROOM_ID;
    res.render('chatroom', {'title': '房间号: ' + roomId, 'roomId': roomId});
});

module.exports = router;

let common = require('./common');
let redis = require('./redis');
let mailService = require('./mailService');
let commonConfig = require('../config/common-prod');
let chatroom = function (io) {
    redis.init(function () {
        let channelConfig = {
            common: 'chat message',// 公共消息（客户端服务端都是推 + 拉）
            first: 'chat first',// 客户端首次连接信息（客户端推，服务端拉）
            init: 'chat init',// 推送消息记录（客户端拉，服务端推）
            online: 'chat online',// 推送在线列表（客户端拉，服务端推）
        };
        let errorTypeConfig = {
            notAuth: 'AUTHENTICATION ERROR',
            notRoomId: 'ROOM ID EMPTY ERROR',
        };
        let chatroomPrefix = 'DDMMCHATROOM-V2:';
        let redisConfig = {
            msg: chatroomPrefix + 'msg-20191130-002:',
        };
        let onlineObj = {};

        let getKey = function (key, roomId) {
            return key + roomId;
        };


        /**
         * 中间件
         * 校验指定需要密码的房间的密码
         * https://socket.io/docs/server-api/
         * Registers a middleware, which is a function that gets executed for every incoming Socket, and receives as parameters the socket and a function to optionally defer execution to the next registered middleware.
         * Errors passed to middleware callbacks are sent as special error packets to clients.
         */
        /*io.use((socket, next) => {
            let token = socket.handshake.query.token;
            let roomId = socket.handshake.query.roomId;
            if (!roomId) {
                return next(new Error(errorTypeConfig.notRoomId));
            }
            if (common.authValid(token, roomId)) {
                return next();
            }
            return next(new Error(errorTypeConfig.notAuth));
        });*/

        io.on('connection', function (socket) {
            // let socketId = socket.id;
            let myName = '';
            let roomId = socket.handshake.query.roomId;
            let remoteAddress = 'UNKNOWN';
            let userAgent = 'UNKNOWN';
            try {
                remoteAddress = socket.request.connection.remoteAddress || 'UNKNOWN';
                userAgent = socket.request.headers['user-agent'] || 'UNKNOWN';
            } catch (e) {
                console.error(e);
            }
            let socketLog = function (content, extra) {
                let info = '[name:' + (myName ? myName : '-') + '] ' + '[roomId:' + (roomId ? roomId : '-') + '] ';
                common.log(info + content, extra);
            };

            if (!roomId) {
                socketLog('room id empty!', {remoteAddress: remoteAddress, userAgent: userAgent});
                return;
            }
            socketLog('a user connected ', {remoteAddress: remoteAddress, userAgent: userAgent});

            // 首次进来
            socket.on(channelConfig.first, function (info) {
                // 名字 房间号
                myName = info.name;
                // roomId = info.roomId;
                info.remoteAddress = remoteAddress;
                info.userAgent = userAgent;

                socketLog('ON ' + channelConfig.first, info);

                let onlineArr = [];
                if (onlineObj[roomId]) {
                    onlineArr = onlineObj[roomId];
                } else {
                    onlineObj[roomId] = onlineArr;
                }

                // 如果有人新上线，加进在线列表
                if (onlineArr.indexOf(myName) < 0) {
                    onlineArr.push(myName);
                    onlineObj[roomId] = onlineArr;
                    socketLog('EMIT ' + channelConfig.online, onlineArr);
                    if (common.mailNotify(roomId, myName)) {
                        mailService.sendText('[' + common.now() + '],房间[' + roomId + ']，用户[' + myName + ']加入' + '，remoteAddress: [' + remoteAddress + ']，userAgent: [' + userAgent + ']', 'CHATROOM LOGIN');
                    }
                    io.emit(getKey(channelConfig.online, roomId), onlineArr);
                }

                let lrangeRedisKey = getKey(redisConfig.msg, roomId);
                socketLog('LRANGE ' + lrangeRedisKey);
                // 拉取历史记录
                redis.lrangeRedis(lrangeRedisKey, function (res) {
                    let key = getKey(channelConfig.init, roomId);
                    socketLog('EMIT ' + key);
                    socket.emit(key, res);
                });
            });

            // 监听公共消息
            socket.on(channelConfig.common, function (obj) {
                socketLog('ON ' + channelConfig.common, obj);
                if (!(roomId && myName)) {
                    return;
                }

                let msgInfo = {
                    'time': common.now(),
                    'name': myName,
                    'roomId': roomId,
                    'msg': obj.msg,
                    'type': obj.type
                };

                // 推消息记录
                let key = getKey(channelConfig.common, roomId);
                socketLog('EMIT ' + key, msgInfo);
                if (common.mailNotify(roomId, myName)) {
                    mailService.sendText('[' + common.now() + '],房间[' + roomId + ']，用户[' + myName + ']，发言: [' + msgInfo.msg + ']，remoteAddress: [' + remoteAddress + ']，userAgent: [' + userAgent + ']', 'CHATROOM TALK');
                }
                io.emit(key, msgInfo);

                // 消息记录存redis
                let rpushRedisKey = getKey(redisConfig.msg, roomId);
                socketLog('RPUSH ' + rpushRedisKey);
                redis.rpushRedis(rpushRedisKey, JSON.stringify(msgInfo));
            });

            // 断开连接
            socket.on('disconnect', function () {
                socketLog('disconnect');
                if (!(roomId && myName)) {
                    return;
                }
                let onlineArr = onlineObj[roomId];
                if (onlineArr) {
                    let index = onlineArr.indexOf(myName);
                    if (index > -1) {
                        onlineArr.splice(index, 1);
                        onlineObj[roomId] = onlineArr;
                        let key = getKey(channelConfig.online, roomId);
                        socketLog('EMIT ' + key, onlineArr);
                        if (common.mailNotify(roomId, myName)) {
                            mailService.sendText('[' + common.now() + '],房间[' + roomId + ']，用户[' + myName + ']退出' + '，remoteAddress: [' + remoteAddress + ']，userAgent: [' + userAgent + ']', 'CHATROOM LOGOUT');
                        }
                        io.emit(key, onlineArr);
                    }
                }
            });
        });
    });
};
module.exports = chatroom;

